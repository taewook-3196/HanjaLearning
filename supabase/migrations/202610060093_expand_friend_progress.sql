drop function if exists public.friend_progress(uuid);
create function public.friend_progress(friend_user_id uuid)
returns table(learned_count bigint,target_count integer,progress_percent integer,target_grade text,streak_days integer,last_seen_at timestamptz)
language plpgsql stable security definer set search_path='public'
as $$
declare target_code text; selected_provider bigint; total integer; learned bigint; streak integer:=0; seen timestamptz; d date;
begin
 if not public.is_active_non_admin((select auth.uid())) or not public.is_active_non_admin(friend_user_id) then raise exception 'inactive account'; end if;
 if not exists(select 1 from public.friendships f where f.status='ACCEPTED' and ((f.requester_id=(select auth.uid()) and f.addressee_id=friend_user_id) or (f.addressee_id=(select auth.uid()) and f.requester_id=friend_user_id))) then raise exception 'not friends'; end if;
 select p.target_grade,s.exam_provider_id into target_code,selected_provider from public.profiles p left join public.user_settings s on s.user_id=p.user_id where p.user_id=friend_user_id;
 select count(distinct gh.hanja_id)::integer into total from public.exam_grades g join public.grade_hanja gh on gh.grade_id=g.id where g.code=target_code and (selected_provider is null or g.provider_id=selected_provider);
 select count(distinct pr.hanja_id) into learned from public.user_hanja_progress pr where pr.user_id=friend_user_id and pr.study_count>0 and exists(select 1 from public.exam_grades g join public.grade_hanja gh on gh.grade_id=g.id where g.code=target_code and gh.hanja_id=pr.hanja_id and (selected_provider is null or g.provider_id=selected_provider));
 select a.last_seen_at into seen from public.account_status a where a.user_id=friend_user_id;
 d=(now() at time zone 'Asia/Seoul')::date;
 if not exists(select 1 from public.review_history r where r.user_id=friend_user_id and (r.created_at at time zone 'Asia/Seoul')::date=d) then d=d-1; end if;
 while exists(select 1 from public.review_history r where r.user_id=friend_user_id and (r.created_at at time zone 'Asia/Seoul')::date=d) loop streak=streak+1; d=d-1; end loop;
 return query select coalesce(learned,0),coalesce(total,0),case when coalesce(total,0)>0 then least(100,round(coalesce(learned,0)*100.0/total)::int) else 0 end,target_code,streak,seen;
end; $$;
revoke all on function public.friend_progress(uuid) from public;
grant execute on function public.friend_progress(uuid) to authenticated;
