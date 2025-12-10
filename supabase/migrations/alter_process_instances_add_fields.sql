-- Add additional business fields expected by UI
alter table public.process_instances
  add column if not exists technician_responsible text,
  add column if not exists municipality text,
  add column if not exists area_hectares text,
  add column if not exists due_date timestamptz,
  add column if not exists requester text,
  add column if not exists documents jsonb,
  add column if not exists current_step integer default 0,
  add column if not exists history jsonb,
  add column if not exists updated_date timestamptz;

create index if not exists process_instances_due_idx on public.process_instances(due_date);
