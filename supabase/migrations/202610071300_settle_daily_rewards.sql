-- Settle daily XP/stickers from trusted learning records, independent of visiting /stats.
create or replace function public.settle_daily_rewards()
returns void
language plpgsql
security definer
set search_path=public
as $fn$
declare
 uid uuid:=auth.uid();
 day_start timestamptz;
 day_end timestamptz;
 today_date date;
 answered_count integer;
 wrong_count integer;
 review_count integer;
 review_wrong integer;
 active_days date[];
 streak integer:=0;
 d date;
 milestone_xp integer:=0;
 plan_new integer:=0; plan_review integer:=0; actual_new integer:=0; actual_review integer:=0;
 plan_complete boolean:=false;
begin
 if uid is null then raise exception 'authentication required'; end if;
 today_date:=(now() at time zone 'Asia/Seoul')::date;
 day_start:=(today_date::timestamp at time zone 'Asia/Seoul');
 day_end:=((today_date+1)::timestamp at time zone 'Asia/Seoul');

 select count(*),count(*) filter(where result in ('WRONG','UNKNOWN'))
 into answered_count,wrong_count
 from public.review_history
 where user_id=uid and created_at>=day_start and created_at<day_end
   and activity_type<>'WRITING' and result in ('CORRECT','KNOWN','WRONG','UNKNOWN');

 select count(*),count(*) filter(where result in ('WRONG','UNKNOWN'))
 into review_count,review_wrong
 from public.review_history
 where user_id=uid and created_at>=day_start and created_at<day_end
   and activity_type='REVIEW' and result in ('CORRECT','KNOWN','WRONG','UNKNOWN');

 select coalesce(sum(planned_new),0),coalesce(sum(planned_review),0),coalesce(sum(actual_new),0),coalesce(sum(actual_review),0)
 into plan_new,plan_review,actual_new,actual_review
 from public.study_sessions
 where user_id=uid and completed_at>=day_start and completed_at<day_end;
 plan_complete:=(plan_new+plan_review)>0 and actual_new>=plan_new and actual_review>=plan_review;

 if answered_count>0 then
   insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)
   values(uid,'daily_activity',today_date,10,'오늘 학습') on conflict do nothing;
 end if;
 if review_count>0 then
   insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)
   values(uid,'daily_review',today_date,10,'오늘 복습') on conflict do nothing;
 end if;
 if answered_count>=5 and wrong_count=0 then
   insert into public.user_repeatable_sticker_events(user_id,sticker_key,earned_on) values(uid,'daily_perfect',today_date) on conflict do nothing;
   insert into public.user_xp_events(user_id,event_key,event_date,xp,reason) values(uid,'daily_perfect',today_date,10,'오늘 학습 만점') on conflict do nothing;
 end if;
 if review_count>=3 and review_wrong=0 then
   insert into public.user_repeatable_sticker_events(user_id,sticker_key,earned_on) values(uid,'daily_review',today_date) on conflict do nothing;
 end if;
 if plan_complete then
   insert into public.user_repeatable_sticker_events(user_id,sticker_key,earned_on) values(uid,'daily_plan',today_date) on conflict do nothing;
   insert into public.user_xp_events(user_id,event_key,event_date,xp,reason) values(uid,'daily_plan_complete',today_date,25,'오늘 계획 완료') on conflict do nothing;
 end if;

 select array_agg(x.activity_date order by x.activity_date desc) into active_days from (
   select distinct (created_at at time zone 'Asia/Seoul')::date as activity_date
   from public.review_history where user_id=uid and created_at>=day_start-interval '120 days'
 ) x;
 d:=today_date;
 if not (d=any(coalesce(active_days,array[]::date[]))) then d:=d-1; end if;
 while streak<120 and d=any(coalesce(active_days,array[]::date[])) loop streak:=streak+1; d:=d-1; end loop;

 if streak>=2 then
   insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)
   values(uid,'streak_bonus',today_date,least(30,5+floor((streak-2)/3.0)::int*5),streak||'일 연속 학습')
   on conflict(user_id,event_key,event_date) do update set xp=excluded.xp,reason=excluded.reason;
 end if;
 milestone_xp:=case streak when 7 then 35 when 14 then 60 when 30 then 100 when 60 then 140 when 100 then 200 else 0 end;
 if milestone_xp>0 then
   insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)
   values(uid,'streak_milestone_'||streak,today_date,milestone_xp,streak||'일 연속 학습 달성') on conflict do nothing;
 end if;
end;$fn$;
revoke all on function public.settle_daily_rewards() from public,anon;
grant execute on function public.settle_daily_rewards() to authenticated;

-- Reward settlement follows successful recognition study writes in the same transaction.
create or replace function public.reward_after_review_history()
returns trigger language plpgsql security definer set search_path=public as $fn$
begin
 if new.user_id=auth.uid() then perform public.settle_daily_rewards(); end if;
 return new;
end;$fn$;
drop trigger if exists trg_settle_daily_rewards on public.review_history;
create trigger trg_settle_daily_rewards after insert on public.review_history
for each row when (new.activity_type <> 'WRITING') execute function public.reward_after_review_history();
