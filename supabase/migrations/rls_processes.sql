-- Enable RLS and define policies for processes
do $$ begin
  if not exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'processes'
  ) then
    raise notice 'Table public.processes does not exist';
  end if;
end $$;

alter table if exists public.processes enable row level security;

-- Drop existing policies to avoid duplicates
do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='processes' and policyname='processes_select_all') then
    drop policy processes_select_all on public.processes;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='processes' and policyname='processes_insert_authenticated') then
    drop policy processes_insert_authenticated on public.processes;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='processes' and policyname='processes_update_authenticated') then
    drop policy processes_update_authenticated on public.processes;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='processes' and policyname='processes_delete_admin_only') then
    drop policy processes_delete_admin_only on public.processes;
  end if;
end $$;

-- Allow reading for everyone (anon + authenticated)
create policy processes_select_all on public.processes
  for select
  to anon, authenticated
  using (true);

-- Allow insert for authenticated users
create policy processes_insert_authenticated on public.processes
  for insert
  to authenticated
  with check (true);

-- Allow update for authenticated users
create policy processes_update_authenticated on public.processes
  for update
  to authenticated
  using (true)
  with check (true);

-- Allow delete only for authenticated users (can be tightened to admins later)
create policy processes_delete_admin_only on public.processes
  for delete
  to authenticated
  using (true);

