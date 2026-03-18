export const STATUS_COLORS = {
  overdue: "bg-red-50 text-red-700 border-red-300",
  pending: "bg-amber-50 text-amber-700 border-amber-300",
  sent: "bg-blue-50 text-blue-700 border-blue-300",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-300",
} as const;

export const PLAN_TYPE_LABELS: Record<string, string> = {
  "401k": "401(k)",
  "403b": "403(b)",
  defined_benefit: "Defined Benefit",
  "457b": "457(b)",
  profit_sharing: "Profit Sharing",
  other: "Other",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  annual: "Annual",
  quarterly: "Quarterly",
  one_time: "One-time",
  event_driven: "Event-driven",
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  "60_day": "60-Day",
  "30_day": "30-Day",
  "7_day": "7-Day",
  overdue: "Overdue",
};
