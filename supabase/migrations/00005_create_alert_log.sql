create table public.alert_log (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references public.deadlines(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  alert_type text not null check (alert_type in ('60_day', '30_day', '7_day', 'overdue')),
  channel text not null default 'in_app' check (channel in ('email', 'in_app', 'both')),
  sent_to text not null,
  sent_at timestamptz not null default now(),
  delivered boolean not null default false
);

create index idx_alert_log_deadline_id on public.alert_log(deadline_id);
create index idx_alert_log_client_id on public.alert_log(client_id);
create index idx_alert_log_sent_at on public.alert_log(sent_at desc);
