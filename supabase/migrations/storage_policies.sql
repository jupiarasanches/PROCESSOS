-- Policies for Storage objects on 'documents' bucket
-- Allow authenticated users to read/write only their own files based on owner uuid

-- Ensure bucket exists (already done in init)

-- Enable RLS on storage.objects if not enabled

-- Drop existing policies with same names
do $$ begin
  if exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='documents_read_own') then
    drop policy documents_read_own on storage.objects;
  end if;
  if exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='documents_write_own') then
    drop policy documents_write_own on storage.objects;
  end if;
  if exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='documents_update_own') then
    drop policy documents_update_own on storage.objects;
  end if;
end $$;

create policy documents_read_own on storage.objects
  for select
  to authenticated
  using ( bucket_id = 'documents' and owner = auth.uid() );

create policy documents_write_own on storage.objects
  for insert
  to authenticated
  with check ( bucket_id = 'documents' and owner = auth.uid() );

create policy documents_update_own on storage.objects
  for update
  to authenticated
  using ( bucket_id = 'documents' and owner = auth.uid() )
  with check ( bucket_id = 'documents' and owner = auth.uid() );

-- Admin (service role) bypasses RLS automatically via service key
