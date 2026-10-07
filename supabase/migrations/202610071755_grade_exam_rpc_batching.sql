create or replace function public.list_grade_hanja_core(target_grade_id bigint)
returns table(hanja_id bigint, hanja_character text, reading text, meaning text)
language sql stable security definer set search_path=public as $$
 select h.id,h.character,r.reading,r.meaning from public.grade_hanja gh join public.hanja h on h.id=gh.hanja_id and h.content_status='PUBLISHED' join public.hanja_readings r on r.hanja_id=h.id and r.is_primary=true where gh.grade_id=target_grade_id order by gh.sequence_no,h.id
$$;
revoke all on function public.list_grade_hanja_core(bigint) from public,anon;
grant execute on function public.list_grade_hanja_core(bigint) to authenticated;
create or replace function public.list_grade_exam_hanja_support(target_grade_id bigint)
returns jsonb language sql stable security definer set search_path=public as $$
with ids as (select hanja_id from public.grade_hanja where grade_id=target_grade_id)
select jsonb_build_object(
'metadata',coalesce((select jsonb_agg(to_jsonb(x)) from (select m.hanja_id,m.radical,m.total_strokes,m.formation_type from public.hanja_exam_metadata m join ids i on i.hanja_id=m.hanja_id where m.content_status='PUBLISHED') x),'[]'::jsonb),
'relations',coalesce((select jsonb_agg(to_jsonb(x)) from (select r.from_hanja_id,r.to_hanja_id,r.relation_type from public.hanja_relations r join ids a on a.hanja_id=r.from_hanja_id join ids b on b.hanja_id=r.to_hanja_id where r.relation_type in('SIMILAR','OPPOSITE') and r.content_status='PUBLISHED') x),'[]'::jsonb),
'common_sets',coalesce((select jsonb_agg(to_jsonb(x)) from (select c.id,c.common_hanja_id from public.hanja_common_character_sets c join ids i on i.hanja_id=c.common_hanja_id where c.content_status='PUBLISHED') x),'[]'::jsonb),
'usage_items',coalesce((select jsonb_agg(to_jsonb(x)) from (select u.id,u.hanja_id,u.prompt,u.choice_a,u.choice_b,u.choice_c,u.choice_d,u.correct_choice from public.hanja_usage_items u join ids i on i.hanja_id=u.hanja_id where u.content_status='PUBLISHED') x),'[]'::jsonb),
'special_readings',coalesce((select jsonb_agg(to_jsonb(x)) from (select s.id,s.hanja_id,s.reading,s.meaning,s.usage_note,s.choice_a,s.choice_b,s.choice_c,s.choice_d,s.correct_choice from public.hanja_special_readings s join ids i on i.hanja_id=s.hanja_id where s.content_status='PUBLISHED') x),'[]'::jsonb),
'image_items',coalesce((select jsonb_agg(to_jsonb(x)) from (select im.id,im.hanja_id,im.asset_path,im.alt_text from public.hanja_image_items im join ids i on i.hanja_id=im.hanja_id where im.asset_license in('APP_ORIGINAL','CC0') and im.content_status='PUBLISHED') x),'[]'::jsonb)
) $$;
revoke all on function public.list_grade_exam_hanja_support(bigint) from public,anon;
grant execute on function public.list_grade_exam_hanja_support(bigint) to authenticated;