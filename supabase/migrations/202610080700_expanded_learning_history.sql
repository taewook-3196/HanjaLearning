-- Track exposure to expanded learning content so quizzes only use material the learner has actually seen.
create table if not exists public.user_expanded_learning_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('WORD_RELATION','IDIOM','HANJA_CARD')),
  content_id bigint not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  study_count integer not null default 1 check (study_count > 0),
  primary key (user_id, content_type, content_id)
);

create index if not exists user_expanded_learning_history_user_type_seen_idx
  on public.user_expanded_learning_history (user_id, content_type, last_seen_at desc);

alter table public.user_expanded_learning_history enable row level security;

drop policy if exists "Users can read own expanded learning history" on public.user_expanded_learning_history;
create policy "Users can read own expanded learning history"
  on public.user_expanded_learning_history for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own expanded learning history" on public.user_expanded_learning_history;
create policy "Users can insert own expanded learning history"
  on public.user_expanded_learning_history for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own expanded learning history" on public.user_expanded_learning_history;
create policy "Users can update own expanded learning history"
  on public.user_expanded_learning_history for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on table public.user_expanded_learning_history from anon;
grant select, insert, update on table public.user_expanded_learning_history to authenticated;

create or replace function public.record_expanded_learning(p_content_type text, p_content_id bigint)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_content_type not in ('WORD_RELATION','IDIOM','HANJA_CARD') then raise exception 'unsupported content type'; end if;
  if p_content_id is null or p_content_id <= 0 then raise exception 'invalid content id'; end if;

  insert into public.user_expanded_learning_history(user_id, content_type, content_id)
  values (auth.uid(), p_content_type, p_content_id)
  on conflict (user_id, content_type, content_id)
  do update set last_seen_at = now(), study_count = public.user_expanded_learning_history.study_count + 1;
end;
$$;

revoke all on function public.record_expanded_learning(text,bigint) from public, anon;
grant execute on function public.record_expanded_learning(text,bigint) to authenticated;
