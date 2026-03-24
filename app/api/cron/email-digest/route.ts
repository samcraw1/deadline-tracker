import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const [overdueResult, upcomingResult, completedResult] = await Promise.all([
    supabase.from("deadlines").select("*, client:clients(name), notice_type:notice_types(name)").eq("status", "overdue"),
    supabase
      .from("deadlines")
      .select("*, client:clients(name), notice_type:notice_types(name)")
      .eq("status", "pending")
      .gte("due_date", today)
      .lte("due_date", weekFromNow),
    supabase.from("deadlines").select("id", { count: "exact" }).in("status", ["sent", "confirmed"]),
  ]);

  const digest = {
    generated_at: new Date().toISOString(),
    overdue: (overdueResult.data ?? []).map((d: any) => ({
      client: d.client?.name,
      notice: d.notice_type?.name,
      due_date: d.due_date,
    })),
    upcoming_this_week: (upcomingResult.data ?? []).map((d: any) => ({
      client: d.client?.name,
      notice: d.notice_type?.name,
      due_date: d.due_date,
    })),
    summary: {
      total_overdue: overdueResult.data?.length ?? 0,
      due_this_week: upcomingResult.data?.length ?? 0,
      total_completed: completedResult.count ?? 0,
    },
  };

  // In production, this would send an email via Resend/SendGrid
  // For now, return the digest as JSON
  return NextResponse.json(digest);
}
