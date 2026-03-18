"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Download, Printer } from "lucide-react";
import type { DeadlineWithNoticeType } from "@/lib/types/queries";

function generateCSV(
  clientName: string,
  deadlines: DeadlineWithNoticeType[]
): string {
  const headers = [
    "Notice Type",
    "Code",
    "Due Date",
    "Status",
    "Sent Date",
    "Confirmed Date",
    "Notes",
    "Plan Year",
  ];
  const rows = deadlines.map((d) => [
    d.notice_type?.name ?? "",
    d.notice_type?.code ?? "",
    d.due_date,
    d.status,
    d.sent_at ? new Date(d.sent_at).toLocaleDateString() : "",
    d.confirmed_at ? new Date(d.confirmed_at).toLocaleDateString() : "",
    (d.notes ?? "").replace(/"/g, '""'),
    d.plan_year.toString(),
  ]);
  return [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

export function ExportButton({
  clientId,
  clientName,
  deadlines,
}: {
  clientId: string;
  clientName: string;
  deadlines: DeadlineWithNoticeType[];
}) {
  function handleCSV() {
    const csv = generateCSV(clientName, deadlines);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clientName.replace(/[^a-zA-Z0-9]/g, "_")}_compliance_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(`/clients/${clientId}/report`, "_blank")}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
