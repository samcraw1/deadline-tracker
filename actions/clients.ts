"use server";

import { createClient } from "@/lib/supabase/server";
import { generateDeadlinesForClient } from "@/lib/deadline-engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types/database";

type PlanType = Database["public"]["Tables"]["clients"]["Insert"]["plan_type"];
type Client = Database["public"]["Tables"]["clients"]["Row"];

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();

  const clientData = {
    name: formData.get("name") as string,
    plan_type: formData.get("plan_type") as PlanType,
    participant_count: formData.get("participant_count")
      ? parseInt(formData.get("participant_count") as string)
      : null,
    plan_year_end: formData.get("plan_year_end") as string,
    has_safe_harbor: formData.get("has_safe_harbor") === "on",
    has_auto_enrollment: formData.get("has_auto_enrollment") === "on",
    has_rmd: formData.get("has_rmd") === "on",
    contact_email: (formData.get("contact_email") as string) || null,
    contact_name: (formData.get("contact_name") as string) || null,
  };

  const { data: inserted, error } = await supabase
    .from("clients")
    .insert(clientData)
    .select("id")
    .single();

  if (error || !inserted) throw new Error(error?.message ?? "Insert failed");

  // Fetch full client for deadline engine
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", inserted.id)
    .single();

  if (client) {
    await generateDeadlinesForClient(supabase, client as unknown as Client);
  }

  revalidatePath("/clients");
  revalidatePath("/deadlines");
  revalidatePath("/");
  redirect(`/clients/${inserted.id}`);
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const supabase = await createClient();

  const clientData = {
    name: formData.get("name") as string,
    plan_type: formData.get("plan_type") as PlanType,
    participant_count: formData.get("participant_count")
      ? parseInt(formData.get("participant_count") as string)
      : null,
    plan_year_end: formData.get("plan_year_end") as string,
    has_safe_harbor: formData.get("has_safe_harbor") === "on",
    has_auto_enrollment: formData.get("has_auto_enrollment") === "on",
    has_rmd: formData.get("has_rmd") === "on",
    contact_email: (formData.get("contact_email") as string) || null,
    contact_name: (formData.get("contact_name") as string) || null,
  };

  const { error } = await supabase
    .from("clients")
    .update(clientData)
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
  redirect(`/clients/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/deadlines");
  revalidatePath("/");
  redirect("/clients");
}

export async function regenerateDeadlinesAction(clientId: string) {
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error || !client) throw new Error("Client not found");

  await generateDeadlinesForClient(supabase, client as unknown as Client);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/deadlines");
  revalidatePath("/");
}
