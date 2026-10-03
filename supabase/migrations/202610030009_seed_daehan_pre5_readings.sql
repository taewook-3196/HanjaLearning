-- Task 3: 대한검정회 준5급 신규 30자 대표 훈/음.
-- 선정한자: 대한검정회 2026 등급별 선정한자훈음표.
-- 공식 표기 호환한자(車, 不)를 그대로 보존한다.

with seed(character, meaning, reading) as (
  values
    ('車','수레','거'),('巾','수건','건'),('古','예','고'),('工','장인','공'),('今','이제','금'),
    ('同','한가지','동'),('力','힘','력'),('立','설','립'),('末','끝','말'),('文','글월','문'),
    ('方','모','방'),('本','근본','본'),('夫','지아비','부'),('不','아니','불'),('士','선비','사'),
    ('夕','저녁','석'),('世','세상','세'),('少','적을','소'),('食','먹을','식'),('央','가운데','앙'),
    ('王','임금','왕'),('位','자리','위'),('衣','옷','의'),('字','글자','자'),('自','스스로','자'),
    ('正','바를','정'),('主','주인','주'),('寸','마디','촌'),('向','향할','향'),('休','쉴','휴')
)
insert into public.hanja_readings
  (hanja_id, reading, meaning, is_primary, content_status, source_note)
select h.id,s.reading,s.meaning,true,'SOURCE_VERIFIED',
       '대한검정회 2026 등급별 선정한자훈음표; 훈음 공개자료 교차검증'
from seed s join public.hanja h on h.character=s.character
on conflict (hanja_id,reading,meaning)
do update set is_primary=true,content_status='SOURCE_VERIFIED',source_note=excluded.source_note;

do $$
declare v_provider_id bigint; v_grade_id bigint; v_count integer;
begin
  select id into v_provider_id from public.exam_providers where code='DAEHAN';
  select id into v_grade_id from public.exam_grades
    where provider_id=v_provider_id and code='PRE5';

  select count(*) into v_count
  from public.grade_hanja gh
  where gh.grade_id=v_grade_id
    and exists (
      select 1 from public.hanja_readings hr
      where hr.hanja_id=gh.hanja_id
        and hr.is_primary
        and hr.content_status='SOURCE_VERIFIED'
    );

  if v_count <> 100 then
    raise exception 'DAEHAN PRE5 verified reading coverage mismatch: %',v_count;
  end if;
end $$;
