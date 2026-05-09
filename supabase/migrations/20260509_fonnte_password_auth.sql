alter table public.users
add column if not exists password_hash text,
add column if not exists phone_verified_at timestamptz;

create table if not exists public.auth_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists auth_otps_phone_idx on public.auth_otps (phone);
create index if not exists auth_otps_expires_at_idx on public.auth_otps (expires_at);

alter table public.auth_otps enable row level security;
