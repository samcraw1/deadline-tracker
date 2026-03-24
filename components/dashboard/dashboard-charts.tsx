"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_COLORS: Record<string, string> = {
  overdue: "#DC3545",
  pending: "#FFC107",
  sent: "#0066CC",
  confirmed: "#28A745",
};

type DashboardChartsProps = {
  statusCounts: { status: string; count: number }[];
  monthlyData: {
    month: string;
    pending: number;
    sent: number;
    confirmed: number;
    overdue: number;
  }[];
  complianceRate: number;
  topOverdueClients: { name: string; count: number }[];
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-muted-foreground text-sm">
      {message}
    </div>
  );
}

export function DashboardCharts({
  statusCounts,
  monthlyData,
  complianceRate,
  topOverdueClients,
}: DashboardChartsProps) {
  const hasStatusData = statusCounts.length > 0 && statusCounts.some((s) => s.count > 0);
  const hasMonthlyData = monthlyData.length > 0 && monthlyData.some(
    (m) => m.pending + m.sent + m.confirmed + m.overdue > 0
  );
  const hasOverdueClients = topOverdueClients.length > 0 && topOverdueClients.some((c) => c.count > 0);
  const totalDeadlines = statusCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Status Distribution - Donut Chart */}
      <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <CardHeader>
          <CardTitle className="text-base">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasStatusData ? (
            <EmptyState message="No deadline data available." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ name, value }: { name?: string; value?: number }) =>
                    `${name ?? ""}: ${value ?? 0}`
                  }
                >
                  {statusCounts.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    String(name).charAt(0).toUpperCase() + String(name).slice(1),
                  ]}
                />
                <Legend
                  formatter={(value: string) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend - Stacked Bar Chart */}
      <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <CardHeader>
          <CardTitle className="text-base">Monthly Trend (Next 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasMonthlyData ? (
            <EmptyState message="No upcoming deadlines to display." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Legend
                  formatter={(value: string) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  }
                />
                <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} />
                <Bar dataKey="sent" stackId="a" fill={STATUS_COLORS.sent} />
                <Bar dataKey="confirmed" stackId="a" fill={STATUS_COLORS.confirmed} />
                <Bar dataKey="overdue" stackId="a" fill={STATUS_COLORS.overdue} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Compliance Rate */}
      <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <CardHeader>
          <CardTitle className="text-base">Compliance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          {totalDeadlines === 0 ? (
            <EmptyState message="No deadlines to calculate compliance." />
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center gap-3">
              <div
                className="text-6xl font-bold"
                style={{
                  color:
                    complianceRate >= 80
                      ? STATUS_COLORS.confirmed
                      : complianceRate >= 50
                        ? STATUS_COLORS.pending
                        : STATUS_COLORS.overdue,
                }}
              >
                {complianceRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">
                of deadlines are sent or confirmed
              </p>
              <div className="mt-2 h-3 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(complianceRate, 100)}%`,
                    backgroundColor:
                      complianceRate >= 80
                        ? STATUS_COLORS.confirmed
                        : complianceRate >= 50
                          ? STATUS_COLORS.pending
                          : STATUS_COLORS.overdue,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Clients by Overdue - Horizontal Bar Chart */}
      <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <CardHeader>
          <CardTitle className="text-base">Top Clients by Overdue</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasOverdueClients ? (
            <EmptyState message="No overdue deadlines. Great job!" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topOverdueClients}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  fontSize={12}
                  tick={{ fill: "#374151" }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={STATUS_COLORS.overdue}
                  radius={[0, 4, 4, 0]}
                  name="Overdue"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
