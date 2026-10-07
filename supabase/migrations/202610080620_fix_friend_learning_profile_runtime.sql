-- Fix friend_learning_profile runtime failure after is_active_non_admin helper removal.
create or replace function public.friend_learning_profile(friend_user_id uuid)
returns table(learned_count bigint,target_count integer,progress_percent integer,target_grade text,streak_days integer,last_seen_at timestamptz,total_xp bigint,growth_sticker_keys text[],repeatable_stickers jsonb)
language plpgsql stable security definer set search_path=public
as $$
declare
 caller uuid := auth.uid(); target_code text; selected_provider bigint; total integer; learned bigint; streak integer:=0; seen timestamptz; d date; xp_total bigint; growth_keys text[]; repeatable jsonb;
begin
 if caller is null then raise exception 'authentication required'; end if;
 if not exists(select 1 from public.account_status a where a.user_id=caller and a.status='ACTIVE')
    or not exists(select 1 from public.account_status a where a.user_id=friend_user_id and a.status='ACTIVE') then raise exception 'inactive account'; end if;
 if not exists(select 1 from public.friendships f where f.status='ACCEPTED' and ((f.requester_id=caller and f.addressee_id=friend_user_id) or (f.addressee_id=caller and f.requester_id=friend_user_id))) then raise exception 'not friends'; end if;
 select p.target_grade,s.exam_provider_id into target_code,selected_provider from public.profiles p left join public.user_settings s on s.user_id=p.user_id where p.user_id=friend_user_id;
 select count(distinct gh.hanja_id)::integer into total from public.exam_grades g join public.grade_hanja gh on gh.grade_id=g.id where g.code=target_code and (selected_provider is null or g.provider_id=selected_provider);
 select count(distinct pr.hanja_id) into learned from public.user_hanja_progress pr where pr.user_id=friend_user_id and pr.study_count>0 and exists(select 1 from public.exam_grades g join public.grade_hanja gh on gh.grade_id=g.id where g.code=target_code and gh.hanja_id=pr.hanja_id and (selected_provider is null or g.provider_id=selected_provider));
 select a.last_seen_at into seen from public.account_status a where a.user_id=friend_user_id;
 d=(now() at time zone 'Asia/Seoul')::date;
 if not exists(select 1 from public.review_history r where r.user_id=friend_user_id and (r.created_at at time zone 'Asia/Seoul')::date=d) then d=d-1; end if;
 while exists(select 1 from public.review_history r where r.user_id=friend_user_id and (r.created_at at time zone 'Asia/Seoul')::date=d) loop streak=streak+1; d=d-1; end loop;
 select coalesce(sum(x.xp),0)::bigint into xp_total from public.user_xp_events x where x.user_id=friend_user_id;
 select coalesce(array_agg(g.sticker_key order by g.earned_at),array[]::text[]) into growth_keys from public.user_growth_stickers g where g.user_id=friend_user_id;
 select coalesce(jsonb_object_agg(x.sticker_key,x.cnt),'{}'::jsonb) into repeatable from (select r.sticker_key,count(*)::int cnt from public.user_repeatable_sticker_events r where r.user_id=friend_user_id group by r.sticker_key) x;
 return query select coalesce(learned,0),coalesce(total,0),case when coalesce(total,0)>0 then least(100,round(coalesce(learned,0)*100.0/total)::int) else 0 end,target_code,streak,seen,coalesce(xp_total,0),coalesce(growth_keys,array[]::text[]),coalesce(repeatable,'{}'::jsonb);
end; $$;
revoke all on function public.friend_learning_profile(uuid) from public, anon;
grant execute on function public.friend_learning_profile(uuid) to authenticated;
