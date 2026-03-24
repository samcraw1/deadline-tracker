"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
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
import { BulkActionBar } from "@/components/deadlines/bulk-action-bar";

type DeadlineRow = {
  id: string;
  client_id: string;
  due_date: string;
  status: string;
  plan_year: number;
  notes: string | null;
  client: { id: string; name: string } | null;
  notice_type: { name: string; code: string } | null;
};

export function DeadlinesTableWithBulk({
  deadlines,
}: {
  deadlines: DeadlineRow[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleAll() {
    if (selected.size === deadlines.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(deadlines.map((d) => d.id)));
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  const flatDeadlines = deadlines.map((d) => ({
    id: d.id,
    status: d.status,
    client_name: d.client?.name ?? "",
    notice_type_name: d.notice_type?.name ?? "",
    due_date: d.due_date,
  }));

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selected.size === deadlines.length && deadlines.length > 0
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
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
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  No deadlines found.
                </TableCell>
              </TableRow>
            ) : (
              deadlines.map((d) => (
                <TableRow
                  key={d.id}
                  className={selected.has(d.id) ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(d.id)}
                      onCheckedChange={() => toggle(d.id)}
                    />
                  </TableCell>
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
                    {format(
                      new Date(d.due_date + "T00:00:00"),
                      "MMM d, yyyy"
                    )}
                  </TableCell>
                  <TableCell>
                    <DeadlineCountdown dueDate={d.due_date} />
                  </TableCell>
                  <TableCell>
                    <DeadlineStatusBadge status={d.status} />
                  </TableCell>
                  <TableCell>{d.plan_year}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {d.notes ?? "\u2014"}
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
      <BulkActionBar
        selectedIds={Array.from(selected)}
        deadlines={flatDeadlines}
        onClear={() => setSelected(new Set())}
      />
    </>
  );
}
