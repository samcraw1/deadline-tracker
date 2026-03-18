create table public.notice_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  days_before_plan_year_end integer, -- positive = before PY start, negative = after PY end, null = event-driven
  frequency text not null default 'annual' check (frequency in ('annual', 'quarterly', 'one_time', 'event_driven')),
  applies_to text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notice_types_updated_at
  before update on public.notice_types
  for each row execute function public.update_updated_at();
