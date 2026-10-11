-- Proposed small dictionary metadata seed. REVIEW REQUIRED before executing.
-- This file intentionally does NOT run as an automatic migration.
-- Preserve pre-existing formation_type and avoid overwriting non-null values.
-- Confirm each entry against the exam provider's official dictionary first.
begin;
with reviewed(hanja_character,radical,total_strokes) as (
 values ('一','一',1),('二','二',2),('三','一',3),
        ('十','十',2),('口','口',3),('土','土',3)
), mapped as (
 select h.id as hanja_id,r.radical,r.total_strokes
 from reviewed r join public.hanja h on h.character=r.hanja_character
)
insert into public.hanja_exam_metadata
 (hanja_id,radical,total_strokes,content_status,source_note)
select hanja_id,radical,total_strokes,'DRAFT',
       'Candidate dictionary metadata; provider-specific source review required'
from mapped
on conflict (hanja_id) do update
set radical=coalesce(public.hanja_exam_metadata.radical,excluded.radical),
    total_strokes=coalesce(public.hanja_exam_metadata.total_strokes,excluded.total_strokes),
    updated_at=now()
where public.hanja_exam_metadata.radical is null
   or public.hanja_exam_metadata.total_strokes is null;
-- The draft candidates MUST NOT become exam-visible without independent review.
rollback;
