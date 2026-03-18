import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { updateClientAction } from "@/actions/clients";
import type { Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  const client = clientData as unknown as Client | null;
  if (!client) notFound();

  const boundAction = updateClientAction.bind(null, id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit {client.name}</h1>
      <ClientForm client={client} action={boundAction} />
    </div>
  );
}
