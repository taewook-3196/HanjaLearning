-- Harden study recording RPC validation and serialize first-time answers.
create or replace function public.record_study_result(
  target_hanja_id bigint, result_kind text, activity_kind text, question_kind text
)
returns void
language plpgsql
security invoker
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  old_row public.user_hanja_progress%rowtype;
  is_correct boolean;
  new_mastery smallint;
  new_stage smallint;
  next_at timestamptz;
  now_at timestamptz := now();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if target_hanja_id is null then raise exception 'hanja id required'; end if;
  if activity_kind not in ('FLASHCARD','QUIZ') then raise exception 'invalid activity'; end if;
  if activity_kind='FLASHCARD' and result_kind not in ('KNOWN','UNKNOWN') then raise exception 'invalid flashcard result'; end if;
  if activity_kind='QUIZ' and result_kind not in ('CORRECT','WRONG') then raise exception 'invalid quiz result'; end if;

  perform pg_advisory_xact_lock(hashtext(uid::text));

  select * into old_row from public.user_hanja_progress
  where user_id=uid and hanja_id=target_hanja_id
  for update;

  if activity_kind='QUIZ' and not found then raise exception 'progress not found'; end if;

  if activity_kind='FLASHCARD' then
    is_correct := result_kind='KNOWN';
    new_mastery := greatest(0,least(85,coalesce(old_row.mastery_score,0)+(case when is_correct then 8 else -12 end)));
    new_stage := case when is_correct then least(7,coalesce(old_row.review_stage,0)+1)
                      when coalesce(old_row.review_stage,0)<=2 then 0
                      else greatest(0,old_row.review_stage-2) end;
    next_at := now_at + (case new_stage when 0 then interval '0 days' when 1 then interval '1 day' when 2 then interval '3 days' when 3 then interval '7 days' when 4 then interval '14 days' when 5 then interval '30 days' when 6 then interval '60 days' else interval '120 days' end);

    insert into public.user_hanja_progress(user_id,hanja_id,learning_state,mastery_score,study_count,correct_count,wrong_count,correct_streak,wrong_streak,review_stage,next_review_at,last_studied_at,first_learned_at,updated_at)
    values(uid,target_hanja_id,'LEARNING',new_mastery,coalesce(old_row.study_count,0)+1,coalesce(old_row.correct_count,0)+(case when is_correct then 1 else 0 end),coalesce(old_row.wrong_count,0)+(case when is_correct then 0 else 1 end),case when is_correct then coalesce(old_row.correct_streak,0)+1 else 0 end,case when is_correct then 0 else coalesce(old_row.wrong_streak,0)+1 end,new_stage,next_at,now_at,coalesce(old_row.first_learned_at,now_at),now_at)
    on conflict(user_id,hanja_id) do update set learning_state=excluded.learning_state,mastery_score=excluded.mastery_score,study_count=excluded.study_count,correct_count=excluded.correct_count,wrong_count=excluded.wrong_count,correct_streak=excluded.correct_streak,wrong_streak=excluded.wrong_streak,review_stage=excluded.review_stage,next_review_at=excluded.next_review_at,last_studied_at=excluded.last_studied_at,first_learned_at=excluded.first_learned_at,updated_at=excluded.updated_at;
  else
    is_correct := result_kind='CORRECT';
    new_mastery := greatest(0,least(100,old_row.mastery_score+(case when is_correct then 5 else -8 end)));
    new_stage := old_row.review_stage;
    update public.user_hanja_progress set mastery_score=new_mastery,correct_count=correct_count+(case when is_correct then 1 else 0 end),wrong_count=wrong_count+(case when is_correct then 0 else 1 end),correct_streak=case when is_correct then correct_streak+1 else 0 end,wrong_streak=case when is_correct then 0 else wrong_streak+1 end,last_studied_at=now_at,updated_at=now_at where user_id=uid and hanja_id=target_hanja_id;
  end if;

  insert into public.review_history(user_id,hanja_id,activity_type,question_type,result,mastery_before,mastery_after,review_stage_before,review_stage_after)
  values(uid,target_hanja_id,activity_kind,question_kind,result_kind,coalesce(old_row.mastery_score,0),new_mastery,coalesce(old_row.review_stage,0),new_stage);
end;
$fn$;
revoke all on function public.record_study_result(bigint,text,text,text) from public, anon;
grant execute on function public.record_study_result(bigint,text,text,text) to authenticated;
