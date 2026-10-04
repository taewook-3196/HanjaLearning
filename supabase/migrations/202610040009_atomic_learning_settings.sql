-- Save learner target settings atomically so profiles and user_settings cannot diverge.
create or replace function public.save_learning_settings(
  target_provider_code text,
  target_grade_code text,
  target_exam_provider_id bigint
)
returns void
language plpgsql
security invoker
set search_path = public
as $fn$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'authentication required'; end if;
  if target_provider_code is null or btrim(target_provider_code) = '' then raise exception 'provider required'; end if;
  if target_grade_code is null or btrim(target_grade_code) = '' then raise exception 'grade required'; end if;
  if target_provider_code = 'ALL' and target_exam_provider_id is not null then raise exception 'ALL provider must not have provider id'; end if;
  if target_provider_code <> 'ALL' and target_exam_provider_id is null then raise exception 'provider id required'; end if;

  update public.profiles set target_provider=target_provider_code,target_grade=target_grade_code,updated_at=now() where user_id=uid;
  if not found then raise exception 'profile not found'; end if;
  update public.user_settings set exam_provider_id=target_exam_provider_id,updated_at=now() where user_id=uid;
  if not found then raise exception 'settings not found'; end if;
end;
$fn$;
revoke all on function public.save_learning_settings(text,text,bigint) from public, anon;
grant execute on function public.save_learning_settings(text,text,bigint) to authenticated;
