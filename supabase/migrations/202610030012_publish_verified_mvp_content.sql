-- Task 6: publish the verified MVP content so authenticated learners can study it.
-- Scope is limited to DAEHAN grades 8 through 5 already covered by integrity guards.
do $$
declare
  v_count integer;
begin
  select count(distinct gh.hanja_id) into v_count
  from public.grade_hanja gh
  join public.exam_grades eg on eg.id=gh.grade_id
  join public.exam_providers ep on ep.id=eg.provider_id
  join public.hanja_content_integrity i on i.hanja_id=gh.hanja_id
  where ep.code='DAEHAN' and eg.code='5'
    and i.primary_reading_count=1 and i.verified_primary_reading_count=1;
  if v_count <> 250 then raise exception 'Expected 250 verified grade-5 Hanja, got %', v_count; end if;

  update public.hanja h set content_status='PUBLISHED', updated_at=now()
  where exists (
    select 1 from public.grade_hanja gh
    join public.exam_grades eg on eg.id=gh.grade_id
    join public.exam_providers ep on ep.id=eg.provider_id
    where gh.hanja_id=h.id and ep.code='DAEHAN' and eg.code='5'
  );
end $$;
