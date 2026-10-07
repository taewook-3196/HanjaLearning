revoke all on function public.list_active_learners() from public,anon;
grant execute on function public.list_active_learners() to authenticated;