import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

// This uses a simple token = client ID for now (should be replaced with a real token system)
export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", token).eq("is_active", true).single();
  if (!client) notFound();

  const { data: deadlines } = await supabase
    .from("deadlines")
    .select("*, notice_type:notice_types(name, code)")
    .eq("client_id", token)
    .order("due_date", { ascending: true });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };

  const total = (deadlines ?? []).length;
  const completed = (deadlines ?? []).filter((d: any) => d.status === "confirmed" || d.status === "sent").length;
  const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{(client as any).name}</h2>
        <p className="text-muted-foreground">Compliance Status Overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Deadlines</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Compliance Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{complianceRate}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Deadline Status</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notice</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Confirmed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(deadlines ?? []).map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.notice_type?.name ?? "—"}</TableCell>
                  <TableCell>{format(new Date(d.due_date + "T00:00:00"), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[d.status] ?? ""}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.sent_at ? format(new Date(d.sent_at), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell>{d.confirmed_at ? format(new Date(d.confirmed_at), "MMM d, yyyy") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
