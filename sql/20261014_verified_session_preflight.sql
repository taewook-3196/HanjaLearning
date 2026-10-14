-- Read-only production preflight. Run before the verified study session migrations.
-- Every check must return PASS; do not execute migrations if a check fails.
WITH checks AS (
 SELECT 'study_sessions table' AS check_name, to_regclass('public.study_sessions') IS NOT NULL AS passed
 UNION ALL SELECT 'hanja table', to_regclass('public.hanja') IS NOT NULL
 UNION ALL SELECT 'user_hanja_progress table', to_regclass('public.user_hanja_progress') IS NOT NULL
 UNION ALL SELECT 'learning_request_receipts table', to_regclass('public.learning_request_receipts') IS NOT NULL
 UNION ALL SELECT 'first-learning reward trigger', EXISTS (
  SELECT 1 FROM pg_trigger WHERE tgrelid='public.user_hanja_progress'::regclass AND tgname='trg_reward_first_hanja_learning' AND NOT tgisinternal)
 UNION ALL SELECT 'session completion reward trigger', EXISTS (
  SELECT 1 FROM pg_trigger WHERE tgrelid='public.study_sessions'::regclass AND tgname='trg_settle_study_session_rewards' AND NOT tgisinternal)
 UNION ALL SELECT 'record_learning_event_once RPC', EXISTS (
  SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='record_learning_event_once')
 UNION ALL SELECT 'study_sessions RLS enabled', EXISTS (
  SELECT 1 FROM pg_class WHERE oid='public.study_sessions'::regclass AND relrowsecurity)
 UNION ALL SELECT 'study_sessions empty before migration', NOT EXISTS (SELECT 1 FROM public.study_sessions)
)
SELECT check_name, CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS status FROM checks ORDER BY check_name;
