-- Operator-controlled signup approval mode. Default is automatic approval.
create table if not exists public.app_settings (id boolean primary key default true check (id),signup_approval_mode text not null default 'AUTO' check (signup_approval_mode in ('AUTO','MANUAL')),updated_at timestamptz not null default now());
insert into public.app_settings(id,signup_approval_mode) values(true,'AUTO') on conflict(id) do nothing;
alter table public.app_settings enable row level security;
revoke all on table public.app_settings from anon,authenticated;
create or replace function public.get_signup_approval_mode() returns text language sql stable security definer set search_path=public as $tag$ select signup_approval_mode from public.app_settings where id=true; $tag$;
grant execute on function public.get_signup_approval_mode() to authenticated;
create or replace function public.set_signup_approval_mode(new_mode text) returns void language plpgsql security definer set search_path=public as $tag$ begin if not public.is_app_admin() then raise exception 'admin only'; end if; if new_mode not in ('AUTO','MANUAL') then raise exception 'invalid approval mode'; end if; update public.app_settings set signup_approval_mode=new_mode,updated_at=now() where id=true; end; $tag$;
grant execute on function public.set_signup_approval_mode(text) to authenticated;
create or replace function public.handle_new_public_user() returns trigger language plpgsql security definer set search_path=public as $tag$
declare requested_login_id text; initial_status text;
begin requested_login_id:=lower(coalesce(new.raw_user_meta_data->>'login_id',split_part(new.email,'@',1))); if requested_login_id !~ '^[a-z0-9][a-z0-9_-]{2,19}$' then raise exception 'invalid login id'; end if; initial_status:=case when coalesce((select signup_approval_mode from public.app_settings where id=true),'AUTO')='AUTO' then 'ACTIVE' else 'PENDING' end; insert into public.account_status(user_id,login_id,status,nickname,application_message) values(new.id,requested_login_id,initial_status,btrim(new.raw_user_meta_data->>'nickname'),left(coalesce(new.raw_user_meta_data->>'application_message',''),300)); return new; end;
$tag$;