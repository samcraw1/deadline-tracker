import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ALERT_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

type AlertRow = {
  id: string;
  sent_at: string;
  alert_type: string;
  channel: string;
  sent_to: string;
  delivered: boolean;
  client: { id: string; name: string } | null;
  deadline: { due_date: string; notice_type: { name: string } | null } | null;
};

export default async function AlertsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("alert_log")
    .select(
      "*, client:clients(id, name), deadline:deadlines(due_date, notice_type:notice_types(name))"
    )
    .order("sent_at", { ascending: false })
    .limit(100);

  const alerts = (data ?? []) as unknown as AlertRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alert Log</h1>
      <p className="text-muted-foreground">
        Audit trail of all alerts sent for DOL compliance.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Notice</TableHead>
              <TableHead>Alert Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Sent To</TableHead>
              <TableHead>Delivered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                    <Link
                      href={`/clients/${a.client?.id}`}
                      className="hover:underline"
                    >
                      {a.client?.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {a.deadline?.notice_type?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ALERT_TYPE_LABELS[a.alert_type] ?? a.alert_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.channel}</TableCell>
                  <TableCell>{a.sent_to}</TableCell>
                  <TableCell>
                    {a.delivered ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
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
