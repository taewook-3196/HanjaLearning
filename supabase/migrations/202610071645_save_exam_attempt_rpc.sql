create or replace function public.save_exam_attempt(
 target_grade_id bigint,target_exam_mode text,target_questions jsonb,target_answers jsonb
) returns bigint
language plpgsql security invoker set search_path=public
as $$
declare v_user uuid:=(select auth.uid()); v_attempt bigint; v_count int; v_correct int; v_score int; v_pass int;
begin
 if v_user is null then raise exception 'authentication required'; end if;
 if target_exam_mode not in ('FIELD','ONLINE') then raise exception 'invalid exam mode'; end if;
 if jsonb_typeof(target_questions)<>'array' or jsonb_array_length(target_questions)=0 then raise exception 'questions required'; end if;
 v_count:=jsonb_array_length(target_questions);
 select passing_percent into v_pass from public.exam_specs where grade_id=target_grade_id and exam_mode=target_exam_mode;
 if v_pass is null then raise exception 'exam spec not found'; end if;
 select count(*) into v_correct from jsonb_array_elements(target_questions) with ordinality q(item,ord)
 where coalesce(target_answers->>(ord-1)::text,'')=coalesce(item->>'correct','');
 v_score:=round(v_correct*100.0/v_count);
 insert into public.exam_attempts(user_id,grade_id,exam_mode,question_count,correct_count,score_percent,passed,submitted_at)
 values(v_user,target_grade_id,target_exam_mode,v_count,v_correct,v_score,v_score>=v_pass,now()) returning id into v_attempt;
 insert into public.exam_attempt_questions(attempt_id,user_id,position,question_key,question_type,answered_correctly)
 select v_attempt,v_user,ord,(item->>'id'),coalesce(item->>'type','UNKNOWN'),
 coalesce(target_answers->>(ord-1)::text,'')=coalesce(item->>'correct','')
 from jsonb_array_elements(target_questions) with ordinality q(item,ord);
 return v_attempt;
end $$;
revoke all on function public.save_exam_attempt(bigint,text,jsonb,jsonb) from public,anon;
grant execute on function public.save_exam_attempt(bigint,text,jsonb,jsonb) to authenticated;
