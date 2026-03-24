export async function fireWebhook(event: string, data: Record<string, unknown>) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
      }),
    });
  } catch {
    console.error("Webhook delivery failed");
  }
}
