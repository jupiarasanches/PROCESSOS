-- Temporary bootstrap policy: allow ANON to insert only admin rows
do $$ begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_insert_admin_bootstrap') then
    drop policy users_insert_admin_bootstrap on public.users;
  end if;
end $$;

create policy users_insert_admin_bootstrap on public.users
  for insert
  to anon
  with check (role = 'admin');

