-- Apply before enabling study session writes in the application.
-- The table has RLS enabled but no authenticated-user policies.
DROP POLICY IF EXISTS "study_sessions_select_own" ON public.study_sessions;
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "study_sessions_insert_own" ON public.study_sessions;
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "study_sessions_update_own" ON public.study_sessions;
CREATE POLICY "study_sessions_update_own" ON public.study_sessions
FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
REVOKE DELETE ON public.study_sessions FROM authenticated;
