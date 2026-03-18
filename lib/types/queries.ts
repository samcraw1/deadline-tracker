// Types for Supabase query results with joins
// (needed because our Database types don't include Relationships)

export type DeadlineWithJoins = {
  id: string;
  client_id: string;
  notice_type_id: string;
  due_date: string;
  status: string;
  assigned_to: string | null;
  sent_at: string | null;
  confirmed_at: string | null;
  notes: string | null;
  plan_year: number;
  created_at: string;
  updated_at: string;
  client: { id: string; name: string } | null;
  notice_type: { name: string; code: string } | null;
};

export type AlertWithJoins = {
  id: string;
  sent_at: string;
  alert_type: string;
  channel: string;
  sent_to: string;
  delivered: boolean;
  client_id: string;
  deadline_id: string;
  client: { id: string; name: string } | null;
  deadline: { due_date: string; notice_type: { name: string } | null } | null;
};

export type DeadlineWithNoticeType = {
  id: string;
  client_id: string;
  notice_type_id: string;
  due_date: string;
  status: string;
  assigned_to: string | null;
  sent_at: string | null;
  confirmed_at: string | null;
  notes: string | null;
  plan_year: number;
  notice_type: { name: string; code: string } | null;
};
