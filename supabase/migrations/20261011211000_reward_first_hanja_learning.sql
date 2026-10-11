-- Grant XP once for each newly learned hanja, including extra sessions.
-- Existing review_history daily rewards remain unchanged.
create or replace function public.reward_first_hanja_learning()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
begin
  insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)
  values(new.user_id,'first_hanja_' || new.hanja_id::text,
         (new.first_learned_at at time zone 'Asia/Seoul')::date,
         5,'새 한자 첫 학습')
  on conflict (user_id,event_key,event_date) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_reward_first_hanja_learning on public.user_hanja_progress;
create trigger trg_reward_first_hanja_learning
after insert on public.user_hanja_progress
for each row execute function public.reward_first_hanja_learning();
