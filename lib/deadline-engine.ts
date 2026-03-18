import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type NoticeType = Database["public"]["Tables"]["notice_types"]["Row"];

export async function generateDeadlinesForClient(
  supabase: SupabaseClient<Database>,
  client: Client,
  planYear?: number
) {
  const targetYear = planYear ?? getNextPlanYear(client.plan_year_end);

  const { data: noticeTypesData } = await supabase
    .from("notice_types")
    .select("*")
    .eq("is_active", true)
    .in("frequency", ["annual", "quarterly"]);

  if (!noticeTypesData) return [];

  const noticeTypes = noticeTypesData as unknown as NoticeType[];

  const applicableNotices = noticeTypes.filter((nt) =>
    isNoticeApplicable(nt, client)
  );

  const deadlines = applicableNotices.flatMap((nt) => {
    if (nt.frequency === "quarterly") {
      return generateQuarterlyDeadlines(nt, client, targetYear);
    }
    const dueDate = calculateDueDate(nt, client.plan_year_end, targetYear);
    if (!dueDate) return [];
    return [
      {
        client_id: client.id,
        notice_type_id: nt.id,
        due_date: dueDate,
        status: "pending" as const,
        plan_year: targetYear,
      },
    ];
  });

  if (deadlines.length === 0) return [];

  const { data, error } = await supabase
    .from("deadlines")
    .upsert(deadlines, {
      onConflict: "client_id,notice_type_id,plan_year",
    })
    .select();

  if (error) throw new Error(error.message);
  return data ?? [];
}

function isNoticeApplicable(noticeType: NoticeType, client: Client): boolean {
  const tags = noticeType.applies_to ?? [];
  if (tags.includes("all")) return true;
  if (tags.includes("safe_harbor") && client.has_safe_harbor) return true;
  if (tags.includes("auto_enrollment") && client.has_auto_enrollment) return true;
  if (tags.includes("rmd") && client.has_rmd) return true;
  if (tags.includes(client.plan_type)) return true;
  return false;
}

function calculateDueDate(
  noticeType: NoticeType,
  planYearEnd: string,
  targetYear: number
): string | null {
  if (noticeType.days_before_plan_year_end === null) return null;

  const pyeDate = new Date(planYearEnd + "T00:00:00");
  const month = pyeDate.getUTCMonth();
  const day = pyeDate.getUTCDate();

  const daysOffset = noticeType.days_before_plan_year_end;

  if (daysOffset > 0) {
    // Due X days BEFORE the start of the plan year
    // Plan year start = day after PYE of the prior year
    // For a Dec 31 PYE, plan year start = Jan 1 of targetYear
    const planYearStart = new Date(
      Date.UTC(targetYear, (month + 1) % 12, day >= 28 ? 1 : day + 1)
    );
    // If month wraps (Dec -> Jan), year is already targetYear
    // If PYE is June 30, plan year start is July 1 of targetYear-1
    if ((month + 1) % 12 > month) {
      // No wrap, PY start is same calendar year as PYE
      planYearStart.setUTCFullYear(targetYear - 1);
    }

    const dueDate = new Date(planYearStart);
    dueDate.setUTCDate(dueDate.getUTCDate() - daysOffset);
    return dueDate.toISOString().split("T")[0];
  } else {
    // Due X days AFTER plan year end
    const planYearEndDate = new Date(Date.UTC(targetYear - 1, month, day));
    // For a Dec 31 PYE targeting 2026, the plan year that ended is Dec 31 2025
    const dueDate = new Date(planYearEndDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + Math.abs(daysOffset));
    return dueDate.toISOString().split("T")[0];
  }
}

function generateQuarterlyDeadlines(
  noticeType: NoticeType,
  client: Client,
  targetYear: number
) {
  // Generate 4 quarterly deadlines, each 45 days after quarter end
  const pyeDate = new Date(client.plan_year_end + "T00:00:00");
  const pyeMonth = pyeDate.getUTCMonth();

  const deadlines = [];
  for (let q = 0; q < 4; q++) {
    const quarterEndMonth = (pyeMonth + 3 * (q + 1)) % 12;
    const quarterEndYear =
      pyeMonth + 3 * (q + 1) >= 12 ? targetYear : targetYear - 1;
    const quarterEnd = new Date(
      Date.UTC(quarterEndYear, quarterEndMonth + 1, 0)
    ); // last day of month
    const dueDate = new Date(quarterEnd);
    dueDate.setUTCDate(dueDate.getUTCDate() + 45);

    deadlines.push({
      client_id: client.id,
      notice_type_id: noticeType.id,
      due_date: dueDate.toISOString().split("T")[0],
      status: "pending" as const,
      plan_year: targetYear,
    });
  }
  return deadlines;
}

function getNextPlanYear(planYearEnd: string): number {
  const now = new Date();
  const pye = new Date(planYearEnd + "T00:00:00");
  const thisYearPye = new Date(
    Date.UTC(now.getFullYear(), pye.getUTCMonth(), pye.getUTCDate())
  );

  if (thisYearPye >= now) return now.getFullYear();
  return now.getFullYear() + 1;
}
