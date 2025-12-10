-- Enable required extensions
create extension if not exists pgcrypto;

-- Users table
create table if not exists public.users (
  id bigint generated always as identity primary key,
  email text unique not null,
  full_name text,
  role text default 'technician',
  status text default 'active',
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invitations for email-based onboarding
create table if not exists public.invitations (
  id bigint generated always as identity primary key,
  user_id bigint references public.users(id) on delete set null,
  email text not null,
  token text unique not null,
  expires_at timestamptz not null,
  status text default 'pending',
  created_at timestamptz default now(),
  accepted_at timestamptz
);
create index if not exists invitations_email_idx on public.invitations(email);
create index if not exists invitations_status_idx on public.invitations(status);

-- Processes catalog (services)
create table if not exists public.processes (
  id bigint generated always as identity primary key,
  name text unique not null,
  category text,
  description text,
  status text default 'ativo',
  owner_id bigint references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists processes_category_idx on public.processes(category);

-- Process instances
create table if not exists public.process_instances (
  id bigint generated always as identity primary key,
  process_id bigint not null references public.processes(id) on delete cascade,
  title text not null,
  client_company text,
  status text,
  priority text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists process_instances_process_id_idx on public.process_instances(process_id);
create index if not exists process_instances_status_idx on public.process_instances(status);

-- Documents metadata (PDF/JPEG)
create table if not exists public.documents (
  id bigint generated always as identity primary key,
  owner_id bigint references public.users(id) on delete set null,
  process_id bigint references public.processes(id) on delete set null,
  instance_id bigint references public.process_instances(id) on delete cascade,
  file_name text not null,
  mime_type text not null,
  size bigint not null,
  storage_path text not null,
  checksum text,
  uploaded_at timestamptz default now(),
  status text default 'active'
);
create index if not exists documents_owner_idx on public.documents(owner_id);
create index if not exists documents_process_idx on public.documents(process_id);
create index if not exists documents_instance_idx on public.documents(instance_id);

-- Attachments relation between instances and documents
create table if not exists public.instance_attachments (
  id bigint generated always as identity primary key,
  instance_id bigint not null references public.process_instances(id) on delete cascade,
  document_id bigint not null references public.documents(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists instance_attachments_instance_idx on public.instance_attachments(instance_id);
create index if not exists instance_attachments_document_idx on public.instance_attachments(document_id);

-- Audit logs
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id bigint not null,
  action text not null,
  actor_id bigint references public.users(id) on delete set null,
  payload jsonb,
  created_at timestamptz default now()
);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);

-- Storage bucket for documents (private)
insert into storage.buckets (id, name, public)
select 'documents', 'documents', false
where not exists (select 1 from storage.buckets where id = 'documents');

-- Note: Storage RLS/policies will be configured later alongside Supabase Auth.
-- This migration focuses on core tables and bucket provisioning.
