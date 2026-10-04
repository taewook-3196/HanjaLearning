-- Public-service account administration metadata.
-- Learners can read their own row only. Admin/service-role tooling can manage all rows server-side.

create table if not exists public.account_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  login_id text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','REJECTED','SUSPENDED')),
  nickname text,
  application_message text not null default '' check (char_length(application_message) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.account_status enable row level security;
alter table public.admin_users enable row level security;

create policy "account_status_select_own"
  on public.account_status for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.account_status from anon;
grant select on table public.account_status to authenticated;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $
  select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$;

grant execute on function public.is_app_admin() to authenticated;

create policy "account_status_admin_select"
  on public.account_status for select to authenticated
  using (public.is_app_admin());

create policy "account_status_admin_update"
  on public.account_status for update to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

grant update on table public.account_status to authenticated;

create or replace function public.handle_new_public_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_login_id text;
begin
  requested_login_id := lower(coalesce(new.raw_user_meta_data ->> 'login_id', split_part(new.email, '@', 1)));
  if requested_login_id !~ '^[a-z0-9][a-z0-9_-]{2,19}$' then
    raise exception 'invalid login id';
  end if;

  insert into public.account_status(user_id, login_id, nickname, application_message)
  values (
    new.id,
    requested_login_id,
    nullif(new.raw_user_meta_data ->> 'nickname', ''),
    left(coalesce(new.raw_user_meta_data ->> 'application_message', ''), 300)
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_account_status on auth.users;
create trigger on_auth_user_created_account_status
  after insert on auth.users
  for each row execute procedure public.handle_new_public_user();

insert into public.account_status(user_id, login_id, nickname, application_message)
select id, lower(split_part(email, '@', 1)), coalesce(raw_user_meta_data ->> 'nickname', split_part(email, '@', 1)), '기존 계정'
from auth.users
where email is not null
on conflict (user_id) do nothing;
