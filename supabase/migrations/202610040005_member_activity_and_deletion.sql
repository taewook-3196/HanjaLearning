-- Track member activity and allow safe operator account deletion.
alter table public.account_status add column if not exists last_seen_at timestamptz;
update public.account_status set last_seen_at=coalesce(last_seen_at,created_at) where last_seen_at is null;
alter table public.account_status alter column last_seen_at set default now();

create or replace function public.touch_last_seen()
returns void language sql security definer set search_path=public as $fn$
 update public.account_status set last_seen_at=now()
 where user_id=(select auth.uid()) and status='ACTIVE';
$fn$;
revoke all on function public.touch_last_seen() from public,anon;
grant execute on function public.touch_last_seen() to authenticated;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void language plpgsql security definer set search_path=public,auth as $fn$
begin
 if not public.is_app_admin() then raise exception 'admin only'; end if;
 if target_user_id=(select auth.uid()) then raise exception 'cannot delete your own account'; end if;
 if exists(select 1 from public.admin_users where user_id=target_user_id) then raise exception 'cannot delete an admin account'; end if;
 if not exists(select 1 from auth.users where id=target_user_id) then raise exception 'user not found'; end if;
 delete from auth.users where id=target_user_id;
end;
$fn$;
revoke all on function public.admin_delete_user(uuid) from public,anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
