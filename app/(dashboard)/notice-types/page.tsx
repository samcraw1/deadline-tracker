import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type NoticeType = Database["public"]["Tables"]["notice_types"]["Row"];
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { NoticeTypeDialog } from "@/components/notice-types/notice-type-dialog";

export default async function NoticeTypesPage() {
  const supabase = await createClient();

  const { data: noticeTypesData } = await supabase
    .from("notice_types")
    .select("*")
    .order("name");

  const noticeTypes = (noticeTypesData ?? []) as unknown as NoticeType[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notice Types</h1>
          <p className="text-muted-foreground">
            DOL required notice types that drive deadline generation.
          </p>
        </div>
        <NoticeTypeDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noticeTypes.map((nt) => (
              <TableRow key={nt.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{nt.name}</p>
                    {nt.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                        {nt.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {nt.code}
                  </code>
                </TableCell>
                <TableCell>
                  {nt.days_before_plan_year_end !== null
                    ? nt.days_before_plan_year_end > 0
                      ? `${nt.days_before_plan_year_end}d before PY start`
                      : `${Math.abs(nt.days_before_plan_year_end)}d after PY end`
                    : "Event-driven"}
                </TableCell>
                <TableCell>
                  {FREQUENCY_LABELS[nt.frequency] ?? nt.frequency}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(nt.applies_to ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={nt.is_active ? "default" : "secondary"}>
                    {nt.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
