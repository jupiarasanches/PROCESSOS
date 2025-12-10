-- Create simcar_details table to extend process_instances
create table if not exists public.simcar_details (
  id bigint generated always as identity primary key,
  instance_id bigint references public.process_instances(id) on delete cascade unique,
  car_number text,
  property_name text,
  analysis_date date,
  due_date date,
  pendency_status text,
  technician_responsible text,
  days_remaining integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.simcar_details enable row level security;

-- RLS Policies (same as process_instances)
create policy simcar_details_select_all on public.simcar_details
  for select to authenticated using (true);

create policy simcar_details_insert_authenticated on public.simcar_details
  for insert to authenticated with check (true);

create policy simcar_details_update_authenticated on public.simcar_details
  for update to authenticated using (true);

create policy simcar_details_delete_authenticated on public.simcar_details
  for delete to authenticated using (true);
