create table if not exists public.user_growth_stickers (
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_key text not null check (sticker_key in ('first','stack','write','retry','master','week')),
  earned_at timestamptz not null default now(),
  celebrated_at timestamptz,
  primary key (user_id, sticker_key)
);

alter table public.user_growth_stickers enable row level security;

create policy "users read own growth stickers"
on public.user_growth_stickers for select
to authenticated
using (auth.uid() = user_id);

create policy "users earn own growth stickers"
on public.user_growth_stickers for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users update own growth stickers"
on public.user_growth_stickers for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on table public.user_growth_stickers to authenticated;
