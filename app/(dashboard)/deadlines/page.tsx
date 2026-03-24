import { createClient } from "@/lib/supabase/server";
import { DeadlineFilters } from "@/components/deadlines/deadline-filters";
import { DeadlinesTableWithBulk } from "@/components/deadlines/deadlines-table-with-bulk";
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

      <DeadlinesTableWithBulk deadlines={deadlines} />
    </div>
  );
}
