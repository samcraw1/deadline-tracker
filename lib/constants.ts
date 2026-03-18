export const STATUS_COLORS = {
  overdue: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
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
