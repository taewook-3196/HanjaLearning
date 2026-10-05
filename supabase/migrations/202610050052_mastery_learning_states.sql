-- Derive a conservative learning state from spaced repetition evidence.
create or replace function public.refresh_hanja_learning_state(target_user_id uuid, target_hanja_id bigint)
returns void language plpgsql security invoker set search_path=public as $fn$
begin
  if auth.uid() is null or auth.uid() <> target_user_id then raise exception 'not allowed'; end if;
  update public.user_hanja_progress
  set learning_state = case
    when study_count=0 then 'NEW'
    when mastery_score>=80 and review_stage>=4 and correct_streak>=3 and wrong_streak=0 then 'MASTERED'
    when mastery_score>=50 and review_stage>=2 and wrong_streak=0 then 'FAMILIAR'
    else 'LEARNING'
  end,
  updated_at=now()
  where user_id=target_user_id and hanja_id=target_hanja_id;
end;$fn$;
revoke all on function public.refresh_hanja_learning_state(uuid,bigint) from public,anon;
grant execute on function public.refresh_hanja_learning_state(uuid,bigint) to authenticated;

-- Keep state synchronized after every recorded flashcard/quiz result without changing the existing scoring RPC contract.
create or replace function public.sync_hanja_learning_state_trigger()
returns trigger language plpgsql set search_path=public as $fn$
begin
  new.learning_state := case
    when new.study_count=0 then 'NEW'
    when new.mastery_score>=80 and new.review_stage>=4 and new.correct_streak>=3 and new.wrong_streak=0 then 'MASTERED'
    when new.mastery_score>=50 and new.review_stage>=2 and new.wrong_streak=0 then 'FAMILIAR'
    else 'LEARNING'
  end;
  return new;
end;$fn$;

drop trigger if exists trg_sync_hanja_learning_state on public.user_hanja_progress;
create trigger trg_sync_hanja_learning_state before insert or update of mastery_score,review_stage,correct_streak,wrong_streak,study_count
on public.user_hanja_progress for each row execute function public.sync_hanja_learning_state_trigger();

-- Backfill existing learner progress to the same rules.
update public.user_hanja_progress set learning_state=case
  when study_count=0 then 'NEW'
  when mastery_score>=80 and review_stage>=4 and correct_streak>=3 and wrong_streak=0 then 'MASTERED'
  when mastery_score>=50 and review_stage>=2 and wrong_streak=0 then 'FAMILIAR'
  else 'LEARNING'
end;
