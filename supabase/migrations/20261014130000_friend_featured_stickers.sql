-- Return up to three earned featured stickers to an accepted, active friend only.
-- Keep the legacy friend_representative_sticker RPC intact for compatibility.
create or replace function public.friend_featured_stickers(friend_user_id uuid)
returns table(sticker_keys text[], sticker_count bigint)
language plpgsql stable security definer
set search_path = public
as $$
begin
  if auth.uid() is null
    or not exists (select 1 from public.account_status a where a.user_id=auth.uid() and a.status='ACTIVE')
    or not exists (select 1 from public.account_status a where a.user_id=friend_user_id and a.status='ACTIVE')
    or not exists (
      select 1 from public.friendships f
      where f.status='ACCEPTED'
        and ((f.requester_id=auth.uid() and f.addressee_id=friend_user_id)
          or (f.addressee_id=auth.uid() and f.requester_id=friend_user_id))
    )
  then raise exception 'not authorized'; end if;
  return query
    select coalesce((
      select array_agg(k.key order by k.position)
      from unnest(
        case when cardinality(p.featured_sticker_keys)>0
          then p.featured_sticker_keys
          when p.representative_sticker_key is not null
          then array[p.representative_sticker_key]
          else '{}'::text[] end
      ) with ordinality as k(key,position)
      where exists (
        select 1 from public.user_growth_stickers g
        where g.user_id=friend_user_id and g.sticker_key=k.key
      )
    ),'{}'::text[]),
    (select count(*) from public.user_growth_stickers g where g.user_id=friend_user_id)
      + (select count(*) from public.user_repeatable_sticker_events r where r.user_id=friend_user_id)
    from public.profiles p where p.user_id=friend_user_id;
end;
$$;
revoke all on function public.friend_featured_stickers(uuid) from public;
grant execute on function public.friend_featured_stickers(uuid) to authenticated;
