-- HanjaLearning initial user-data schema
-- All learner-owned tables use auth.uid() ownership and RLS.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  target_provider text,
  target_grade text,
  birth_year smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal_minutes smallint not null default 10 check (daily_goal_minutes between 1 and 120),
  sound_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_hanja_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  hanja_id bigint not null,
  learning_state text not null default 'NEW',
  mastery_score smallint not null default 0 check (mastery_score between 0 and 100),
  recognition_score smallint,
  meaning_score smallint,
  reading_score smallint,
  vocabulary_score smallint,
  writing_score smallint,
  review_stage smallint not null default 0 check (review_stage between 0 and 7),
  study_count integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  correct_streak integer not null default 0,
  wrong_streak integer not null default 0,
  first_learned_at timestamptz,
  last_studied_at timestamptz,
  next_review_at timestamptz,
  is_favorite boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, hanja_id)
);

create table if not exists public.review_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hanja_id bigint not null,
  session_id uuid,
  activity_type text not null,
  question_type text,
  result text not null,
  response_time_ms integer,
  mastery_before smallint,
  mastery_after smallint,
  review_stage_before smallint,
  review_stage_after smallint,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  planned_new smallint not null default 0,
  planned_review smallint not null default 0,
  planned_wrong smallint not null default 0,
  actual_new smallint not null default 0,
  actual_review smallint not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  duration_seconds integer not null default 0
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_hanja_progress enable row level security;
alter table public.review_history enable row level security;
alter table public.study_sessions enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy "settings_select_own" on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "settings_insert_own" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "settings_update_own" on public.user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "settings_delete_own" on public.user_settings for delete to authenticated using ((select auth.uid()) = user_id);

create policy "progress_select_own" on public.user_hanja_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress_insert_own" on public.user_hanja_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress_update_own" on public.user_hanja_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress_delete_own" on public.user_hanja_progress for delete to authenticated using ((select auth.uid()) = user_id);

create policy "history_select_own" on public.review_history for select to authenticated using ((select auth.uid()) = user_id);
create policy "history_insert_own" on public.review_history for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "history_update_own" on public.review_history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "history_delete_own" on public.review_history for delete to authenticated using ((select auth.uid()) = user_id);

create policy "sessions_select_own" on public.study_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "sessions_insert_own" on public.study_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sessions_update_own" on public.study_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sessions_delete_own" on public.study_sessions for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists idx_progress_due on public.user_hanja_progress (user_id, next_review_at);
create index if not exists idx_review_history_user_created on public.review_history (user_id, created_at desc);
create index if not exists idx_study_sessions_user_started on public.study_sessions (user_id, started_at desc);

-- Do not grant anonymous access to learner-owned tables.
revoke all on table public.profiles from anon;
revoke all on table public.user_settings from anon;
revoke all on table public.user_hanja_progress from anon;
revoke all on table public.review_history from anon;
revoke all on table public.study_sessions from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_settings to authenticated;
grant select, insert, update, delete on table public.user_hanja_progress to authenticated;
grant select, insert, update, delete on table public.review_history to authenticated;
grant select, insert, update, delete on table public.study_sessions to authenticated;
grant usage, select on sequence public.review_history_id_seq to authenticated;
