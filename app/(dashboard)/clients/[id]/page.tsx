import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { PLAN_TYPE_LABELS, ALERT_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { RegenerateButton } from "@/components/clients/regenerate-button";
import { ExportButton } from "@/components/clients/export-button";
import type { DeadlineWithNoticeType, AlertWithJoins } from "@/lib/types/queries";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  // Cast to get around supabase-js type inference issues
  const client = clientData as unknown as {
    id: string;
    name: string;
    plan_type: string;
    plan_year_end: string;
    participant_count: number | null;
    contact_name: string | null;
    contact_email: string | null;
    has_safe_harbor: boolean;
    has_auto_enrollment: boolean;
    has_rmd: boolean;
  } | null;

  if (!client) notFound();

  const [deadlinesResult, alertsResult] = await Promise.all([
    supabase
      .from("deadlines")
      .select("*, notice_type:notice_types(name, code)")
      .eq("client_id", id)
      .order("due_date", { ascending: true }),
    supabase
      .from("alert_log")
      .select("*, deadline:deadlines(due_date, notice_type:notice_types(name))")
      .eq("client_id", id)
      .order("sent_at", { ascending: false })
      .limit(50),
  ]);

  const deadlines = (deadlinesResult.data ?? []) as unknown as DeadlineWithNoticeType[];
  const alerts = (alertsResult.data ?? []) as unknown as AlertWithJoins[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <div className="flex gap-2">
          <ExportButton clientId={client.id} clientName={client.name} deadlines={deadlines} />
          <RegenerateButton clientId={client.id} />
          <Link href={`/clients/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan Type</p>
              <p className="font-medium">
                {PLAN_TYPE_LABELS[client.plan_type] ?? client.plan_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan Year End</p>
              <p className="font-medium">
                {format(new Date(client.plan_year_end + "T00:00:00"), "MMMM d")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="font-medium">{client.participant_count ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{client.contact_name ?? "—"}</p>
              {client.contact_email && (
                <p className="text-sm text-muted-foreground">{client.contact_email}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {client.has_safe_harbor && <Badge variant="secondary">Safe Harbor</Badge>}
            {client.has_auto_enrollment && <Badge variant="secondary">Auto Enrollment</Badge>}
            {client.has_rmd && <Badge variant="secondary">RMD</Badge>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="deadlines">
        <TabsList>
          <TabsTrigger value="deadlines">
            Deadlines ({deadlines.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alert History ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deadlines">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No deadlines generated yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  deadlines.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        {d.notice_type?.name}
                      </TableCell>
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
        </TabsContent>

        <TabsContent value="alerts">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Notice</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Sent To</TableHead>
                  <TableHead>Delivered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No alerts sent yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        {format(new Date(a.sent_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ALERT_TYPE_LABELS[a.alert_type] ?? a.alert_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {a.deadline?.notice_type?.name ?? "—"}
                      </TableCell>
                      <TableCell>{a.channel}</TableCell>
                      <TableCell>{a.sent_to}</TableCell>
                      <TableCell>{a.delivered ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
