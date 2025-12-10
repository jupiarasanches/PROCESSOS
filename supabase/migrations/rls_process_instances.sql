-- Enable RLS (already enabled, but good practice to ensure)
alter table if exists public.process_instances enable row level security;

-- Drop existing policies if any
do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='process_instances' and policyname='process_instances_select_all') then
    drop policy process_instances_select_all on public.process_instances;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='process_instances' and policyname='process_instances_insert_authenticated') then
    drop policy process_instances_insert_authenticated on public.process_instances;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='process_instances' and policyname='process_instances_update_authenticated') then
    drop policy process_instances_update_authenticated on public.process_instances;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='process_instances' and policyname='process_instances_delete_authenticated') then
    drop policy process_instances_delete_authenticated on public.process_instances;
  end if;
end $$;

-- Allow reading for everyone (authenticated)
create policy process_instances_select_all on public.process_instances
  for select
  to authenticated
  using (true);

-- Allow insert for authenticated users
create policy process_instances_insert_authenticated on public.process_instances
  for insert
  to authenticated
  with check (true);

-- Allow update for authenticated users
create policy process_instances_update_authenticated on public.process_instances
  for update
  to authenticated
  using (true)
  with check (true);

-- Allow delete for authenticated users (can be restricted to admin later)
create policy process_instances_delete_authenticated on public.process_instances
  for delete
  to authenticated
  using (true);
