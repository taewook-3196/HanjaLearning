-- Align persisted learning_state with the spaced-repetition evidence.
-- Apply only after reviewing production impact and verifying in staging.
-- Existing scores, review dates, history, and counts remain unchanged.

create or replace function public.learning_state_for_progress(
  target_mastery_score integer,
  target_review_stage integer
) returns text
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(target_mastery_score, 0) >= 80
      and coalesce(target_review_stage, 0) >= 5 then 'MASTERED'
    when coalesce(target_mastery_score, 0) >= 30
      and coalesce(target_review_stage, 0) >= 3 then 'FAMILIAR'
    else 'LEARNING'
  end
$$;

-- BEFORE trigger covers all existing progress writers, including
-- record_study_result and record_writing_practice, without changing
-- their scoring and idempotency logic.
create or replace function public.sync_learning_state_from_progress()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.study_count > 0 then
    new.learning_state := public.learning_state_for_progress(
      new.mastery_score, new.review_stage
    );
  end if;
  return new;
end;
$$;

drop trigger if exists sync_learning_state_from_progress on public.user_hanja_progress;
create trigger sync_learning_state_from_progress
before insert or update on public.user_hanja_progress
for each row execute function public.sync_learning_state_from_progress();

-- One-time correction of existing learned rows; other columns unchanged.
update public.user_hanja_progress
set learning_state = public.learning_state_for_progress(mastery_score, review_stage)
where study_count > 0
  and learning_state is distinct from public.learning_state_for_progress(mastery_score, review_stage);
