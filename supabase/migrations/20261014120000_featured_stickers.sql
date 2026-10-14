-- Store up to three featured stickers while preserving the legacy primary sticker.
alter table public.profiles
  add column if not exists featured_sticker_keys text[] not null default '{}'::text[];
alter table public.profiles
  add constraint featured_sticker_keys_max_three
  check (cardinality(featured_sticker_keys) <= 3);

update public.profiles
set featured_sticker_keys = array[representative_sticker_key]
where representative_sticker_key is not null
  and cardinality(featured_sticker_keys)=0;

create or replace function public.set_featured_stickers(p_keys text[])
returns void language plpgsql set search_path = public as $$
declare
  keys text[] := coalesce(p_keys, '{}'::text[]);
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if cardinality(keys)>3 or cardinality(keys)<>cardinality(array(select distinct unnest(keys))) or array_position(keys,null) is not null then
    raise exception 'choose at most three unique stickers';
  end if;
  if exists (
    select 1 from unnest(keys) k
    where not exists (select 1 from public.user_growth_stickers u where u.user_id=auth.uid() and u.sticker_key=k)
  ) then raise exception 'sticker not owned'; end if;
  update public.profiles
  set featured_sticker_keys=keys,
      representative_sticker_key=keys[1],
      updated_at=now()
  where user_id=auth.uid();
  if not found then raise exception 'profile not found'; end if;
end;
$$;
revoke all on function public.set_featured_stickers(text[]) from public;
grant execute on function public.set_featured_stickers(text[]) to authenticated;
