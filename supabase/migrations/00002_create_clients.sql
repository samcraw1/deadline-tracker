create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_type text not null default '401k' check (plan_type in ('401k', '403b', 'defined_benefit', '457b', 'profit_sharing', 'other')),
  participant_count integer,
  plan_year_end date not null,
  has_safe_harbor boolean not null default false,
  has_auto_enrollment boolean not null default false,
  has_rmd boolean not null default false,
  contact_email text,
  contact_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.update_updated_at();

create index idx_clients_plan_year_end on public.clients(plan_year_end);
create index idx_clients_is_active on public.clients(is_active);
