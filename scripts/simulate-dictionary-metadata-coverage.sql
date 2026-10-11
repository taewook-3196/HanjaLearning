-- READ ONLY. Simulate reviewed dictionary candidates without writing to production.
-- These candidates remain subject to exam-provider-specific verification.
with candidates(character,radical,strokes) as (
 values ('一','一',1),('二','二',2),('三','一',3),
        ('十','十',2),('口','口',3),('土','土',3),
        ('上','一',3),('下','一',3)
), grade_meta as (
 select g.code,h.character,
        coalesce(m.radical,c.radical) as radical,
        coalesce(m.total_strokes,c.strokes) as strokes
 from public.exam_grades g
 join public.grade_hanja gh on gh.grade_id=g.id
 join public.hanja h on h.id=gh.hanja_id
 left join public.hanja_exam_metadata m
   on m.hanja_id=h.id and m.content_status='PUBLISHED'
 left join candidates c on c.character=h.character
 where g.code in ('6','PRE5')
), diversity as (
 select code,count(distinct radical) as distinct_radicals,
        count(distinct strokes) as distinct_strokes
 from grade_meta group by code
)
select gm.code,d.distinct_radicals,d.distinct_strokes,
       count(*) filter(where gm.radical is not null
         and gm.radical<>gm.character and d.distinct_radicals>=4) as radical_candidates,
       count(*) filter(where gm.strokes is not null
         and d.distinct_strokes>=4) as stroke_candidates
from grade_meta gm join diversity d on d.code=gm.code
group by gm.code,d.distinct_radicals,d.distinct_strokes
order by gm.code;
