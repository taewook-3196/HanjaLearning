-- Publish verified 대한검정회 content through 3급 after the 1,000-character integrity check.
-- Readings remain SOURCE_VERIFIED; authenticated learner access is gated by hanja.content_status.

do $$
declare
  v_provider bigint;
  v_grade bigint;
  v_count integer;
begin
  select id into v_provider
  from public.exam_providers
  where code='DAEHAN';

  select id into v_grade
  from public.exam_grades
  where provider_id=v_provider and code='3';

  if v_grade is null then
    raise exception 'DAEHAN grade 3 not found';
  end if;

  select count(distinct gh.hanja_id) into v_count
  from public.grade_hanja gh
  join public.hanja_content_integrity i on i.hanja_id=gh.hanja_id
  where gh.grade_id=v_grade
    and i.primary_reading_count=1
    and i.verified_primary_reading_count=1;

  if v_count <> 1000 then
    raise exception 'Expected 1000 verified grade-3 Hanja, got %', v_count;
  end if;

  update public.hanja h
  set content_status='PUBLISHED', updated_at=now()
  where exists (
    select 1
    from public.grade_hanja gh
    where gh.grade_id=v_grade
      and gh.hanja_id=h.id
  );
end $$;
