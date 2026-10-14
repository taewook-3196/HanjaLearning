# Verified study session migration: safe rollout and recovery

## Current state (2026-10-14)
- `sql/20261014_study_sessions_rls.sql` and `sql/20261014_verified_study_session_rpcs.sql` are committed but **not applied** to production.
- The frontend falls back to `record_learning_event_once` when the verified RPCs are absent.
- Production `study_sessions` is empty; the new `study_session_items` table and verified RPCs do not exist.
- Production Vercel deployment is intentionally deferred due to quota limits.
- A paid Supabase branch is **not** authorized. Never create one to test this migration.

## Before applying anything
1. Run `sql/20261014_verified_session_preflight.sql` as a read-only query; require **all PASS**.
2. Confirm a restorable database backup/snapshot exists and that its restore process has been tested or is understood. If a restorable backup cannot be confirmed, **stop**. Do not rely on the migration files as a database backup.
3. Verify the two migration files against the live schema and test on a free, isolated local Postgres/Supabase environment if available. Do not run trial writes against production.
4. Schedule a low-traffic change window, document the exact Git commit and a rollback decision owner. Verify no frontend deployment is in progress.
5. Capture read-only baseline counts for `study_sessions`, `learning_request_receipts`, `user_xp_events`, and `user_hanja_progress`. Do not export personal data to GitHub.

## Apply (only after explicit production change approval)
1. Apply `sql/20261014_study_sessions_rls.sql`.
2. Apply `sql/20261014_verified_study_session_rpcs.sql`.
3. Check that `study_session_items` exists with RLS and authenticated users can only SELECT their own items; ensure authenticated clients cannot directly INSERT/UPDATE/DELETE `study_sessions` or `study_session_items`.
4. Check verified RPC signatures and authenticated-only EXECUTE privileges; check that PUBLIC/anon cannot invoke them.
5. With an explicitly approved non-production test user in a safe test environment, verify session start, idempotent flashcard recording, duplicate request rejection, completion, and reward accounting. Do not synthesize XP or lesson records for real users.
6. Deploy the frontend only after backend checks and when Vercel quota permits; smoke-test learning, retries, refresh, and quiz completion on mobile.

## Recovery
- **Before the frontend deploy:** if the backend migration fails, stop; the existing frontend should still use its legacy path if RPCs are absent. If RPCs are partially present, do not assume automatic fallback works.
- **After the frontend deploy:** first roll back the frontend to the last known-good deployment if the verified flow breaks. This is less destructive than deleting server-side data.
- **Do not drop tables, truncate receipts, delete study sessions, or reset XP as a shortcut.** The migration is not safely reversible by simply dropping RPCs after users have started verified sessions.
- If database recovery is required, use the confirmed restorable backup and an approved maintenance procedure; understand that restoring a snapshot can discard writes made after the snapshot. Coordinate user impact and preserve transaction/audit evidence.
- Verify post-recovery sign-in, learning save, quiz completion, user isolation, and XP event integrity.

## Known limitations
- Verified sessions intentionally set `planned_new=0` and `planned_review=0`, so they do not award the 25XP daily-plan-completion reward until a trusted server-side plan validator is implemented.
- First-hanja 5XP is inserted by the `trg_reward_first_hanja_learning` AFTER INSERT trigger on `user_hanja_progress`; repeated updates do not fire this trigger.
- Preflight checks validate prerequisites, **not** successful migration execution or complete runtime compatibility.
