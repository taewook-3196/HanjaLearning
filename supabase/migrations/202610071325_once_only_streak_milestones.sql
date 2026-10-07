-- Each long-term streak milestone is awarded only once per account.
create unique index if not exists user_xp_events_once_per_streak_milestone
on public.user_xp_events(user_id,event_key)
where event_key like 'streak_milestone_%';

-- This function is a trigger helper, not a client-callable RPC.
revoke all on function public.reward_after_review_history() from public, anon, authenticated;
