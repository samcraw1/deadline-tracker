create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  notice_type_id uuid not null references public.notice_types(id) on delete restrict,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'confirmed', 'overdue')),
  assigned_to uuid references public.users(id) on delete set null,
  sent_at timestamptz,
  confirmed_at timestamptz,
  notes text,
  plan_year integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(client_id, notice_type_id, plan_year)
);

create trigger deadlines_updated_at
  before update on public.deadlines
  for each row execute function public.update_updated_at();

create index idx_deadlines_due_date on public.deadlines(due_date);
create index idx_deadlines_status on public.deadlines(status);
create index idx_deadlines_client_id on public.deadlines(client_id);
create index idx_deadlines_assigned_to on public.deadlines(assigned_to);
