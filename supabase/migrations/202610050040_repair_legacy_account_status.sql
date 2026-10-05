-- Repair legacy auth users that may not have an account_status row.
-- Existing users predate the public-signup approval model and should remain ACTIVE.
insert into public.account_status(user_id,login_id,status,nickname,application_message)
select
  u.id,
  lower(split_part(u.email,'@',1)),
  'ACTIVE',
  left(coalesce(nullif(btrim(u.raw_user_meta_data->>'nickname'),''),split_part(u.email,'@',1)),30),
  '기존 계정 자동 복구'
from auth.users u
where u.email is not null
  and not exists(select 1 from public.account_status a where a.user_id=u.id)
on conflict do nothing;

do $body$
declare v_missing integer;
begin
 select count(*) into v_missing
 from auth.users u
 where u.email is not null
   and not exists(select 1 from public.account_status a where a.user_id=u.id);
 if v_missing<>0 then
   raise exception 'Existing auth users still missing account_status: %',v_missing;
 end if;
end $body$;
