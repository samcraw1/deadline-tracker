-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.notice_types enable row level security;
alter table public.deadlines enable row level security;
alter table public.alert_log enable row level security;

-- Users
create policy "Authenticated users can read users" on public.users for select to authenticated using (true);
create policy "Users can update own profile" on public.users for update to authenticated using (id = auth.uid());
create policy "Admins can update any user" on public.users for update to authenticated using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Clients
create policy "Authenticated users can read clients" on public.clients for select to authenticated using (true);
create policy "Authenticated users can insert clients" on public.clients for insert to authenticated with check (true);
create policy "Authenticated users can update clients" on public.clients for update to authenticated using (true);
create policy "Authenticated users can delete clients" on public.clients for delete to authenticated using (true);

-- Notice Types
create policy "Authenticated users can read notice_types" on public.notice_types for select to authenticated using (true);
create policy "Admins can insert notice_types" on public.notice_types for insert to authenticated with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can update notice_types" on public.notice_types for update to authenticated using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Deadlines
create policy "Authenticated users can read deadlines" on public.deadlines for select to authenticated using (true);
create policy "Authenticated users can insert deadlines" on public.deadlines for insert to authenticated with check (true);
create policy "Authenticated users can update deadlines" on public.deadlines for update to authenticated using (true);
create policy "Authenticated users can delete deadlines" on public.deadlines for delete to authenticated using (true);

-- Alert Log
create policy "Authenticated users can read alert_log" on public.alert_log for select to authenticated using (true);
create policy "Authenticated users can insert alert_log" on public.alert_log for insert to authenticated with check (true);
