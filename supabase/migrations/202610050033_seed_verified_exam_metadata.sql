-- Seed source-verified radical and total-stroke metadata for dictionary-style questions.
-- Sources are National Institute of Korean Language Korean Basic Dictionary entries
-- that expose each Hanja's radical and total stroke count.

with facts(character,radical,total_strokes,source_note) as (
 values
 ('人','人',2,'국립국어원 한국어기초사전 인산인해(人山人海), ParaWordNo=72906 · 부수 人/총획 2 · 확인 2026-10-05'),
 ('山','山',3,'국립국어원 한국어기초사전 인산인해(人山人海), ParaWordNo=72906 · 부수 山/총획 3 · 확인 2026-10-05'),
 ('水','水',4,'국립국어원 한국어기초사전 수평선(水平線), ParaWordNo=64704 · 부수 水/총획 4 · 확인 2026-10-05'),
 ('午','十',4,'국립국어원 한국어기초사전 오전(午前), ParaWordNo=20246 · 부수 十/총획 4 · 확인 2026-10-05'),
 ('前','刀',9,'국립국어원 한국어기초사전 오전(午前), ParaWordNo=20246 · 부수 刀/총획 9 · 확인 2026-10-05'),
 ('後','彳',9,'국립국어원 한국어기초사전 오후반(午後班), ParaWordNo=68248 · 부수 彳/총획 9 · 확인 2026-10-05')
)
insert into public.hanja_exam_metadata(hanja_id,radical,total_strokes,content_status,source_note)
select h.id,f.radical,f.total_strokes,'PUBLISHED',f.source_note
from facts f join public.hanja h on h.character=f.character
on conflict(hanja_id) do update set
 radical=excluded.radical,
 total_strokes=excluded.total_strokes,
 content_status='PUBLISHED',
 source_note=excluded.source_note,
 updated_at=now();

do $body$
declare v_count integer; v_distinct_radicals integer; v_bad integer;
begin
 select count(*) into v_count
 from public.hanja_exam_metadata
 where source_note like '국립국어원 한국어기초사전%확인 2026-10-05';
 if v_count<>6 then raise exception 'Expected 6 verified metadata rows, got %',v_count; end if;

 select count(distinct radical) into v_distinct_radicals
 from public.hanja_exam_metadata
 where source_note like '국립국어원 한국어기초사전%확인 2026-10-05';
 if v_distinct_radicals<4 then raise exception 'Need at least 4 distinct radicals for distractors, got %',v_distinct_radicals; end if;

 select count(*) into v_bad
 from public.hanja_exam_metadata
 where source_note like '국립국어원 한국어기초사전%확인 2026-10-05'
   and (radical is null or total_strokes is null or total_strokes<=0);
 if v_bad<>0 then raise exception 'Incomplete verified metadata rows: %',v_bad; end if;
end $body$;
