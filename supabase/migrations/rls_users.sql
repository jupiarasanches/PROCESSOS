-- Enable RLS and define policies for public.users
alter table if exists public.users enable row level security;

do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_select_all') then
    drop policy users_select_all on public.users;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_insert_authenticated') then
    drop policy users_insert_authenticated on public.users;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_update_authenticated') then
    drop policy users_update_authenticated on public.users;
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_delete_authenticated') then
    drop policy users_delete_authenticated on public.users;
  end if;
end $$;

-- Read allowed to everyone for UX convenience
create policy users_select_all on public.users
  for select
  to anon, authenticated
  using (true);

-- Permit inserts for authenticated users (bootstrap and self-profile creation)
create policy users_insert_authenticated on public.users
  for insert
  to authenticated
  with check (true);

-- Permit updates for authenticated users (can be tightened later)
create policy users_update_authenticated on public.users
  for update
  to authenticated
  using (true)
  with check (true);

-- Permit deletes for authenticated users (optional; usually restricted to admins)
create policy users_delete_authenticated on public.users
  for delete
  to authenticated
  using (true);

