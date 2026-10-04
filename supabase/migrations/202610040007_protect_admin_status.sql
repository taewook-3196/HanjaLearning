-- Prevent operator accounts from being suspended/rejected through direct table updates.
create or replace function public.protect_admin_account_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if exists(select 1 from public.admin_users ad where ad.user_id = old.user_id)
     and new.status is distinct from old.status then
    raise exception 'cannot change an admin account status';
  end if;
  return new;
end;
$fn$;

drop trigger if exists protect_admin_account_status_trigger on public.account_status;
create trigger protect_admin_account_status_trigger
before update on public.account_status
for each row execute procedure public.protect_admin_account_status();

revoke all on function public.protect_admin_account_status() from public, anon, authenticated;
