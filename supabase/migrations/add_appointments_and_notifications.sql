-- Create appointments table
create table if not exists public.appointments (
  id bigint generated always as identity primary key,
  title text not null,
  process_id bigint references public.processes(id) on delete set null,
  client_company text,
  scheduled_date timestamptz not null,
  status text default 'pendente',
  assigned_to text,
  notification_email_enabled boolean default false,
  notification_minutes_before integer default 0,
  notification_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists appointments_process_idx on public.appointments(process_id);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointments_scheduled_idx on public.appointments(scheduled_date);

-- Create notifications table
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id bigint references public.users(id) on delete cascade,
  type text not null,
  title text,
  message text,
  read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists notifications_type_idx on public.notifications(type);
