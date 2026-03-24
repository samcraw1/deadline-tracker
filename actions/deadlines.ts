"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fireWebhook } from "@/lib/webhooks";

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

  fireWebhook("deadline.status_changed", { deadlineId, status, notes });

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

// --- Activity / Comments ---

export async function addDeadlineComment(deadlineId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("deadline_activities").insert({
    deadline_id: deadlineId,
    type: "comment",
    content,
    user_id: user?.id ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
}

export async function getDeadlineActivities(deadlineId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deadline_activities")
    .select("*, user:users(name)")
    .eq("deadline_id", deadlineId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    type: a.type as string,
    content: a.content as string,
    user_name: (a.user as { name: string } | null)?.name ?? null,
    created_at: a.created_at as string,
    metadata: a.metadata as Record<string, string> | null,
  }));
}

// --- Task Dependencies ---

export async function addDependency(deadlineId: string, dependsOnId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("deadline_dependencies").insert({
    deadline_id: deadlineId,
    depends_on_id: dependsOnId,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
}

export async function removeDependency(dependencyId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deadline_dependencies")
    .delete()
    .eq("id", dependencyId);

  if (error) throw new Error(error.message);

  revalidatePath("/deadlines");
  revalidatePath("/");
}

export async function getDeadlineDependencies(
  deadlineId: string,
  clientId: string
) {
  const supabase = await createClient();

  const { data: deps } = await supabase
    .from("deadline_dependencies")
    .select(
      "*, depends_on:deadlines!depends_on_id(id, due_date, status, notice_type:notice_types(name))"
    )
    .eq("deadline_id", deadlineId);

  const dependencies = (deps ?? []).map((d: Record<string, unknown>) => {
    const dep = d.depends_on as {
      id: string;
      due_date: string;
      status: string;
      notice_type: { name: string } | null;
    } | null;
    return {
      id: d.id as string,
      depends_on_id: dep?.id ?? "",
      depends_on_notice: dep?.notice_type?.name ?? "Unknown",
      depends_on_status: dep?.status ?? "pending",
      depends_on_due_date: dep?.due_date ?? "",
    };
  });

  const { data: available } = await supabase
    .from("deadlines")
    .select("id, due_date, status, notice_type:notice_types(name)")
    .eq("client_id", clientId)
    .order("due_date");

  const availableDeadlines = (available ?? []).map(
    (d: Record<string, unknown>) => ({
      id: d.id as string,
      notice_type_name:
        (d.notice_type as { name: string } | null)?.name ?? "Unknown",
      due_date: d.due_date as string,
      status: d.status as string,
    })
  );

  return { dependencies, availableDeadlines };
}
