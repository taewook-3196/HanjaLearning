-- Apply before enabling study session writes in the application.
-- The table has RLS enabled but no authenticated-user policies.
DROP POLICY IF EXISTS "study_sessions_select_own" ON public.study_sessions;
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "study_sessions_insert_own" ON public.study_sessions;
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "study_sessions_update_own" ON public.study_sessions;
CREATE POLICY "study_sessions_update_own" ON public.study_sessions
FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
-- Session completion triggers XP settlement. Do not let clients fabricate completion or counts.\n-- Future session writes must go through a validated server-side endpoint or SECURITY DEFINER RPC.\nREVOKE INSERT, UPDATE, DELETE ON public.study_sessions FROM authenticated;
