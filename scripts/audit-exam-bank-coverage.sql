-- Read-only audit of mock-exam question-bank coverage. No writes.
-- Exact grade membership (not cumulative); inspect before publishing metadata.
select g.code as grade_code,
       count(distinct gh.hanja_id) as grade_characters,
       count(distinct case when m.radical is not null then gh.hanja_id end) as radicals_recorded,
       count(distinct case when m.total_strokes is not null then gh.hanja_id end) as strokes_recorded
from public.exam_grades g
join public.grade_hanja gh on gh.grade_id=g.id
left join public.hanja_exam_metadata m on m.hanja_id=gh.hanja_id
where g.code in ('8','7','6','PRE5')
group by g.code order by g.code;

-- Missing data requiring source verification (never auto-fill by guessing).
select g.code as grade_code, h.id as hanja_id, h.character,
       m.radical, m.total_strokes,
       case when m.radical is null then 'MISSING' else 'PRESENT' end as radical_status,
       case when m.total_strokes is null then 'MISSING' else 'PRESENT' end as stroke_status
from public.exam_grades g
join public.grade_hanja gh on gh.grade_id=g.id
join public.hanja h on h.id=gh.hanja_id
left join public.hanja_exam_metadata m on m.hanja_id=h.id
where g.code in ('6','PRE5')
  and (m.radical is null or m.total_strokes is null)
order by g.code,h.character;

-- Pictorial assets are not published until human review and matching are complete.
select content_status,count(*) from public.hanja_image_items group by content_status;

-- Publication status matters: only PUBLISHED metadata is eligible for exams.
-- Verify actual usable distractor diversity per grade, not just raw row counts.
with grade_meta as (
 select g.code, h.character, m.radical, m.total_strokes
 from public.exam_grades g
 join public.grade_hanja gh on gh.grade_id=g.id
 join public.hanja h on h.id=gh.hanja_id
 left join public.hanja_exam_metadata m
   on m.hanja_id=h.id and m.content_status='PUBLISHED'
 where g.code in ('6','PRE5')
), diversity as (
 select code,
        count(distinct radical) filter (where radical is not null) as distinct_radicals,
        count(distinct total_strokes) filter (where total_strokes is not null) as distinct_strokes
 from grade_meta group by code
)
select m.code,
       count(*) filter (where m.radical is not null and m.radical<>m.character and d.distinct_radicals>=4) as potential_radical_questions,
       count(*) filter (where m.total_strokes is not null and d.distinct_strokes>=4) as potential_stroke_questions,
       d.distinct_radicals,d.distinct_strokes
from grade_meta m join diversity d on d.code=m.code
group by m.code,d.distinct_radicals,d.distinct_strokes order by m.code;

-- Human-reviewed import preparation: no writes, no guessed radical/stroke values.
select g.code as grade_code,h.id as hanja_id,h.character,
       m.content_status,m.source_note,m.radical,m.total_strokes
from public.exam_grades g
join public.grade_hanja gh on gh.grade_id=g.id
join public.hanja h on h.id=gh.hanja_id
left join public.hanja_exam_metadata m on m.hanja_id=h.id
where g.code in ('6','PRE5') and
      (m.hanja_id is null or m.radical is null or m.total_strokes is null or m.content_status<>'PUBLISHED')
order by g.code,h.character;
