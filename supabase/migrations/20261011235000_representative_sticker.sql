-- Representative growth sticker is a profile preference, not a reward.
alter table public.profiles add column if not exists representative_sticker_key text;

create or replace function public.set_representative_sticker(p_key text)
returns void language plpgsql security invoker set search_path = 'public'
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_key is not null and not exists (
    select 1 from public.user_growth_stickers
    where user_id = auth.uid() and sticker_key = p_key
  ) then raise exception 'sticker not owned'; end if;
  update public.profiles
  set representative_sticker_key = p_key, updated_at = now()
  where user_id = auth.uid();
  if not found then raise exception 'profile not found'; end if;
end;
$$;
revoke all on function public.set_representative_sticker(text) from public, anon;
grant execute on function public.set_representative_sticker(text) to authenticated;

-- Only accepted friends can see the selected sticker and aggregate count.
create or replace function public.friend_representative_sticker(friend_user_id uuid)
returns table(sticker_key text, sticker_count bigint)
language plpgsql stable security definer set search_path = 'public'
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.account_status a
    where a.user_id = auth.uid() and a.status = 'ACTIVE'
  ) or not exists (
    select 1 from public.account_status a
    where a.user_id = friend_user_id and a.status = 'ACTIVE'
  ) or not exists (
    select 1 from public.friendships f
    where f.status = 'ACCEPTED' and
      ((f.requester_id = auth.uid() and f.addressee_id = friend_user_id)
       or (f.addressee_id = auth.uid() and f.requester_id = friend_user_id))
  ) then raise exception 'not authorized'; end if;
  return query
    select case when exists (
      select 1 from public.user_growth_stickers g
      where g.user_id = friend_user_id and g.sticker_key = p.representative_sticker_key
    ) then p.representative_sticker_key else null end,
    (select count(*) from public.user_growth_stickers g where g.user_id = friend_user_id)
    + (select count(*) from public.user_repeatable_sticker_events r where r.user_id = friend_user_id)
    from public.profiles p where p.user_id = friend_user_id;
end;
$$;
revoke all on function public.friend_representative_sticker(uuid) from public, anon;
grant execute on function public.friend_representative_sticker(uuid) to authenticated;
