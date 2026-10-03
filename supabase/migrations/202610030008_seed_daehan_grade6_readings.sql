-- Task 3: primary 훈/음 for 대한검정회 6급 신규 20자.
-- Official membership source: 대한검정회 2026 등급별 선정한자훈음표.
-- 훈/음 values were cross-checked against published grade references.

with seed(character, meaning, reading) as (
  values
    ('犬','개','견'), ('己','몸','기'), ('林','수풀','림'), ('馬','말','마'), ('名','이름','명'),
    ('百','일백','백'), ('生','날','생'), ('石','돌','석'), ('先','먼저','선'), ('姓','성씨','성'),
    ('心','마음','심'), ('羊','양','양'), ('魚','물고기','어'), ('玉','구슬','옥'), ('牛','소','우'),
    ('耳','귀','이'), ('地','땅','지'), ('千','일천','천'), ('天','하늘','천'), ('川','내','천')
)
insert into public.hanja_readings
  (hanja_id, reading, meaning, is_primary, content_status, source_note)
select h.id, s.reading, s.meaning, true, 'SOURCE_VERIFIED',
       '대한검정회 2026 등급별 선정한자훈음표; 공개자료 교차검증'
from seed s
join public.hanja h on h.character=s.character
on conflict (hanja_id, reading, meaning)
do update set is_primary=true,
              content_status='SOURCE_VERIFIED',
              source_note=excluded.source_note;

do $$
declare
  v_provider_id bigint;
  v_grade_id bigint;
  v_count integer;
begin
  select id into v_provider_id from public.exam_providers where code='DAEHAN';
  select id into v_grade_id from public.exam_grades
    where provider_id=v_provider_id and code='6';

  select count(*) into v_count
  from public.grade_hanja gh
  where gh.grade_id=v_grade_id
    and exists (
      select 1 from public.hanja_readings hr
      where hr.hanja_id=gh.hanja_id
        and hr.is_primary
        and hr.content_status='SOURCE_VERIFIED'
    );

  if v_count <> 70 then
    raise exception 'DAEHAN grade 6 verified reading coverage mismatch: %', v_count;
  end if;
end $$;
