import { STATUS_COLORS } from "@/lib/constants";

export function DeadlineStatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
