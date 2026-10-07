create or replace function public.list_grade_exam_word_support(target_grade_id bigint)
returns jsonb
language sql stable security definer
set search_path=public
as $$
with words as (
 select word_id from public.list_grade_exam_words(target_grade_id)
)
select jsonb_build_object(
 'relations',coalesce((select jsonb_agg(to_jsonb(x)) from (
  select r.from_word_id,r.to_word_id,r.relation_type from public.hanja_word_relations r
  join words a on a.word_id=r.from_word_id join words b on b.word_id=r.to_word_id
  where r.relation_type in('SIMILAR','OPPOSITE') and r.content_status='PUBLISHED'
 ) x),'[]'::jsonb),
 'contexts',coalesce((select jsonb_agg(to_jsonb(x)) from (
  select c.id,c.word_id,c.sentence,c.blank_text from public.hanja_word_contexts c
  join words w on w.word_id=c.word_id where c.content_status='PUBLISHED'
 ) x),'[]'::jsonb),
 'structures',coalesce((select jsonb_agg(to_jsonb(x)) from (
  select s.word_id,s.structure_type from public.hanja_word_structures s
  join words w on w.word_id=s.word_id where s.content_status='PUBLISHED'
 ) x),'[]'::jsonb)
) $$;
revoke all on function public.list_grade_exam_word_support(bigint) from public,anon;
grant execute on function public.list_grade_exam_word_support(bigint) to authenticated;
