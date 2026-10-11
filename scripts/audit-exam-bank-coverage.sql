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
