drop function if exists public.list_active_learners();
create or replace function public.list_active_learners()
returns table(user_id uuid,nickname text,target_provider text,target_grade text,provider_name text,grade_name text,avatar_type text,avatar_key text,avatar_path text)
language sql stable security definer set search_path=public as $$
 select a.user_id,coalesce(nullif(btrim(p.nickname),''),a.nickname),p.target_provider,p.target_grade,
 ep.name,eg.name,p.avatar_type,p.avatar_key,p.avatar_path
 from public.account_status a
 left join public.profiles p on p.user_id=a.user_id
 left join public.exam_providers ep on ep.code=p.target_provider
 left join public.exam_grades eg on eg.code=p.target_grade and eg.provider_id=ep.id
 where exists(select 1 from public.account_status me where me.user_id=(select auth.uid()) and me.status='ACTIVE')
 and a.status='ACTIVE'
 and not exists(select 1 from public.admin_users ad where ad.user_id=a.user_id)
 order by coalesce(p.nickname,a.nickname,a.login_id);
$$;