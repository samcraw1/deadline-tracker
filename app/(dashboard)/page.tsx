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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueThisWeek}</div>
          </CardContent>
        </Card>

        <Card className={overdue.length > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${overdue.length > 0 ? "text-red-600" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${overdue.length > 0 ? "text-red-600" : ""}`}
            >
              {overdue.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Awaiting Confirmation
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingConfirmation}</div>
          </CardContent>
        </Card>
      </div>

      {overdue.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Overdue Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Notice</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((d) => (
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

      <Card>
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
