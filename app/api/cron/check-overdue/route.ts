import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().split("T")[0];

  // Mark overdue deadlines
  const { data: overdueDeadlines } = await supabase
    .from("deadlines")
    .update({ status: "overdue" })
    .eq("status", "pending")
    .lt("due_date", today)
    .select("id, client_id, assigned_to");

  // Log alerts
  if (overdueDeadlines?.length) {
    const alerts = overdueDeadlines.map((d) => ({
      deadline_id: d.id,
      client_id: d.client_id,
      alert_type: "overdue" as const,
      channel: "in_app" as const,
      sent_to: d.assigned_to ?? "unassigned",
      delivered: true,
    }));
    await supabase.from("alert_log").insert(alerts);
  }

  return NextResponse.json({
    marked_overdue: overdueDeadlines?.length ?? 0,
    timestamp: new Date().toISOString(),
  });
}
