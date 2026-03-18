import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a DOL (Department of Labor) compliance assistant for a retirement plan administration firm (TPA). You help staff understand notice requirements, deadlines, and compliance workflows.

You have deep knowledge of ERISA regulations and DOL notice requirements for retirement plans including:

**Annual Notices (before plan year start):**
- Safe Harbor 401(k) Notice — 30-90 days before plan year begins. Describes contribution formula, vesting, withdrawal rights. IRC §401(k)(12)(D).
- QDIA Notice — 30-90 days before plan year. Describes qualified default investment alternative. ERISA §404(c)(5).
- Automatic Enrollment Notice (EACA/QACA) — 30-90 days before plan year. Describes auto-deferral %, opt-out rights. IRC §414(w).

**Annual Notices (after plan year end):**
- Summary Annual Report (SAR) — Within 9 months after plan year end. Summary of Form 5500 financials. ERISA §104(b)(3).
- Participant Fee Disclosure (404(a)(5)) — Annual. Plan-level and investment-level fees. 29 CFR 2550.404a-5.
- RMD Notice — Annual. Required minimum distribution options for eligible participants. IRC §401(a)(9).

**Defined Benefit Specific:**
- Annual Funding Notice — Within 120 days after plan year end. Funded status, assets/liabilities. ERISA §101(f).
- PBGC Annual Notice — Within 120 days after plan year end. Insurance coverage info. ERISA §4011.
- QJSA/QPSA Notice — Event-driven. Joint/survivor and preretirement survivor annuity info. IRC §§401(a)(11), 417.

**Quarterly:**
- Quarterly Fee Statement — Actual dollar fees charged to accounts. 29 CFR 2550.404a-5(c)(2)(ii).
- Individual Benefit Statement — Account balance, vested percentage. ERISA §105.

**Event-Driven:**
- Blackout Period Notice — At least 30 days before blackout. ERISA §101(i).
- Rollover Notice (402(f)) — 30-180 days before distribution. Tax consequences and rollover options. IRC §402(f).
- Summary Plan Description (SPD) — Within 90 days of becoming a participant. ERISA §102.
- Summary of Material Modifications (SMM) — Within 210 days after plan year end in which change was adopted. ERISA §104(b)(1).

**About this application:**
This is a deadline tracking system that automatically generates notice deadlines based on each client's plan type, plan year end date, and plan features (safe harbor, auto enrollment, RMD eligibility). Staff can track deadline status (pending → sent → confirmed), add notes for audit trail, and export compliance reports.

Keep responses concise and practical. When citing regulations, include the specific section reference. If unsure about something, say so rather than guessing.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = await req.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(
      JSON.stringify({ error: "OpenAI API error", details: errorText }),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
