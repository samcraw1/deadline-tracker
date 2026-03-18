export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  overdue: { bg: "#fef2f2", text: "#DC3545", border: "#f9a8af" },
  pending: { bg: "#fff8e1", text: "#856404", border: "#FFC107" },
  sent: { bg: "#e8f0fe", text: "#0066CC", border: "#93c5fd" },
  confirmed: { bg: "#e8f5e9", text: "#28A745", border: "#81c784" },
};

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
