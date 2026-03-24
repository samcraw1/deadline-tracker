"use client";

import { useState } from "react";
import { createNoticeType } from "@/actions/notice-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function NoticeTypeDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      await createNoticeType(form);
      toast.success("Notice type created");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Notice Type
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Notice Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" required placeholder="e.g. CUSTOM_01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="days_before_plan_year_end">Days Before Plan Year End</Label>
            <Input
              id="days_before_plan_year_end"
              name="days_before_plan_year_end"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <select
              name="frequency"
              id="frequency"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="one_time">One-time</option>
              <option value="event_driven">Event-driven</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applies_to">Applies To (comma-separated)</Label>
            <Input
              id="applies_to"
              name="applies_to"
              placeholder="all, safe_harbor, 401k"
              defaultValue="all"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Notice Type"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
