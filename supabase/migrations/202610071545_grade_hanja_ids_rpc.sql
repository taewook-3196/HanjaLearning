create or replace function public.list_grade_hanja_ids(target_grade_id bigint)
returns table(hanja_id bigint,sequence_no integer)
language sql stable security definer set search_path=public as $$
 select gh.hanja_id,gh.sequence_no
 from public.grade_hanja gh join public.hanja h on h.id=gh.hanja_id
 where gh.grade_id=target_grade_id and h.content_status='PUBLISHED'
 order by gh.sequence_no,gh.hanja_id;
$$;
revoke all on function public.list_grade_hanja_ids(bigint) from public,anon;
grant execute on function public.list_grade_hanja_ids(bigint) to authenticated;
