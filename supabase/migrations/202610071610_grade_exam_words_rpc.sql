create or replace function public.list_grade_exam_words(target_grade_id bigint)
returns table(word_id bigint,word text,reading text,meaning text,child_explanation text,hanja_ids bigint[])
language sql stable security definer set search_path=public as $$
 with scope as (select gh.hanja_id from public.grade_hanja gh join public.hanja h on h.id=gh.hanja_id where gh.grade_id=target_grade_id and h.content_status='PUBLISHED'),
 candidates as (select distinct m.word_id from public.hanja_word_map m where m.hanja_id in(select hanja_id from scope)),
 valid as (select c.word_id from candidates c where not exists(select 1 from public.hanja_word_map m where m.word_id=c.word_id and m.hanja_id not in(select hanja_id from scope)))
 select w.id,w.word,w.reading,w.meaning,w.child_explanation,array_agg(m.hanja_id order by m.hanja_id)::bigint[]
 from valid v join public.hanja_words w on w.id=v.word_id and w.content_status='PUBLISHED' join public.hanja_word_map m on m.word_id=w.id
 group by w.id,w.word,w.reading,w.meaning,w.child_explanation order by w.id;
$$;
revoke all on function public.list_grade_exam_words(bigint) from public,anon;
grant execute on function public.list_grade_exam_words(bigint) to authenticated;
