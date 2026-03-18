import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PLAN_TYPE_LABELS } from "@/lib/constants";
import { Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  const { data: clientsData } = await query;
  const clients = (clientsData ?? []) as unknown as Client[];

  // Get deadline counts per client
  const clientIds = clients.map((c) => c.id);
  const { data: deadlineCountsData } = clientIds.length > 0
    ? await supabase
        .from("deadlines")
        .select("client_id")
        .in("client_id", clientIds)
        .in("status", ["pending", "overdue"])
    : { data: [] as { client_id: string }[] };

  const countMap: Record<string, number> = {};
  ((deadlineCountsData ?? []) as { client_id: string }[]).forEach((d) => {
    countMap[d.client_id] = (countMap[d.client_id] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Plan Type</TableHead>
              <TableHead>Plan Year End</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Active Deadlines</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No clients yet. Add your first client to get started.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link href={`/clients/${client.id}`} className="hover:underline">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {PLAN_TYPE_LABELS[client.plan_type] ?? client.plan_type}
                  </TableCell>
                  <TableCell>
                    {format(new Date(client.plan_year_end + "T00:00:00"), "MMM d")}
                  </TableCell>
                  <TableCell>{client.participant_count ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {client.has_safe_harbor && (
                        <Badge variant="secondary" className="text-xs">SH</Badge>
                      )}
                      {client.has_auto_enrollment && (
                        <Badge variant="secondary" className="text-xs">AE</Badge>
                      )}
                      {client.has_rmd && (
                        <Badge variant="secondary" className="text-xs">RMD</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{countMap[client.id] ?? 0}</TableCell>
                  <TableCell>
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
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
