-- Make reward settlement independent of auth.uid() inside database triggers.
create or replace function public.settle_user_daily_rewards(p_uid uuid,p_day date)
returns void language plpgsql security definer set search_path=public as $$
declare
 day_start timestamptz:=(p_day::timestamp at time zone 'Asia/Seoul');
 day_end timestamptz:=((p_day+1)::timestamp at time zone 'Asia/Seoul');
 answered_count int; wrong_count int; review_count int; review_wrong int;
 active_days date[]; streak int:=0; d date; milestone_xp int:=0;
 pn int:=0;pr int:=0;an int:=0;ar int:=0;plan_complete boolean:=false;
begin
 if p_uid is null or p_day is null then return; end if;
 select count(*),count(*)filter(where result in('WRONG','UNKNOWN')) into answered_count,wrong_count from public.review_history where user_id=p_uid and created_at>=day_start and created_at<day_end and activity_type<>'WRITING' and result in('CORRECT','KNOWN','WRONG','UNKNOWN');
 select count(*),count(*)filter(where result in('WRONG','UNKNOWN')) into review_count,review_wrong from public.review_history where user_id=p_uid and created_at>=day_start and created_at<day_end and activity_type='REVIEW' and result in('CORRECT','KNOWN','WRONG','UNKNOWN');
 select coalesce(sum(planned_new),0),coalesce(sum(planned_review),0),coalesce(sum(actual_new),0),coalesce(sum(actual_review),0) into pn,pr,an,ar from public.study_sessions where user_id=p_uid and completed_at>=day_start and completed_at<day_end;
 plan_complete:=(pn+pr)>0 and an>=pn and ar>=pr;
 if answered_count>0 then insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)values(p_uid,'daily_activity',p_day,10,'오늘 학습')on conflict do nothing;end if;
 if review_count>0 then insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)values(p_uid,'daily_review',p_day,10,'오늘 복습')on conflict do nothing;end if;
 if answered_count>=5 and wrong_count=0 then insert into public.user_repeatable_sticker_events(user_id,sticker_key,earned_on)values(p_uid,'daily_perfect',p_day)on conflict do nothing;insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)values(p_uid,'daily_perfect',p_day,10,'오늘 학습 만점')on conflict do nothing;end if;
 if review_count>=3 and review_wrong=0 then insert into public.user_repeatable_sticker_events(user_id,sticker_key,earned_on)values(p_uid,'daily_review',p_day)on conflict do nothing;end if;
 if plan_complete then insert into public.user_repeatable_sticker_events(user_id,sticker_key,earned_on)values(p_uid,'daily_plan',p_day)on conflict do nothing;insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)values(p_uid,'daily_plan_complete',p_day,25,'오늘 계획 완료')on conflict do nothing;end if;
 select array_agg(activity_date order by activity_date desc)into active_days from(select distinct(created_at at time zone 'Asia/Seoul')::date activity_date from public.review_history where user_id=p_uid and created_at>=day_start-interval '120 days' and created_at<day_end)x;
 d:=p_day;if not(d=any(coalesce(active_days,array[]::date[])))then d:=d-1;end if;
 while streak<120 and d=any(coalesce(active_days,array[]::date[]))loop streak:=streak+1;d:=d-1;end loop;
 if streak>=2 then insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)values(p_uid,'streak_bonus',p_day,least(30,5+floor((streak-2)/3.0)::int*5),streak||'일 연속 학습')on conflict(user_id,event_key,event_date)do update set xp=excluded.xp,reason=excluded.reason;end if;
 milestone_xp:=case streak when 7 then 35 when 14 then 60 when 30 then 100 when 60 then 140 when 100 then 200 else 0 end;
 if milestone_xp>0 then insert into public.user_xp_events(user_id,event_key,event_date,xp,reason)values(p_uid,'streak_milestone_'||streak,p_day,milestone_xp,streak||'일 연속 학습 달성')on conflict do nothing;end if;
end $$;
revoke all on function public.settle_user_daily_rewards(uuid,date) from public,anon,authenticated;

create or replace function public.settle_daily_rewards()returns void language plpgsql security definer set search_path=public as $$declare uid uuid:=auth.uid();begin if uid is null then raise exception 'authentication required';end if;perform public.settle_user_daily_rewards(uid,(now()at time zone 'Asia/Seoul')::date);end $$;
create or replace function public.reward_after_review_history()returns trigger language plpgsql security definer set search_path=public as $$begin perform public.settle_user_daily_rewards(new.user_id,(new.created_at at time zone 'Asia/Seoul')::date);return new;end $$;
revoke all on function public.reward_after_review_history() from public,anon,authenticated;
create or replace function public.reward_after_study_session()returns trigger language plpgsql security definer set search_path=public as $$begin if new.completed_at is not null then perform public.settle_user_daily_rewards(new.user_id,(new.completed_at at time zone 'Asia/Seoul')::date);end if;return new;end $$;
revoke all on function public.reward_after_study_session() from public,anon,authenticated;
drop trigger if exists trg_settle_study_session_rewards on public.study_sessions;
create trigger trg_settle_study_session_rewards after insert or update of completed_at,actual_new,actual_review on public.study_sessions for each row when(new.completed_at is not null)execute function public.reward_after_study_session();

-- Repair rewards for today's already-recorded learning.
do $$declare r record;begin for r in select distinct user_id,(created_at at time zone 'Asia/Seoul')::date reward_day from public.review_history where(created_at at time zone 'Asia/Seoul')::date=(now()at time zone 'Asia/Seoul')::date loop perform public.settle_user_daily_rewards(r.user_id,r.reward_day);end loop;end $$;