create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  full_name text,
  phone text unique,
  email text,
  password_hash text,
  phone_verified_at timestamptz,
  gender text check (gender in ('female', 'male')),
  date_of_birth date,
  instagram_username text,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

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

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  class_name text,
  class_code text unique not null,
  class_date date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  post_test_open boolean not null default false,
  location text,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger classes_set_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  role text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.class_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create table if not exists public.pre_test_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  gender text not null check (gender in ('female', 'male')),
  grooming_frequency text,
  expectations text,
  obstacles text[],
  obstacle_explanation text,
  female_activities text[],
  male_habits text[],
  male_skin_type text,
  male_social_media_willing boolean,
  male_upload_timeline text,
  commitments jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  before_photo_path text not null,
  submitted_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create table if not exists public.post_test_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  after_photo_path text not null,
  liked_most text,
  improvement_feedback text,
  next_steps text,
  recommendation text check (recommendation in ('yes', 'maybe', 'no')),
  recommendation_target text,
  testimonial text,
  content_consent boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create table if not exists public.trainer_ratings (
  id uuid primary key default gen_random_uuid(),
  post_test_submission_id uuid not null references public.post_test_submissions(id) on delete cascade,
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (post_test_submission_id, trainer_id)
);

create index if not exists classes_class_code_idx on public.classes (class_code);
create index if not exists classes_status_idx on public.classes (status);
create index if not exists trainers_class_id_idx on public.trainers (class_id);
create index if not exists class_registrations_user_id_idx on public.class_registrations (user_id);
create index if not exists class_registrations_class_id_idx on public.class_registrations (class_id);
create index if not exists pre_test_submissions_class_id_idx on public.pre_test_submissions (class_id);
create index if not exists post_test_submissions_class_id_idx on public.post_test_submissions (class_id);
create index if not exists trainer_ratings_submission_id_idx on public.trainer_ratings (post_test_submission_id);

alter table public.users enable row level security;
alter table public.auth_otps enable row level security;
alter table public.classes enable row level security;
alter table public.trainers enable row level security;
alter table public.class_registrations enable row level security;
alter table public.pre_test_submissions enable row level security;
alter table public.post_test_submissions enable row level security;
alter table public.trainer_ratings enable row level security;

create table if not exists public.post_test_progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  after_photo_path text not null,
  submitted_at timestamptz not null default now(),
  entry_date date not null,
  unique (user_id, class_id, entry_date)
);

create index if not exists post_test_progress_entries_class_id_idx
  on public.post_test_progress_entries (class_id);

create index if not exists post_test_progress_entries_user_id_idx
  on public.post_test_progress_entries (user_id);

create index if not exists post_test_progress_entries_user_class_submitted_idx
  on public.post_test_progress_entries (user_id, class_id, submitted_at desc);

alter table public.post_test_progress_entries enable row level security;

-- The app writes through Next.js server actions/route handlers with the service role.
-- Public browser access stays denied by default while RLS is enabled.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-photos',
  'submission-photos',
  false,
  67108864,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
