"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLAN_TYPE_LABELS } from "@/lib/constants";
import type { Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export function ClientForm({
  client,
  action,
}: {
  client?: Client;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Plan Name</Label>
        <Input id="name" name="name" defaultValue={client?.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan_type">Plan Type</Label>
        <Select name="plan_type" defaultValue={client?.plan_type ?? "401k"}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PLAN_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan_year_end">Plan Year End</Label>
        <Input
          id="plan_year_end"
          name="plan_year_end"
          type="date"
          defaultValue={client?.plan_year_end}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="participant_count">Participant Count</Label>
        <Input
          id="participant_count"
          name="participant_count"
          type="number"
          defaultValue={client?.participant_count ?? ""}
        />
      </div>

      <div className="space-y-3">
        <Label>Plan Features</Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="has_safe_harbor"
            name="has_safe_harbor"
            defaultChecked={client?.has_safe_harbor}
          />
          <Label htmlFor="has_safe_harbor" className="font-normal">
            Safe Harbor
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="has_auto_enrollment"
            name="has_auto_enrollment"
            defaultChecked={client?.has_auto_enrollment}
          />
          <Label htmlFor="has_auto_enrollment" className="font-normal">
            Auto Enrollment (EACA/QACA)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="has_rmd"
            name="has_rmd"
            defaultChecked={client?.has_rmd}
          />
          <Label htmlFor="has_rmd" className="font-normal">
            Has RMD-eligible participants
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_name">Contact Name</Label>
        <Input
          id="contact_name"
          name="contact_name"
          defaultValue={client?.contact_name ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={client?.contact_email ?? ""}
        />
      </div>

      <Button type="submit">{client ? "Update Client" : "Add Client"}</Button>
    </form>
  );
}
