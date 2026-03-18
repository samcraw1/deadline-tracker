"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/types/database";

type Frequency = Database["public"]["Tables"]["notice_types"]["Insert"]["frequency"];

export async function createNoticeType(formData: FormData) {
  const supabase = await createClient();

  const appliesTo = (formData.get("applies_to") as string)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    name: formData.get("name") as string,
    code: formData.get("code") as string,
    description: (formData.get("description") as string) || null,
    days_before_plan_year_end: formData.get("days_before_plan_year_end")
      ? parseInt(formData.get("days_before_plan_year_end") as string)
      : null,
    frequency: formData.get("frequency") as Frequency,
    applies_to: appliesTo,
  };

  const { error } = await supabase.from("notice_types").insert(data);

  if (error) throw new Error(error.message);

  revalidatePath("/notice-types");
}

export async function updateNoticeType(id: string, formData: FormData) {
  const supabase = await createClient();

  const appliesTo = (formData.get("applies_to") as string)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    name: formData.get("name") as string,
    code: formData.get("code") as string,
    description: (formData.get("description") as string) || null,
    days_before_plan_year_end: formData.get("days_before_plan_year_end")
      ? parseInt(formData.get("days_before_plan_year_end") as string)
      : null,
    frequency: formData.get("frequency") as Frequency,
    applies_to: appliesTo,
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase
    .from("notice_types")
    .update(data)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/notice-types");
}
