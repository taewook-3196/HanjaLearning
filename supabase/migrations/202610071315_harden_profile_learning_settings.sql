-- Keep profile exam metadata canonical and make settings saves self-healing.
-- Repairs legacy profiles (including values stored as display labels such as "5급").
update public.profiles p
set target_provider = ep.code, updated_at = now()
from public.user_settings us
join public.exam_providers ep on ep.id = us.exam_provider_id
where us.user_id = p.user_id
  and p.target_provider is null;

update public.profiles p
set target_grade = eg.code, updated_at = now()
from public.user_settings us
join public.exam_grades eg on eg.provider_id = us.exam_provider_id
where us.user_id = p.user_id
  and p.target_grade = eg.name
  and p.target_grade is distinct from eg.code;

create or replace function public.save_onboarding_settings(
  target_nickname text,
  target_provider_code text,
  target_grade_code text,
  target_exam_provider_id bigint,
  target_exam_date date default null
) returns void language plpgsql set search_path='public' as $fn$
declare uid uuid:=auth.uid(); canonical_provider text;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if target_nickname is null or btrim(target_nickname)='' or char_length(btrim(target_nickname))>30 then raise exception 'invalid nickname'; end if;
  if target_provider_code is null or btrim(target_provider_code)='' then raise exception 'provider required'; end if;
  if target_grade_code is null or btrim(target_grade_code)='' then raise exception 'grade required'; end if;
  if target_exam_provider_id is null then raise exception 'provider id required'; end if;
  select code into canonical_provider from public.exam_providers where id=target_exam_provider_id;
  if canonical_provider is null or canonical_provider<>target_provider_code then raise exception 'provider mismatch'; end if;
  if not exists(select 1 from public.exam_grades where provider_id=target_exam_provider_id and code=target_grade_code) then raise exception 'invalid grade'; end if;
  if target_exam_date is not null and target_exam_date < (now() at time zone 'Asia/Seoul')::date then raise exception 'exam date must not be in the past'; end if;

  update public.profiles
  set nickname=btrim(target_nickname),target_provider=canonical_provider,target_grade=target_grade_code,updated_at=now()
  where user_id=uid;
  if not found then raise exception 'profile not found'; end if;

  insert into public.user_settings(user_id,exam_provider_id,target_exam_date,updated_at)
  values(uid,target_exam_provider_id,target_exam_date,now())
  on conflict(user_id) do update
  set exam_provider_id=excluded.exam_provider_id,target_exam_date=excluded.target_exam_date,updated_at=excluded.updated_at;
end;$fn$;

create or replace function public.save_learning_settings(
  target_provider_code text,
  target_grade_code text,
  target_exam_provider_id bigint,
  target_sound_enabled boolean,
  target_speech_voice text,
  target_exam_date date default null
) returns void language plpgsql set search_path='public' as $fn$
declare uid uuid:=auth.uid(); canonical_provider text;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if target_provider_code is null or btrim(target_provider_code)='' then raise exception 'provider required'; end if;
  if target_grade_code is null or btrim(target_grade_code)='' then raise exception 'grade required'; end if;
  if target_exam_provider_id is null then raise exception 'provider id required'; end if;
  select code into canonical_provider from public.exam_providers where id=target_exam_provider_id;
  if canonical_provider is null or canonical_provider<>target_provider_code then raise exception 'provider mismatch'; end if;
  if not exists(select 1 from public.exam_grades where provider_id=target_exam_provider_id and code=target_grade_code) then raise exception 'invalid grade'; end if;
  if target_sound_enabled is null then raise exception 'sound preference required'; end if;
  if not (target_speech_voice in ('AUTO','DAD','WOMAN') or (target_speech_voice like 'DEVICE:%' and char_length(target_speech_voice)<=600)) then raise exception 'invalid speech voice'; end if;
  if target_exam_date is not null and target_exam_date < (now() at time zone 'Asia/Seoul')::date then raise exception 'exam date must not be in the past'; end if;

  update public.profiles set target_provider=canonical_provider,target_grade=target_grade_code,updated_at=now() where user_id=uid;
  if not found then raise exception 'profile not found'; end if;

  insert into public.user_settings(user_id,exam_provider_id,sound_enabled,speech_voice,target_exam_date,updated_at)
  values(uid,target_exam_provider_id,target_sound_enabled,target_speech_voice,target_exam_date,now())
  on conflict(user_id) do update
  set exam_provider_id=excluded.exam_provider_id,sound_enabled=excluded.sound_enabled,
      speech_voice=excluded.speech_voice,target_exam_date=excluded.target_exam_date,updated_at=excluded.updated_at;
end;$fn$;