import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Get all pending/overdue deadlines with client info
  const { data: deadlines } = await supabase
    .from("deadlines")
    .select("*, client:clients(id, name), notice_type:notice_types(name, code)")
    .in("status", ["pending", "overdue"])
    .order("due_date");

  if (!deadlines) return NextResponse.json([]);

  const today = new Date();
  const scored = deadlines.map((d: any) => {
    const dueDate = new Date(d.due_date + "T00:00:00");
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
    let riskScore = 0;

    // Overdue = highest risk
    if (d.status === "overdue") riskScore = 100;
    else if (daysUntilDue <= 0) riskScore = 95;
    else if (daysUntilDue <= 7) riskScore = 80;
    else if (daysUntilDue <= 14) riskScore = 60;
    else if (daysUntilDue <= 30) riskScore = 40;
    else if (daysUntilDue <= 60) riskScore = 20;
    else riskScore = 10;

    const riskLevel = riskScore >= 80 ? "critical" : riskScore >= 50 ? "high" : riskScore >= 30 ? "medium" : "low";

    return {
      id: d.id,
      client_name: d.client?.name,
      notice_type: d.notice_type?.name,
      due_date: d.due_date,
      days_until_due: daysUntilDue,
      risk_score: riskScore,
      risk_level: riskLevel,
      status: d.status,
    };
  });

  scored.sort((a: any, b: any) => b.risk_score - a.risk_score);
  return NextResponse.json(scored);
}
