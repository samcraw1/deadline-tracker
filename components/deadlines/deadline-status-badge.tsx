import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";

export function DeadlineStatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? "";

  return (
    <Badge variant="outline" className={colors}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
