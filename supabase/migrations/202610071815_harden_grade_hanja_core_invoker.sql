-- Keep the grade-scoped core read RPC within the caller's normal RLS/table privileges.
-- The underlying learning tables are readable by authenticated users, so elevated
-- SECURITY DEFINER privileges are unnecessary.
alter function public.list_grade_hanja_core(bigint) security invoker;
revoke all on function public.list_grade_hanja_core(bigint) from public, anon;
grant execute on function public.list_grade_hanja_core(bigint) to authenticated;
