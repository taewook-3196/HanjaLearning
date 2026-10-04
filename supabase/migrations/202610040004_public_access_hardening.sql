-- Final public-service access hardening before first deployment.
create or replace function public.is_active_non_admin(target_user_id uuid)
returns boolean language sql stable security definer set search_path=public as $fn$
 select exists(select 1 from public.account_status a where a.user_id=target_user_id and a.status='ACTIVE')
   and not exists(select 1 from public.admin_users ad where ad.user_id=target_user_id);
$fn$;
revoke all on function public.is_active_non_admin(uuid) from public,anon;
grant execute on function public.is_active_non_admin(uuid) to authenticated;

drop policy if exists "friendships_request_insert" on public.friendships;
create policy "friendships_request_insert" on public.friendships for insert to authenticated
 with check ((select auth.uid())=requester_id and status='PENDING'
   and public.is_active_non_admin(requester_id) and public.is_active_non_admin(addressee_id));

create or replace function public.friend_progress(friend_user_id uuid)
returns table(learned_count bigint,target_count integer,progress_percent integer,target_grade text)
language plpgsql stable security definer set search_path=public as $fn$
declare target_code text; selected_provider bigint; total integer; learned bigint;
begin
 if not public.is_active_non_admin((select auth.uid())) or not public.is_active_non_admin(friend_user_id) then raise exception 'inactive account'; end if;
 if not exists(select 1 from public.friendships f where f.status='ACCEPTED' and ((f.requester_id=(select auth.uid()) and f.addressee_id=friend_user_id) or (f.addressee_id=(select auth.uid()) and f.requester_id=friend_user_id))) then raise exception 'not friends'; end if;
 select p.target_grade,s.exam_provider_id into target_code,selected_provider from public.profiles p left join public.user_settings s on s.user_id=p.user_id where p.user_id=friend_user_id;
 select count(distinct gh.hanja_id)::integer into total from public.exam_grades g join public.grade_hanja gh on gh.grade_id=g.id where g.code=target_code and (selected_provider is null or g.provider_id=selected_provider);
 select count(distinct pr.hanja_id) into learned from public.user_hanja_progress pr where pr.user_id=friend_user_id and pr.study_count>0 and exists(select 1 from public.exam_grades g join public.grade_hanja gh on gh.grade_id=g.id where g.code=target_code and gh.hanja_id=pr.hanja_id and (selected_provider is null or g.provider_id=selected_provider));
 return query select coalesce(learned,0),coalesce(total,0),case when coalesce(total,0)>0 then least(100,round(coalesce(learned,0)*100.0/total)::int) else 0 end,target_code;
end;
$fn$;
revoke all on function public.friend_progress(uuid) from public,anon;
grant execute on function public.friend_progress(uuid) to authenticated;
revoke all on function public.list_active_learners() from public,anon;
grant execute on function public.list_active_learners() to authenticated;
revoke all on function public.is_app_admin() from public,anon;
grant execute on function public.is_app_admin() to authenticated;
revoke all on function public.get_signup_approval_mode() from public,anon;
grant execute on function public.get_signup_approval_mode() to authenticated;
revoke all on function public.set_signup_approval_mode(text) from public,anon;
grant execute on function public.set_signup_approval_mode(text) to authenticated;
