-- The app now requires exactly one exam provider per learner.
-- Preserve existing users by assigning 대한검정회 when the previous value was NULL/ALL.
do $$
declare
  v_daehan bigint;
begin
  select id into v_daehan from public.exam_providers where code='DAEHAN';
  if v_daehan is null then raise exception 'DAEHAN provider is missing'; end if;

  update public.user_settings
  set exam_provider_id=v_daehan, updated_at=now()
  where exam_provider_id is null;

  update public.profiles
  set target_provider='DAEHAN', updated_at=now()
  where target_provider is null or target_provider='ALL';
end $$;

alter table public.user_settings
  alter column exam_provider_id set not null;

comment on column public.user_settings.exam_provider_id is
  'Exactly one selected exam provider. Multi-provider/ALL selection is not supported.';
