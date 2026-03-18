"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDeadlineStatus(
  deadlineId: string,
  status: "pending" | "sent" | "confirmed",
  notes?: string
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { status };
  if (notes !== undefined) updateData.notes = notes;
  if (status === "sent") updateData.sent_at = new Date().toISOString();
  if (status === "confirmed") updateData.confirmed_at = new Date().toISOString();

  const { error } = await supabase
    .from("deadlines")
    .update(updateData)
    .eq("id", deadlineId);

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
}

export async function assignDeadline(deadlineId: string, userId: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deadlines")
    .update({ assigned_to: userId })
    .eq("id", deadlineId);

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
}

export async function deleteDeadline(deadlineId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deadlines")
    .delete()
    .eq("id", deadlineId);

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
}
