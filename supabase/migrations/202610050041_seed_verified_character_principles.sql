-- Seed individually attested character-formation classifications for official-style questions.
-- Source: National Institute of Korean Language, "한자의 역사와 구조", 국어생활 제17호 (1989).
-- Only characters explicitly used as examples in the source are included; no inferred classifications.

with facts(character,formation_type,source_note) as (
 values
 ('日','PICTOGRAPH','국립국어원 「한자의 역사와 구조」 p.21(원문 PDF p.19), 상형 예 日·月 명시 · 확인 2026-10-05'),
 ('月','PICTOGRAPH','국립국어원 「한자의 역사와 구조」 p.21(원문 PDF p.19), 상형 예 日·月 명시 · 확인 2026-10-05'),
 ('上','IDEOGRAPH','국립국어원 「한자의 역사와 구조」 p.22(원문 PDF p.20), 지사 예 上·下 명시 · 확인 2026-10-05'),
 ('下','IDEOGRAPH','국립국어원 「한자의 역사와 구조」 p.22(원문 PDF p.20), 지사 예 上·下 명시 · 확인 2026-10-05'),
 ('一','IDEOGRAPH','국립국어원 「한자의 역사와 구조」 p.23(원문 PDF p.21), 독체지사 一 명시 · 확인 2026-10-05'),
 ('大','IDEOGRAPH','국립국어원 「한자의 역사와 구조」 p.23(원문 PDF p.21), 大를 지사자로 명시 · 확인 2026-10-05'),
 ('天','IDEOGRAPH','국립국어원 「한자의 역사와 구조」 p.23(원문 PDF p.21), 변체지사 天 명시 · 확인 2026-10-05'),
 ('江','PHONO_SEMANTIC','국립국어원 「한자의 역사와 구조」 p.25(원문 PDF p.23), 江=水+工 형성 예 명시 · 확인 2026-10-05')
)
insert into public.hanja_exam_metadata(hanja_id,formation_type,content_status,source_note)
select h.id,f.formation_type,'PUBLISHED',f.source_note
from facts f
join public.hanja h on h.character=f.character
on conflict(hanja_id) do update set
 formation_type=excluded.formation_type,
 content_status='PUBLISHED',
 source_note=case
   when public.hanja_exam_metadata.source_note is null or btrim(public.hanja_exam_metadata.source_note)='' then excluded.source_note
   when position(excluded.source_note in public.hanja_exam_metadata.source_note)>0 then public.hanja_exam_metadata.source_note
   else public.hanja_exam_metadata.source_note || ' | ' || excluded.source_note
 end,
 updated_at=now();

do $body$
declare v_count integer; v_grade6 integer;
begin
 select count(*) into v_count
 from public.hanja_exam_metadata m
 join public.hanja h on h.id=m.hanja_id
 where h.character in ('日','月','上','下','一','大','天','江')
   and m.formation_type is not null
   and m.content_status='PUBLISHED';
 if v_count<>8 then raise exception 'Expected 8 verified formation rows, got %',v_count; end if;

 select count(*) into v_grade6
 from public.hanja_exam_metadata m
 join public.grade_hanja gh on gh.hanja_id=m.hanja_id
 join public.exam_grades g on g.id=gh.grade_id
 join public.exam_providers p on p.id=g.provider_id
 where p.code='DAEHAN' and g.code='6'
   and m.formation_type is not null and m.content_status='PUBLISHED';
 if v_grade6<1 then raise exception 'Grade 6 needs at least one published formation item'; end if;
end $body$;
