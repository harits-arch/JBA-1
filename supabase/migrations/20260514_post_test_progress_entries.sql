-- Additive migration: daily post-test progress photos (submissions 2–14).
-- Existing post_test_submissions rows are untouched (submission #1).

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
