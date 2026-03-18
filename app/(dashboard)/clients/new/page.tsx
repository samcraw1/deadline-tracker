import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "@/actions/clients";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Client</h1>
      <ClientForm action={createClientAction} />
    </div>
  );
}
