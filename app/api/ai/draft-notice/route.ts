import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

  const { noticeType, clientName, planType, dueDate } = await req.json();

  const prompt = `Draft a brief, professional compliance notice for the following:
- Notice Type: ${noticeType}
- Client/Plan: ${clientName}
- Plan Type: ${planType}
- Due Date: ${dueDate}

Write 2-3 paragraphs that could be sent to plan participants. Include relevant regulatory references. Keep it concise and compliant.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a DOL compliance expert drafting retirement plan notices. Be precise, professional, and include regulatory citations." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: "AI generation failed", details: err }, { status: 500 });
  }

  const data = await response.json();
  const draft = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ draft });
}
