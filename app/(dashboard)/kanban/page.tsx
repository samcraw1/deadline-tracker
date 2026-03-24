import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { DeadlineWithJoins } from "@/lib/types/queries";

export const metadata = {
  title: "Kanban Board",
};

export default async function KanbanPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deadlines")
    .select("*, client:clients(id, name), notice_type:notice_types(name, code)")
    .order("due_date", { ascending: true });

  const deadlines = (data ?? []) as DeadlineWithJoins[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
        <p className="text-muted-foreground">
          Track deadline progress across all stages.
        </p>
      </div>
      <KanbanBoard deadlines={deadlines} />
    </div>
  );
}
