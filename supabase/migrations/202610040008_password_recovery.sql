-- One-time password recovery codes. Plain recovery codes are never stored.
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.password_reset_tokens enable row level security;

revoke all on public.password_reset_tokens from public, anon, authenticated;

create or replace function public.admin_create_password_reset(target_user_id uuid, token_digest text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_app_admin() then raise exception 'admin only'; end if;
  if target_user_id = auth.uid() then raise exception 'cannot reset current admin'; end if;
  if exists(select 1 from public.admin_users where user_id = target_user_id) then raise exception 'cannot reset admin account'; end if;
  if not exists(select 1 from public.account_status where user_id = target_user_id) then raise exception 'account not found'; end if;
  delete from public.password_reset_tokens where user_id = target_user_id and used_at is null;
  insert into public.password_reset_tokens(user_id,token_hash,expires_at,created_by)
  values(target_user_id,token_digest,now()+interval '15 minutes',auth.uid());
end;
$fn$;

create or replace function public.consume_password_reset(login_name text, token_digest text)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare target uuid;
begin
  select a.user_id into target
  from public.account_status a
  join public.password_reset_tokens t on t.user_id=a.user_id
  where lower(a.login_id)=lower(btrim(login_name))
    and t.token_hash=token_digest and t.used_at is null and t.expires_at>now()
    and not exists(select 1 from public.admin_users ad where ad.user_id=a.user_id)
  order by t.created_at desc limit 1 for update of t;
  if target is null then return null; end if;
  update public.password_reset_tokens set used_at=now()
  where user_id=target and token_hash=token_digest and used_at is null;
  return target;
end;
$fn$;

revoke all on function public.admin_create_password_reset(uuid,text) from public, anon;
grant execute on function public.admin_create_password_reset(uuid,text) to authenticated;
revoke all on function public.consume_password_reset(text,text) from public, authenticated;
grant execute on function public.consume_password_reset(text,text) to anon;
