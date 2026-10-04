-- Safer operator member-management view without exposing admin_users directly.
create or replace function public.admin_list_accounts()
returns table(
  user_id uuid,
  login_id text,
  nickname text,
  application_message text,
  status text,
  created_at timestamptz,
  last_seen_at timestamptz,
  is_admin boolean
)
language sql
stable
security definer
set search_path = public
as $fn$
  select
    a.user_id,
    a.login_id,
    a.nickname,
    a.application_message,
    a.status,
    a.created_at,
    a.last_seen_at,
    exists(select 1 from public.admin_users ad where ad.user_id = a.user_id)
  from public.account_status a
  where public.is_app_admin()
  order by a.created_at desc;
$fn$;

revoke all on function public.admin_list_accounts() from public, anon;
grant execute on function public.admin_list_accounts() to authenticated;
