"use client";

import { useState } from "react";
import { updateDeadlineStatus } from "@/actions/deadlines";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Send, Download, X } from "lucide-react";

export function BulkActionBar({
  selectedIds,
  deadlines,
  onClear,
}: {
  selectedIds: string[];
  deadlines: {
    id: string;
    status: string;
    client_name: string;
    notice_type_name: string;
    due_date: string;
  }[];
  onClear: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) return null;

  async function bulkUpdate(status: "sent" | "confirmed") {
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updateDeadlineStatus(id, status))
      );
      toast.success(`${selectedIds.length} deadlines marked as ${status}`);
      onClear();
    } catch {
      toast.error("Some updates failed");
    } finally {
      setLoading(false);
    }
  }

  function exportSelected() {
    const sel = deadlines.filter((d) => selectedIds.includes(d.id));
    const csv = [
      "Client,Notice Type,Due Date,Status",
      ...sel.map(
        (d) =>
          `"${d.client_name}","${d.notice_type_name}","${d.due_date}","${d.status}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_deadlines.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => bulkUpdate("sent")}
        disabled={loading}
      >
        <Send className="mr-1 h-3 w-3" /> Mark Sent
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => bulkUpdate("confirmed")}
        disabled={loading}
      >
        <Check className="mr-1 h-3 w-3" /> Mark Confirmed
      </Button>
      <Button size="sm" variant="outline" onClick={exportSelected}>
        <Download className="mr-1 h-3 w-3" /> Export CSV
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
