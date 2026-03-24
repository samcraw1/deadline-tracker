import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const configured = !!process.env.WEBHOOK_URL;
  return NextResponse.json({ configured, url: configured ? "***configured***" : null });
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "No webhook URL configured" }, { status: 400 });
  }
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "test",
        timestamp: new Date().toISOString(),
        data: { message: "Test webhook from Deadline Tracker" },
      }),
    });
    return NextResponse.json({ success: response.ok, status: response.status });
  } catch {
    return NextResponse.json({ error: "Webhook delivery failed" }, { status: 500 });
  }
}
