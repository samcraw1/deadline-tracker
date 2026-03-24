"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Link2, Plus, X } from "lucide-react";
import { addDependency, removeDependency } from "@/actions/deadlines";
import { toast } from "sonner";

type Deadline = {
  id: string;
  notice_type_name: string;
  due_date: string;
  status: string;
};

type Dependency = {
  id: string;
  depends_on_id: string;
  depends_on_notice: string;
  depends_on_status: string;
  depends_on_due_date: string;
};

export function TaskDependencies({
  deadlineId,
  dependencies,
  availableDeadlines,
}: {
  deadlineId: string;
  dependencies: Dependency[];
  availableDeadlines: Deadline[];
}) {
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  const existingIds = new Set(dependencies.map((d) => d.depends_on_id));
  const addable = availableDeadlines.filter(
    (d) => d.id !== deadlineId && !existingIds.has(d.id)
  );

  async function handleAdd() {
    if (!selectedId) return;
    setLoading(true);
    try {
      await addDependency(deadlineId, selectedId);
      toast.success("Dependency added");
      setAdding(false);
      setSelectedId("");
    } catch {
      toast.error("Failed to add dependency");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(depId: string) {
    try {
      await removeDependency(depId);
      toast.success("Dependency removed");
    } catch {
      toast.error("Failed to remove dependency");
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Dependencies
          </CardTitle>
          {!adding && (
            <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/30">
            <Select value={selectedId} onValueChange={(v) => v && setSelectedId(v)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a deadline..." />
              </SelectTrigger>
              <SelectContent>
                {addable.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.notice_type_name} (due {d.due_date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAdd} disabled={loading || !selectedId}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setSelectedId("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {dependencies.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No dependencies. This deadline can be completed independently.
          </p>
        ) : (
          dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">
                  {dep.depends_on_notice}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  Due: {dep.depends_on_due_date}
                </span>
              </div>
              <Badge className={statusColors[dep.depends_on_status] ?? ""}>
                {dep.depends_on_status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(dep.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}

        {dependencies.some((d) => d.depends_on_status !== "confirmed" && d.depends_on_status !== "sent") && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            Some dependencies are not yet completed. Consider completing those first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
