-- Task 3: verified primary 훈/음 for 대한검정회 7급 신규 20자.
-- Grade membership is based on the official 2026 대한검정회 선정한자훈음표.
-- 8급 30자 were seeded previously; this migration completes the cumulative 7급 50자.

with seed(character, meaning, reading) as (
  values
    ('江','강','강'), ('口','입','구'), ('內','안','내'), ('年','해','년'), ('大','큰','대'),
    ('目','눈','목'), ('白','흰','백'), ('山','메','산'), ('上','위','상'), ('小','작을','소'),
    ('手','손','수'), ('外','바깥','외'), ('右','오른쪽','우'), ('入','들','입'), ('足','발','족'),
    ('左','왼쪽','좌'), ('中','가운데','중'), ('靑','푸를','청'), ('出','날','출'), ('下','아래','하')
)
insert into public.hanja_readings
  (hanja_id, reading, meaning, is_primary, content_status, source_note)
select h.id, s.reading, s.meaning, true, 'SOURCE_VERIFIED',
       '대한검정회 2026 선정한자훈음표'
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
    where provider_id=v_provider_id and code='7';

  select count(*) into v_count
  from public.grade_hanja gh
  where gh.grade_id=v_grade_id
    and exists (
      select 1 from public.hanja_readings hr
      where hr.hanja_id=gh.hanja_id
        and hr.is_primary
        and hr.content_status='SOURCE_VERIFIED'
    );

  if v_count <> 50 then
    raise exception 'DAEHAN grade 7 verified reading coverage mismatch: %', v_count;
  end if;
end $$;
