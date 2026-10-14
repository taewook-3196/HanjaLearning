-- Study session writes are allowed only through these authenticated, validated RPCs.
-- Apply after sql/20261014_study_sessions_rls.sql. No direct client table writes.
CREATE OR REPLACE FUNCTION public.start_verified_study_session(p_session_id uuid,p_session_type text,p_planned_new integer,p_planned_review integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $fn$
DECLARE v_uid uuid:=auth.uid();
BEGIN
 IF v_uid IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
 IF p_session_id IS NULL OR p_session_type NOT IN ('TODAY','REPEAT','EXTRA','WRONG') OR p_planned_new IS NULL OR p_planned_review IS NULL OR p_planned_new<0 OR p_planned_review<0 OR p_planned_new+p_planned_review NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'invalid session plan'; END IF;
 INSERT INTO public.study_sessions(id,user_id,session_type,planned_new,planned_review)
 VALUES(p_session_id,v_uid,p_session_type,p_planned_new,p_planned_review)
 ON CONFLICT(id) DO NOTHING;
 IF NOT EXISTS(SELECT 1 FROM public.study_sessions WHERE id=p_session_id AND user_id=v_uid AND session_type=p_session_type AND planned_new=p_planned_new AND planned_review=p_planned_review) THEN RAISE EXCEPTION 'session id reused with different parameters'; END IF;
END $fn$;

CREATE OR REPLACE FUNCTION public.complete_verified_study_session(p_session_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $fn$
DECLARE v_uid uuid:=auth.uid();v_session public.study_sessions%rowtype;v_flashcards integer;v_correct integer;v_wrong integer;v_new integer;v_review integer;
BEGIN
 IF v_uid IS NULL OR p_session_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(v_uid::text));
 SELECT * INTO v_session FROM public.study_sessions WHERE id=p_session_id AND user_id=v_uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;
 IF v_session.completed_at IS NOT NULL THEN RETURN; END IF;
 IF v_session.started_at < now()-interval '12 hours' THEN RAISE EXCEPTION 'session expired'; END IF;
 -- Receipt rows are server-created by record_learning_event_once, never client-writable.
 SELECT count(*),count(*) FILTER(WHERE result_kind='KNOWN'),count(*) FILTER(WHERE result_kind='UNKNOWN')
 INTO v_flashcards,v_correct,v_wrong
 FROM public.learning_request_receipts
 WHERE user_id=v_uid AND event_kind='FLASHCARD' AND created_at>=v_session.started_at AND created_at<=now();
 IF v_flashcards < v_session.planned_new+v_session.planned_review THEN RAISE EXCEPTION 'session is not complete'; END IF;
 -- Avoid trusting client-provided counts. Only server-recorded flashcard receipts count.
 v_new:=least(v_session.planned_new,v_flashcards);
 v_review:=least(v_session.planned_review,greatest(0,v_flashcards-v_new));
 UPDATE public.study_sessions SET completed_at=now(),actual_new=v_new,actual_review=v_review,correct_count=v_correct,wrong_count=v_wrong,duration_seconds=greatest(0,least(43200,extract(epoch from now()-v_session.started_at)::integer)) WHERE id=p_session_id;
END $fn$;

REVOKE ALL ON FUNCTION public.start_verified_study_session(uuid,text,integer,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.complete_verified_study_session(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.start_verified_study_session(uuid,text,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_verified_study_session(uuid) TO authenticated;
