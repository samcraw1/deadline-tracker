import { SupabaseClient } from "@supabase/supabase-js";
import { format, addMonths } from "date-fns";

type StatusCounts = { status: string; count: number }[];
type MonthlyData = {
  month: string;
  pending: number;
  sent: number;
  confirmed: number;
  overdue: number;
}[];
type TopOverdueClients = { name: string; count: number }[];

export type DashboardChartData = {
  statusCounts: StatusCounts;
  monthlyData: MonthlyData;
  complianceRate: number;
  topOverdueClients: TopOverdueClients;
};

export async function getDashboardChartData(
  supabase: SupabaseClient
): Promise<DashboardChartData> {
  const { data: allDeadlines } = await supabase
    .from("deadlines")
    .select("status, due_date, client_id, client:clients(name)");

  const deadlines = allDeadlines ?? [];

  // 1. Status counts for the pie chart
  const statusMap: Record<string, number> = {
    pending: 0,
    sent: 0,
    confirmed: 0,
    overdue: 0,
  };
  for (const d of deadlines) {
    const s = d.status as string;
    if (s in statusMap) {
      statusMap[s]++;
    }
  }
  const statusCounts: StatusCounts = Object.entries(statusMap).map(
    ([status, count]) => ({ status, count })
  );

  // 2. Monthly data for the next 6 months
  const now = new Date();
  const monthlyData: MonthlyData = [];
  for (let i = 0; i < 6; i++) {
    const monthDate = addMonths(now, i);
    const monthKey = format(monthDate, "yyyy-MM");
    const monthLabel = format(monthDate, "MMM yyyy");
    const bucket = { month: monthLabel, pending: 0, sent: 0, confirmed: 0, overdue: 0 };

    for (const d of deadlines) {
      if (!d.due_date) continue;
      const dueMonth = (d.due_date as string).slice(0, 7); // "yyyy-MM"
      if (dueMonth === monthKey) {
        const s = d.status as string;
        if (s === "pending") bucket.pending++;
        else if (s === "sent") bucket.sent++;
        else if (s === "confirmed") bucket.confirmed++;
        else if (s === "overdue") bucket.overdue++;
      }
    }

    monthlyData.push(bucket);
  }

  // 3. Compliance rate
  const total = deadlines.length;
  const compliant = deadlines.filter(
    (d) => d.status === "sent" || d.status === "confirmed"
  ).length;
  const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

  // 4. Top 5 clients by overdue count
  const overdueByClient: Record<string, number> = {};
  for (const d of deadlines) {
    if (d.status !== "overdue") continue;
    const clientRecord = d.client as { name: string }[] | { name: string } | null;
    const clientName = Array.isArray(clientRecord)
      ? clientRecord[0]?.name ?? "Unknown"
      : clientRecord?.name ?? "Unknown";
    overdueByClient[clientName] = (overdueByClient[clientName] ?? 0) + 1;
  }
  const topOverdueClients: TopOverdueClients = Object.entries(overdueByClient)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    statusCounts,
    monthlyData,
    complianceRate,
    topOverdueClients,
  };
}
