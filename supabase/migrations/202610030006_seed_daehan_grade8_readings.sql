-- Task 3: verified primary 훈/음 for 대한검정회 8급 (30 chars).
-- Character membership source: 대한검정회 2026 선정한자훈음표.
-- 훈/음 cross-check: multiple published 대한검정회 8급 references.
-- Preserve official compatibility glyph 六 as stored in the grade seed.

with seed(character, meaning, reading) as (
  values
    ('九','아홉','구'), ('金','쇠','금'), ('南','남녘','남'), ('男','사내','남'), ('女','여자','녀'),
    ('東','동녘','동'), ('六','여섯','륙'), ('母','어머니','모'), ('木','나무','목'), ('門','문','문'),
    ('父','아버지','부'), ('北','북녘','북'), ('四','넉','사'), ('三','석','삼'), ('西','서녘','서'),
    ('水','물','수'), ('十','열','십'), ('五','다섯','오'), ('月','달','월'), ('二','두','이'),
    ('人','사람','인'), ('日','날','일'), ('一','한','일'), ('子','아들','자'), ('弟','아우','제'),
    ('七','일곱','칠'), ('土','흙','토'), ('八','여덟','팔'), ('兄','맏','형'), ('火','불','화')
)
insert into public.hanja_readings
  (hanja_id, reading, meaning, is_primary, content_status, source_note)
select
  h.id, s.reading, s.meaning, true, 'SOURCE_VERIFIED',
  '대한검정회 2026 선정한자훈음표 + 대한검정회 8급 공개자료 교차검증'
from seed s
join public.hanja h on h.character = s.character
on conflict (hanja_id, reading, meaning)
do update set
  is_primary = true,
  content_status = 'SOURCE_VERIFIED',
  source_note = excluded.source_note;

do $$
declare
  v_provider_id bigint;
  v_grade_id bigint;
  v_count integer;
begin
  select id into v_provider_id from public.exam_providers where code='DAEHAN';
  select id into v_grade_id from public.exam_grades
    where provider_id=v_provider_id and code='8';

  select count(*) into v_count
  from public.grade_hanja gh
  join public.hanja_readings hr on hr.hanja_id=gh.hanja_id
  where gh.grade_id=v_grade_id
    and hr.is_primary
    and hr.content_status='SOURCE_VERIFIED';

  if v_count <> 30 then
    raise exception 'DAEHAN grade 8 verified reading count mismatch: %', v_count;
  end if;
end $$;
