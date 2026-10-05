-- Harden handwriting recording so authenticated callers cannot create progress rows for unknown Hanja.
create or replace function public.record_writing_practice(target_hanja_id bigint)
returns void
language plpgsql
security invoker
set search_path=public
as $fn$
declare
 uid uuid:=auth.uid();
 old_row public.user_hanja_progress%rowtype;
 new_writing smallint;
 now_at timestamptz:=now();
begin
 if uid is null then raise exception 'authentication required'; end if;
 if target_hanja_id is null then raise exception 'hanja id required'; end if;
 if not exists(select 1 from public.hanja where id=target_hanja_id) then
  raise exception 'unknown hanja id';
 end if;

 perform pg_advisory_xact_lock(hashtext(uid::text));

 select * into old_row from public.user_hanja_progress
 where user_id=uid and hanja_id=target_hanja_id for update;

 new_writing:=least(100,coalesce(old_row.writing_score,0)+10);

 insert into public.user_hanja_progress(
  user_id,hanja_id,learning_state,mastery_score,writing_score,review_stage,
  study_count,correct_count,wrong_count,correct_streak,wrong_streak,
  first_learned_at,last_studied_at,next_review_at,updated_at
 ) values(
  uid,target_hanja_id,'LEARNING',coalesce(old_row.mastery_score,0),new_writing,
  coalesce(old_row.review_stage,0),coalesce(old_row.study_count,0),
  coalesce(old_row.correct_count,0),coalesce(old_row.wrong_count,0),
  coalesce(old_row.correct_streak,0),coalesce(old_row.wrong_streak,0),
  coalesce(old_row.first_learned_at,now_at),now_at,old_row.next_review_at,now_at
 )
 on conflict(user_id,hanja_id) do update set
  writing_score=excluded.writing_score,last_studied_at=excluded.last_studied_at,updated_at=excluded.updated_at;

 insert into public.review_history(
  user_id,hanja_id,activity_type,question_type,result,
  mastery_before,mastery_after,review_stage_before,review_stage_after
 ) values(
  uid,target_hanja_id,'WRITING','STROKE_ORDER','COMPLETE',
  coalesce(old_row.mastery_score,0),coalesce(old_row.mastery_score,0),
  coalesce(old_row.review_stage,0),coalesce(old_row.review_stage,0)
 );
end;
$fn$;

revoke all on function public.record_writing_practice(bigint) from public,anon;
grant execute on function public.record_writing_practice(bigint) to authenticated;
