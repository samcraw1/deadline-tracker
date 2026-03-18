import { createClient } from "@/lib/supabase/server";
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
import { DeadlineFilters } from "@/components/deadlines/deadline-filters";
import { UpdateStatusDialog } from "@/components/deadlines/update-status-dialog";
import { format } from "date-fns";
import Link from "next/link";
import type { DeadlineWithJoins } from "@/lib/types/queries";

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{
    client?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("deadlines")
    .select("*, client:clients(id, name), notice_type:notice_types(name, code)")
    .order("due_date", { ascending: true });

  if (params.client) query = query.eq("client_id", params.client);
  if (params.status) query = query.eq("status", params.status as "pending" | "sent" | "confirmed" | "overdue");
  if (params.from) query = query.gte("due_date", params.from);
  if (params.to) query = query.lte("due_date", params.to);

  const [deadlinesResult, clientsResult] = await Promise.all([
    query,
    supabase.from("clients").select("id, name").eq("is_active", true).order("name"),
  ]);

  const deadlines = (deadlinesResult.data ?? []) as unknown as DeadlineWithJoins[];
  const clients = (clientsResult.data ?? []) as { id: string; name: string }[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deadlines</h1>

      <DeadlineFilters clients={clients} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Notice Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Countdown</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan Year</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deadlines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No deadlines found.
                </TableCell>
              </TableRow>
            ) : (
              deadlines.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      href={`/clients/${d.client?.id}`}
                      className="font-medium hover:underline"
                    >
                      {d.client?.name}
                    </Link>
                  </TableCell>
                  <TableCell>{d.notice_type?.name}</TableCell>
                  <TableCell>
                    {format(new Date(d.due_date + "T00:00:00"), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DeadlineCountdown dueDate={d.due_date} />
                  </TableCell>
                  <TableCell>
                    <DeadlineStatusBadge status={d.status} />
                  </TableCell>
                  <TableCell>{d.plan_year}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {d.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <UpdateStatusDialog
                      deadlineId={d.id}
                      currentStatus={d.status}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
