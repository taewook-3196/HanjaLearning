-- Add one low-grade metadata row so grade 6 / pre-5 dictionary questions
-- have at least four distinct radical values among cumulative characters.

with fact(character,radical,total_strokes,source_note) as (
 values
 ('日','日',4,'한국학중앙연구원 한국민족문화대백과사전 한자 표기 교차검증 · 부수 日/총획 4 · 확인 2026-10-05')
)
insert into public.hanja_exam_metadata(hanja_id,radical,total_strokes,content_status,source_note)
select h.id,f.radical,f.total_strokes,'PUBLISHED',f.source_note
from fact f
join public.hanja h on h.character=f.character and h.content_status='PUBLISHED'
on conflict(hanja_id) do update set
 radical=excluded.radical,
 total_strokes=excluded.total_strokes,
 content_status='PUBLISHED',
 source_note=excluded.source_note,
 updated_at=now();

do $body$
declare v_low_count integer; v_radicals integer;
begin
 select count(*) into v_low_count
 from public.hanja_exam_metadata m
 join public.hanja h on h.id=m.hanja_id
 where h.character in ('人','山','水','日')
   and m.content_status='PUBLISHED'
   and m.radical is not null
   and m.total_strokes is not null;
 if v_low_count<>4 then raise exception 'Expected four low-grade metadata rows, got %',v_low_count; end if;

 select count(distinct m.radical) into v_radicals
 from public.hanja_exam_metadata m
 join public.hanja h on h.id=m.hanja_id
 where h.character in ('人','山','水','日')
   and m.content_status='PUBLISHED';
 if v_radicals<>4 then raise exception 'Expected four distinct low-grade radicals, got %',v_radicals; end if;
end $body$;
