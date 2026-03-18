import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeadlineStatusBadge } from "@/components/deadlines/deadline-status-badge";
import { DeadlineCountdown } from "@/components/deadlines/deadline-countdown";
import { UpdateStatusDialog } from "@/components/deadlines/update-status-dialog";
import { Users, CalendarClock, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { DeadlineWithJoins } from "@/lib/types/queries";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const weekFromNow = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];

  const [clientsResult, upcomingResult, overdueResult, pendingConfResult] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id", { count: "exact" })
        .eq("is_active", true),
      supabase
        .from("deadlines")
        .select("*, client:clients(id, name), notice_type:notice_types(name, code)")
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(15),
      supabase
        .from("deadlines")
        .select("*, client:clients(id, name), notice_type:notice_types(name, code)")
        .in("status", ["overdue"])
        .order("due_date", { ascending: true }),
      supabase
        .from("deadlines")
        .select("id", { count: "exact" })
        .eq("status", "sent"),
    ]);

  const dueThisWeekResult = await supabase
    .from("deadlines")
    .select("id", { count: "exact" })
    .eq("status", "pending")
    .gte("due_date", today)
    .lte("due_date", weekFromNow);

  const totalClients = clientsResult.count ?? 0;
  const dueThisWeek = dueThisWeekResult.count ?? 0;
  const pendingConfirmation = pendingConfResult.count ?? 0;
  const upcoming = (upcomingResult.data ?? []) as unknown as DeadlineWithJoins[];
  const overdue = (overdueResult.data ?? []) as unknown as DeadlineWithJoins[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage compliance deadlines across all clients.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users style={{ width: 16, height: 16, color: "#003366" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <CalendarClock style={{ width: 16, height: 16, color: "#003366" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueThisWeek}</div>
          </CardContent>
        </Card>

        <Card
          style={
            overdue.length > 0
              ? { border: "2px solid #fca5a5", backgroundColor: "#fef2f2", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
              : { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle
              className={overdue.length > 0 ? "animate-pulse" : ""}
              style={{ width: 20, height: 20, color: overdue.length > 0 ? "#DC3545" : "#003366" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="font-bold"
              style={
                overdue.length > 0
                  ? { fontSize: "1.875rem", color: "#DC3545" }
                  : { fontSize: "1.5rem" }
              }
            >
              {overdue.length}
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Awaiting Confirmation
            </CardTitle>
            <CheckCircle style={{ width: 16, height: 16, color: "#003366" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingConfirmation}</div>
          </CardContent>
        </Card>
      </div>

      {overdue.length > 0 && (
        <Card style={{ border: "2px solid #fca5a5", backgroundColor: "#fff5f5" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#DC3545" }}>
              <AlertTriangle style={{ width: 20, height: 20 }} />
              Overdue Deadlines — Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Notice</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Overdue By</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((d) => (
                  <TableRow
                    key={d.id}
                    style={{
                      backgroundColor: "#fef2f2",
                      borderLeft: "4px solid #DC3545",
                    }}
                  >
                    <TableCell>
                      <Link
                        href={`/clients/${d.client_id}`}
                        className="font-medium hover:underline"
                      >
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle style={{ width: 14, height: 14, color: "#DC3545" }} />
                          {d.client?.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{d.notice_type?.name}</TableCell>
                    <TableCell>{d.due_date}</TableCell>
                    <TableCell>
                      <DeadlineCountdown dueDate={d.due_date} />
                    </TableCell>
                    <TableCell>
                      <UpdateStatusDialog
                        deadlineId={d.id}
                        currentStatus={d.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">No upcoming deadlines.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Notice</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Countdown</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link
                        href={`/clients/${d.client_id}`}
                        className="font-medium hover:underline"
                      >
                        {d.client?.name}
                      </Link>
                    </TableCell>
                    <TableCell>{d.notice_type?.name}</TableCell>
                    <TableCell>{d.due_date}</TableCell>
                    <TableCell>
                      <DeadlineCountdown dueDate={d.due_date} />
                    </TableCell>
                    <TableCell>
                      <DeadlineStatusBadge status={d.status} />
                    </TableCell>
                    <TableCell>
                      <UpdateStatusDialog
                        deadlineId={d.id}
                        currentStatus={d.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
