import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarNav } from "@/components/calendar/calendar-nav";
import { STATUS_COLORS } from "@/lib/constants";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday,
} from "date-fns";
import type { DeadlineWithJoins } from "@/lib/types/queries";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const monthParam = params.month; // e.g. "2026-03"

  // Determine which month to display
  let viewDate: Date;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    viewDate = new Date(year, month - 1, 1);
  } else {
    viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const currentMonthStr = format(viewDate, "yyyy-MM");

  // Fetch deadlines for this month
  const supabase = await createClient();
  const { data } = await supabase
    .from("deadlines")
    .select(
      "*, client:clients(id, name), notice_type:notice_types(name, code)"
    )
    .gte("due_date", format(monthStart, "yyyy-MM-dd"))
    .lte("due_date", format(monthEnd, "yyyy-MM-dd"))
    .order("due_date");

  const deadlines = (data ?? []) as unknown as DeadlineWithJoins[];

  // Build a map of date string -> deadlines
  const deadlinesByDate = new Map<string, DeadlineWithJoins[]>();
  for (const d of deadlines) {
    const key = d.due_date;
    if (!deadlinesByDate.has(key)) {
      deadlinesByDate.set(key, []);
    }
    deadlinesByDate.get(key)!.push(d);
  }

  // Generate days of the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding days at the start (empty cells for days before the 1st)
  const startPadding = getDay(monthStart); // 0 = Sunday

  // Total cells needed (padding + actual days), fill remaining to complete last row
  const totalCells = startPadding + days.length;
  const endPadding = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monthly view of all compliance deadlines.
          </p>
        </div>
        <CalendarNav currentMonth={currentMonthStr} />
      </div>

      <Card style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <CardContent className="p-0">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#003366", backgroundColor: "#f8fafc" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Start padding */}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div
                key={`pad-start-${i}`}
                className="min-h-[110px] border-b border-r p-1"
                style={{ backgroundColor: "#f9fafb" }}
              />
            ))}

            {/* Actual days */}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayDeadlines = deadlinesByDate.get(dateStr) ?? [];
              const today = isToday(day);

              return (
                <div
                  key={dateStr}
                  className="min-h-[110px] border-b border-r p-1.5 flex flex-col"
                  style={
                    today
                      ? { backgroundColor: "#eff6ff" }
                      : { backgroundColor: "#ffffff" }
                  }
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium inline-flex items-center justify-center ${
                        today ? "rounded-full" : ""
                      }`}
                      style={
                        today
                          ? {
                              backgroundColor: "#003366",
                              color: "#ffffff",
                              width: 22,
                              height: 22,
                              fontSize: 11,
                            }
                          : { color: "#6b7280" }
                      }
                    >
                      {format(day, "d")}
                    </span>
                    {dayDeadlines.length > 0 && (
                      <span
                        className="text-[10px] font-medium px-1 rounded"
                        style={{
                          color: "#003366",
                          backgroundColor: "#e0e7ff",
                        }}
                      >
                        {dayDeadlines.length}
                      </span>
                    )}
                  </div>

                  {/* Deadline pills */}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayDeadlines.slice(0, 3).map((deadline) => {
                      const colors =
                        STATUS_COLORS[deadline.status] ?? STATUS_COLORS.pending;
                      return (
                        <Link
                          key={deadline.id}
                          href={`/clients/${deadline.client_id}`}
                          className="block rounded px-1 py-0.5 text-[10px] leading-tight truncate transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderLeft: `2px solid ${colors.border}`,
                          }}
                          title={`${deadline.client?.name} — ${deadline.notice_type?.name} (${deadline.status})`}
                        >
                          <span className="font-medium">
                            {deadline.client?.name ?? "Unknown"}
                          </span>
                          {deadline.notice_type && (
                            <span style={{ color: colors.text, opacity: 0.75 }}>
                              {" "}
                              · {deadline.notice_type.code}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                    {dayDeadlines.length > 3 && (
                      <span
                        className="text-[10px] font-medium pl-1"
                        style={{ color: "#6b7280" }}
                      >
                        +{dayDeadlines.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* End padding */}
            {Array.from({ length: endPadding }).map((_, i) => (
              <div
                key={`pad-end-${i}`}
                className="min-h-[110px] border-b border-r p-1"
                style={{ backgroundColor: "#f9fafb" }}
              />
            ))}
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-4 px-4 py-3 border-t"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: "#6b7280" }}
            >
              Status:
            </span>
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <span
                  className="text-xs capitalize"
                  style={{ color: colors.text }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
