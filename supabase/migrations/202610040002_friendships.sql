-- Friend requests and friend-only progress comparison.
create table if not exists public.friendships (
  id bigint generated always as identity primary key,
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','REJECTED','BLOCKED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
create unique index if not exists friendships_pair_unique on public.friendships
  (least(requester_id,addressee_id), greatest(requester_id,addressee_id));

alter table public.friendships enable row level security;
revoke all on table public.friendships from anon;
grant select,insert,update,delete on table public.friendships to authenticated;
grant usage,select on sequence public.friendships_id_seq to authenticated;

create policy "friendships_participant_select" on public.friendships for select to authenticated
 using ((select auth.uid()) in (requester_id,addressee_id));
create policy "friendships_request_insert" on public.friendships for insert to authenticated
 with check ((select auth.uid())=requester_id and status='PENDING');
create policy "friendships_addressee_update" on public.friendships for update to authenticated
 using ((select auth.uid())=addressee_id)
 with check ((select auth.uid())=addressee_id);
create policy "friendships_participant_delete" on public.friendships for delete to authenticated
 using ((select auth.uid()) in (requester_id,addressee_id));

-- Safe public directory: active learners only, no application messages or private auth data.
create or replace function public.list_active_learners()
returns table(user_id uuid,login_id text,nickname text,target_grade text)
language sql stable security definer set search_path=public
as $$
 select a.user_id,a.login_id,coalesce(p.nickname,a.nickname,a.login_id),p.target_grade
 from public.account_status a
 left join public.profiles p on p.user_id=a.user_id
 where a.status='ACTIVE'
   and not exists(select 1 from public.admin_users ad where ad.user_id=a.user_id)
 order by coalesce(p.nickname,a.nickname,a.login_id);
$$;
grant execute on function public.list_active_learners() to authenticated;

create or replace function public.friend_progress(friend_user_id uuid)
returns table(learned_count bigint,target_count integer,progress_percent integer,target_grade text)
language plpgsql stable security definer set search_path=public
as $$
begin
 if not exists(
   select 1 from public.friendships f
   where f.status='ACCEPTED'
   and ((f.requester_id=(select auth.uid()) and f.addressee_id=friend_user_id)
     or (f.addressee_id=(select auth.uid()) and f.requester_id=friend_user_id))
 ) then raise exception 'not friends'; end if;
 return query
 select count(pr.hanja_id),coalesce(max(g.cumulative_hanja_count),0),
   case when coalesce(max(g.cumulative_hanja_count),0)>0 then least(100,round(count(pr.hanja_id)*100.0/max(g.cumulative_hanja_count))::int) else 0 end,
   p.target_grade
 from public.profiles p
 left join public.exam_grades g on g.code=p.target_grade
 left join public.user_hanja_progress pr on pr.user_id=p.user_id and pr.study_count>0
 where p.user_id=friend_user_id
 group by p.target_grade;
end; $$;
grant execute on function public.friend_progress(uuid) to authenticated;
