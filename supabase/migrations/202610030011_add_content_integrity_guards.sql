-- Task 3: content integrity guards after completing 대한검정회 8급~5급.
-- Enforce one primary reading per Hanja and add a reusable integrity audit view.

do $$
begin
  if exists (
    select 1 from public.hanja_readings
    where is_primary
    group by hanja_id
    having count(*) > 1
  ) then
    raise exception 'Multiple primary readings exist for at least one Hanja';
  end if;
end $$;

create unique index if not exists uq_hanja_readings_one_primary
  on public.hanja_readings(hanja_id)
  where is_primary;

create or replace view public.hanja_content_integrity as
select
  h.id as hanja_id,
  h.character,
  count(hr.id) filter (where hr.is_primary) as primary_reading_count,
  count(hr.id) filter (
    where hr.is_primary and hr.content_status='SOURCE_VERIFIED'
  ) as verified_primary_reading_count
from public.hanja h
left join public.hanja_readings hr on hr.hanja_id=h.id
group by h.id,h.character;

revoke all on public.hanja_content_integrity from anon;
grant select on public.hanja_content_integrity to authenticated;
