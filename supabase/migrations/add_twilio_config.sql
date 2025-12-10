create table if not exists public.twilio_config (
  id bigint generated always as identity primary key,
  account_sid text,
  auth_token text,
  whatsapp_from text,
  is_active boolean default false,
  is_sandbox boolean default true,
  sandbox_join_code text,
  last_reset_date date,
  messages_sent_today integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
