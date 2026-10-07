-- Ensure every newly registered user has the settings row required by onboarding/settings RPCs.
create or replace function public.handle_new_public_user()
returns trigger language plpgsql security definer set search_path='public' as $$
declare
  requested_login_id text;
  initial_status text;
  default_provider_id bigint;
begin
  requested_login_id := lower(coalesce(new.raw_user_meta_data->>'login_id', split_part(new.email,'@',1)));
  if requested_login_id !~ '^[a-z0-9][a-z0-9_-]{2,19}$' then raise exception 'invalid login id'; end if;
  initial_status := case when coalesce((select signup_approval_mode from public.app_settings where id=true),'AUTO')='AUTO' then 'ACTIVE' else 'PENDING' end;
  insert into public.account_status(user_id,login_id,status,nickname,application_message)
  values(new.id,requested_login_id,initial_status,btrim(new.raw_user_meta_data->>'nickname'),left(coalesce(new.raw_user_meta_data->>'application_message',''),300));

  select id into default_provider_id from public.exam_providers order by id limit 1;
  if default_provider_id is not null then
    insert into public.user_settings(user_id,exam_provider_id)
    values(new.id,default_provider_id)
    on conflict(user_id) do nothing;
  end if;
  return new;
end $$;

-- Repair accounts created while the trigger did not initialize user_settings.
insert into public.user_settings(user_id,exam_provider_id)
select p.user_id,coalesce(ep.id,(select id from public.exam_providers order by id limit 1))
from public.profiles p
left join public.user_settings us on us.user_id=p.user_id
left join public.exam_providers ep on ep.code=p.target_provider
where us.user_id is null
on conflict(user_id) do nothing;
