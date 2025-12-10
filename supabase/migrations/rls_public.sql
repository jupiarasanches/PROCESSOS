-- Enable RLS and basic policies for core tables

alter table if exists public.users enable row level security;
alter table if exists public.processes enable row level security;
alter table if exists public.process_instances enable row level security;

-- Users: allow authenticated users to select/update their own row, identified by email claim
do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_self_select') then
    drop policy users_self_select on public.users;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_self_update') then
    drop policy users_self_update on public.users;
  end if;
end $$;

create policy users_self_select on public.users
  for select to authenticated
  using ( email = (auth.jwt() ->> 'email') );

create policy users_self_update on public.users
  for update to authenticated
  using ( email = (auth.jwt() ->> 'email') )
  with check ( email = (auth.jwt() ->> 'email') );

-- Processes: allow authenticated read; writes via service role (no policy)
do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='processes' and policyname='processes_read_auth') then
    drop policy processes_read_auth on public.processes;
  end if;
end $$;

create policy processes_read_auth on public.processes
  for select to authenticated
  using ( true );

-- Process instances: allow authenticated read; insert/update authenticated
do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='process_instances' and policyname='instances_read_auth') then
    drop policy instances_read_auth on public.process_instances;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='process_instances' and policyname='instances_write_auth') then
    drop policy instances_write_auth on public.process_instances;
  end if;
end $$;

create policy instances_read_auth on public.process_instances
  for select to authenticated
  using ( true );

create policy instances_write_auth on public.process_instances
  for insert to authenticated
  with check ( true );

create policy instances_update_auth on public.process_instances
  for update to authenticated
  using ( true )
  with check ( true );
