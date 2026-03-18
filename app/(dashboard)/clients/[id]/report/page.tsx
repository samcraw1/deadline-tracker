import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PLAN_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { PrintButton } from "@/components/clients/print-button";
import type { DeadlineWithNoticeType } from "@/lib/types/queries";

export default async function ComplianceReportPage({
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

  const client = clientData as unknown as {
    id: string;
    name: string;
    plan_type: string;
    plan_year_end: string;
    participant_count: number | null;
    contact_name: string | null;
    contact_email: string | null;
    has_safe_harbor: boolean;
    has_auto_enrollment: boolean;
    has_rmd: boolean;
  } | null;

  if (!client) notFound();

  const { data: deadlinesData } = await supabase
    .from("deadlines")
    .select("*, notice_type:notice_types(name, code)")
    .eq("client_id", id)
    .order("due_date", { ascending: true });

  const deadlines = (deadlinesData ?? []) as unknown as DeadlineWithNoticeType[];

  const features = [
    client.has_safe_harbor && "Safe Harbor",
    client.has_auto_enrollment && "Auto Enrollment",
    client.has_rmd && "RMD",
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 print:p-4">
      <style>{`
        @media print {
          nav, header, aside, [data-sidebar], .no-print { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>

      <PrintButton />

      <div className="mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold">Compliance Deadline Report</h1>
        <p className="mt-1 text-lg text-zinc-600">{client.name}</p>
        <p className="text-sm text-zinc-500">
          Generated {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-medium text-zinc-500">Plan Type</p>
          <p className="text-lg">{PLAN_TYPE_LABELS[client.plan_type] ?? client.plan_type}</p>
        </div>
        <div>
          <p className="font-medium text-zinc-500">Plan Year End</p>
          <p className="text-lg">
            {format(new Date(client.plan_year_end + "T00:00:00"), "MMMM d, yyyy")}
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-500">Participants</p>
          <p className="text-lg">{client.participant_count ?? "—"}</p>
        </div>
        <div>
          <p className="font-medium text-zinc-500">Plan Features</p>
          <p className="text-lg">{features.length > 0 ? features.join(", ") : "None"}</p>
        </div>
        {client.contact_name && (
          <div>
            <p className="font-medium text-zinc-500">Contact</p>
            <p className="text-lg">
              {client.contact_name}
              {client.contact_email && ` (${client.contact_email})`}
            </p>
          </div>
        )}
      </div>

      <h2 className="mb-4 text-lg font-bold">Deadline Summary</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-zinc-300">
            <th className="py-2 text-left font-medium">Notice Type</th>
            <th className="py-2 text-left font-medium">Due Date</th>
            <th className="py-2 text-left font-medium">Status</th>
            <th className="py-2 text-left font-medium">Sent</th>
            <th className="py-2 text-left font-medium">Confirmed</th>
            <th className="py-2 text-left font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {deadlines.map((d) => (
            <tr key={d.id} className="border-b border-zinc-200">
              <td className="py-2 font-medium">{d.notice_type?.name}</td>
              <td className="py-2">
                {format(new Date(d.due_date + "T00:00:00"), "MMM d, yyyy")}
              </td>
              <td className="py-2">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    d.status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : d.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : d.status === "sent"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                </span>
              </td>
              <td className="py-2">
                {d.sent_at
                  ? format(new Date(d.sent_at), "MMM d, yyyy")
                  : "—"}
              </td>
              <td className="py-2">
                {d.confirmed_at
                  ? format(new Date(d.confirmed_at), "MMM d, yyyy")
                  : "—"}
              </td>
              <td className="py-2 max-w-[200px] truncate">{d.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 border-t pt-4 text-xs text-zinc-400">
        <p>
          This report is generated for compliance tracking purposes. Deadline
          calculations are based on DOL regulations and plan-specific parameters.
        </p>
      </div>
    </div>
  );
}
