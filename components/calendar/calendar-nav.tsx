"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, parse } from "date-fns";

export function CalendarNav({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();

  const current = parse(currentMonth, "yyyy-MM", new Date());

  function navigate(direction: "prev" | "next") {
    const target =
      direction === "prev" ? subMonths(current, 1) : addMonths(current, 1);
    const param = format(target, "yyyy-MM");
    router.push(`/calendar?month=${param}`);
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("prev")}
        aria-label="Previous month"
        style={{ borderColor: "#d1d5db" }}
      >
        <ChevronLeft style={{ width: 18, height: 18 }} />
      </Button>
      <h2 className="text-xl font-semibold min-w-[180px] text-center" style={{ color: "#111827" }}>
        {format(current, "MMMM yyyy")}
      </h2>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("next")}
        aria-label="Next month"
        style={{ borderColor: "#d1d5db" }}
      >
        <ChevronRight style={{ width: 18, height: 18 }} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/calendar")}
        style={{ borderColor: "#d1d5db", marginLeft: 4 }}
      >
        Today
      </Button>
    </div>
  );
}
