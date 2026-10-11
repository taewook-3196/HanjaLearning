-- Prevent first-learning XP from being granted again after a progress row is recreated.
-- Keep historical XP events and their dates intact.
create unique index if not exists user_xp_events_first_hanja_once_idx
on public.user_xp_events (user_id, event_key)
where event_key like 'first_hanja_%';

create or replace function public.reward_first_hanja_learning()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
begin
  insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)
  values(new.user_id,'first_hanja_' || new.hanja_id::text,
         (new.first_learned_at at time zone 'Asia/Seoul')::date,
         5,'새 한자 첫 학습')
  on conflict do nothing;
  return new;
end;
$$;
