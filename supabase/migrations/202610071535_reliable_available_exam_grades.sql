create or replace function public.list_available_exam_grades()
returns table(id bigint,provider_id bigint,code text,name text,cumulative_hanja_count integer,sort_order integer)
language sql stable security definer set search_path=public as $$
 select eg.id,eg.provider_id,eg.code,eg.name,eg.cumulative_hanja_count,eg.sort_order
 from public.exam_grades eg
 where eg.cumulative_hanja_count is not null
 and (select count(*) from public.grade_hanja gh join public.hanja h on h.id=gh.hanja_id where gh.grade_id=eg.id and h.content_status='PUBLISHED')=eg.cumulative_hanja_count
 order by eg.provider_id,eg.sort_order;
$$;
revoke all on function public.list_available_exam_grades() from public,anon;
grant execute on function public.list_available_exam_grades() to authenticated;
