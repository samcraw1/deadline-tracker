"use client";

import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { CalendarClock, Clock, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpdateStatusDialog } from "@/components/deadlines/update-status-dialog";
import { STATUS_COLORS } from "@/lib/constants";
import type { DeadlineWithJoins } from "@/lib/types/queries";

const COLUMNS = [
  { key: "pending", label: "Pending" },
  { key: "sent", label: "Sent" },
  { key: "confirmed", label: "Confirmed" },
  { key: "overdue", label: "Overdue" },
] as const;

function CountdownBadge({ dueDate }: { dueDate: string }) {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = differenceInCalendarDays(due, today);

  let label: string;
  let variant: "default" | "secondary" | "destructive" | "outline";

  if (diff < 0) {
    label = `${Math.abs(diff)}d overdue`;
    variant = "destructive";
  } else if (diff === 0) {
    label = "Due today";
    variant = "destructive";
  } else if (diff <= 7) {
    label = `${diff}d left`;
    variant = "default";
  } else if (diff <= 30) {
    label = `${diff}d left`;
    variant = "secondary";
  } else {
    label = `${diff}d left`;
    variant = "outline";
  }

  return (
    <Badge variant={variant} className="text-xs font-medium">
      <Clock className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

function KanbanCard({ deadline }: { deadline: DeadlineWithJoins }) {
  const colors = STATUS_COLORS[deadline.status] ?? STATUS_COLORS.pending;

  return (
    <Card
      className="transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: 3, borderLeftColor: colors.border }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/clients/${deadline.client_id}`}
            className="font-semibold text-sm leading-tight hover:underline"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {deadline.client?.name ?? "Unknown Client"}
            </span>
          </Link>
          <CountdownBadge dueDate={deadline.due_date} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {deadline.notice_type
              ? `${deadline.notice_type.code} - ${deadline.notice_type.name}`
              : "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span>Due {format(new Date(deadline.due_date), "MMM d, yyyy")}</span>
        </div>

        {deadline.plan_year && (
          <div className="text-xs text-muted-foreground">
            Plan Year: {deadline.plan_year}
          </div>
        )}

        <div className="pt-1">
          <UpdateStatusDialog
            deadlineId={deadline.id}
            currentStatus={deadline.status}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({
  deadlines,
}: {
  deadlines: DeadlineWithJoins[];
}) {
  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.key] = deadlines.filter((d) => d.status === col.key);
      return acc;
    },
    {} as Record<string, DeadlineWithJoins[]>,
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const items = grouped[col.key] ?? [];
        const colors = STATUS_COLORS[col.key];

        return (
          <div key={col.key} className="flex-shrink-0" style={{ minWidth: 280 }}>
            {/* Column header */}
            <div
              className="rounded-t-lg px-4 py-3 flex items-center justify-between"
              style={{
                backgroundColor: colors.bg,
                borderBottom: `2px solid ${colors.border}`,
              }}
            >
              <h2
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: colors.text }}
              >
                {col.label}
              </h2>
              <span
                className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: colors.border,
                  color: colors.text,
                }}
              >
                {items.length}
              </span>
            </div>

            {/* Card list */}
            <div
              className="space-y-3 rounded-b-lg border border-t-0 bg-muted/30 p-3 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 240px)" }}
            >
              {items.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No deadlines
                </p>
              ) : (
                items.map((deadline) => (
                  <KanbanCard key={deadline.id} deadline={deadline} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
