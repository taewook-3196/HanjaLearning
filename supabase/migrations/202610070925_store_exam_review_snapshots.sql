alter table public.exam_attempt_questions
 add column if not exists question_snapshot jsonb,
 add column if not exists selected_answer text,
 add column if not exists correct_answer text;

create or replace function public.save_exam_attempt(
 target_grade_id bigint,target_exam_mode text,target_questions jsonb,target_answers jsonb
) returns bigint
language plpgsql security invoker set search_path=public
as $$
declare v_user uuid:=(select auth.uid()); v_attempt bigint; v_count int; v_expected_count int; v_correct int; v_score int; v_pass int;
begin
 if v_user is null then raise exception 'authentication required'; end if;
 if target_exam_mode not in ('FIELD','ONLINE') then raise exception 'invalid exam mode'; end if;
 if jsonb_typeof(target_questions)<>'array' or jsonb_array_length(target_questions)=0 then raise exception 'questions required'; end if;
 if jsonb_typeof(target_answers)<>'object' then raise exception 'answers must be an object'; end if;
 v_count:=jsonb_array_length(target_questions);
 select question_count,passing_percent into v_expected_count,v_pass from public.exam_specs where grade_id=target_grade_id and exam_mode=target_exam_mode;
 if v_pass is null or v_expected_count is null then raise exception 'exam spec not found'; end if;
 if v_count<>v_expected_count then raise exception 'question count mismatch: expected %, got %',v_expected_count,v_count; end if;
 if exists(select 1 from jsonb_array_elements(target_questions) q(item) where nullif(btrim(item->>'id'),'') is null or nullif(btrim(item->>'type'),'') is null or nullif(btrim(item->>'correct'),'') is null) then raise exception 'question id, type, and correct are required'; end if;
 if (select count(*) from (select item->>'id' id from jsonb_array_elements(target_questions) q(item) group by item->>'id' having count(*)>1) d)>0 then raise exception 'duplicate question id'; end if;
 if exists(select 1 from jsonb_object_keys(target_answers) k where k !~ '^[0-9]+$' or k::int<0 or k::int>=v_count) then raise exception 'invalid answer index'; end if;
 select count(*) into v_correct from jsonb_array_elements(target_questions) with ordinality q(item,ord) where coalesce(target_answers->>(ord-1)::text,'')=item->>'correct';
 v_score:=round(v_correct*100.0/v_count);
 insert into public.exam_attempts(user_id,grade_id,exam_mode,question_count,correct_count,score_percent,passed,submitted_at) values(v_user,target_grade_id,target_exam_mode,v_count,v_correct,v_score,v_score>=v_pass,now()) returning id into v_attempt;
 insert into public.exam_attempt_questions(attempt_id,user_id,position,question_key,question_type,answered_correctly,question_snapshot,selected_answer,correct_answer)
 select v_attempt,v_user,ord,item->>'id',item->>'type',coalesce(target_answers->>(ord-1)::text,'')=item->>'correct',item - 'correct',nullif(target_answers->>(ord-1)::text,''),item->>'correct' from jsonb_array_elements(target_questions) with ordinality q(item,ord);
 return v_attempt;
end $$;
revoke all on function public.save_exam_attempt(bigint,text,jsonb,jsonb) from public,anon;
grant execute on function public.save_exam_attempt(bigint,text,jsonb,jsonb) to authenticated;
