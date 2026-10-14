-- Run after sql/20261014_study_sessions_rls.sql.
-- Never accept client-reported actual counts; use authenticated, idempotent event receipts.
CREATE TABLE IF NOT EXISTS public.study_session_items (
 session_id uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id),
 hanja_id bigint NOT NULL REFERENCES public.hanja(id),
 item_kind text NOT NULL CHECK(item_kind IN ('NEW','REVIEW')),
 request_id uuid UNIQUE,
 PRIMARY KEY(session_id,hanja_id)
);
ALTER TABLE public.study_session_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_session_items FROM anon,authenticated;
DROP POLICY IF EXISTS study_session_items_select_own ON public.study_session_items;
CREATE POLICY study_session_items_select_own ON public.study_session_items FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
GRANT SELECT ON public.study_session_items TO authenticated;

CREATE OR REPLACE FUNCTION public.start_verified_study_session(p_session_id uuid,p_session_type text,p_new_ids bigint[],p_review_ids bigint[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $fn$
DECLARE uid uuid:=auth.uid(); n integer; r integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
 IF p_session_id IS NULL OR p_session_type NOT IN ('TODAY','REPEAT','EXTRA','WRONG') OR p_new_ids IS NULL OR p_review_ids IS NULL THEN RAISE EXCEPTION 'invalid session'; END IF;
 n:=cardinality(p_new_ids);r:=cardinality(p_review_ids);
 IF n+r NOT BETWEEN 1 AND 40 OR n<0 OR r<0 THEN RAISE EXCEPTION 'invalid session size'; END IF;
 IF (SELECT count(DISTINCT id) FROM unnest(p_new_ids||p_review_ids) id WHERE id IS NOT NULL)<>n+r THEN RAISE EXCEPTION 'duplicate or null hanja'; END IF;
 IF (SELECT count(*) FROM public.hanja WHERE id=ANY(p_new_ids||p_review_ids))<>n+r THEN RAISE EXCEPTION 'unknown hanja'; END IF;
 -- The caller cannot label previously studied cards as new to inflate daily plan rewards.
 IF EXISTS(SELECT 1 FROM public.user_hanja_progress WHERE user_id=uid AND hanja_id=ANY(p_new_ids) AND study_count>0) THEN RAISE EXCEPTION 'previously studied hanja cannot be new'; END IF;
 -- Check progress at session creation, not at completion: first-time flashcards create progress rows.
 IF EXISTS(SELECT 1 FROM unnest(p_review_ids) AS x(id) WHERE NOT EXISTS(SELECT 1 FROM public.user_hanja_progress p WHERE p.user_id=uid AND p.hanja_id=x.id AND p.study_count>0)) THEN RAISE EXCEPTION 'unseen hanja cannot be review'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(uid::text));
 IF EXISTS(SELECT 1 FROM public.study_sessions WHERE id=p_session_id) THEN
  IF NOT EXISTS(SELECT 1 FROM public.study_sessions WHERE id=p_session_id AND user_id=uid AND session_type=p_session_type AND planned_new=0 AND planned_review=0) OR
    (SELECT count(*) FROM public.study_session_items WHERE session_id=p_session_id AND user_id=uid AND ((item_kind='NEW' AND hanja_id=ANY(p_new_ids)) OR (item_kind='REVIEW' AND hanja_id=ANY(p_review_ids))))<>n+r
  THEN RAISE EXCEPTION 'session id reused'; END IF;
  RETURN;
 END IF;
 -- A user may not create overlapping active sessions.
 -- A restarted lesson may abandon an unfinished session. Expire it without awarding XP.
 DELETE FROM public.study_session_items WHERE session_id IN (SELECT id FROM public.study_sessions WHERE user_id=uid AND completed_at IS NULL);
 DELETE FROM public.study_sessions WHERE user_id=uid AND completed_at IS NULL;
 -- Client-provided card selection is not proof of the server-assigned daily plan.
 -- Keep planned counts zero until a server-side daily-plan validator is implemented.
 INSERT INTO public.study_sessions(id,user_id,session_type,planned_new,planned_review) VALUES(p_session_id,uid,p_session_type,0,0);
 INSERT INTO public.study_session_items(session_id,user_id,hanja_id,item_kind) SELECT p_session_id,uid,id,'NEW' FROM unnest(p_new_ids) id;
 INSERT INTO public.study_session_items(session_id,user_id,hanja_id,item_kind) SELECT p_session_id,uid,id,'REVIEW' FROM unnest(p_review_ids) id;
END $fn$;

CREATE OR REPLACE FUNCTION public.record_verified_session_flashcard(p_session_id uuid,p_request_id uuid,p_hanja_id bigint,p_known boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $fn$
DECLARE uid uuid:=auth.uid(); item public.study_session_items%rowtype;
BEGIN
 IF uid IS NULL OR p_request_id IS NULL OR p_known IS NULL THEN RAISE EXCEPTION 'invalid request'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(uid::text));
 IF NOT EXISTS(SELECT 1 FROM public.study_sessions WHERE id=p_session_id AND user_id=uid AND completed_at IS NULL AND started_at>now()-interval '12 hours') THEN RAISE EXCEPTION 'session unavailable'; END IF;
 SELECT * INTO item FROM public.study_session_items WHERE session_id=p_session_id AND user_id=uid AND hanja_id=p_hanja_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'hanja not in session'; END IF;
 IF item.request_id IS NOT NULL AND item.request_id<>p_request_id THEN RAISE EXCEPTION 'card already answered'; END IF;
 IF item.request_id IS NULL AND EXISTS(SELECT 1 FROM public.learning_request_receipts WHERE user_id=uid AND request_id=p_request_id) THEN RAISE EXCEPTION 'request already used outside this session'; END IF;
 IF EXISTS(SELECT 1 FROM public.learning_request_receipts WHERE user_id=uid AND request_id=p_request_id AND (event_kind<>'FLASHCARD' OR hanja_id<>p_hanja_id OR result_kind IS DISTINCT FROM CASE WHEN p_known THEN 'KNOWN' ELSE 'UNKNOWN' END)) THEN RAISE EXCEPTION 'request id reused with different parameters'; END IF;
 PERFORM public.record_learning_event_once(p_request_id,p_hanja_id,'FLASHCARD',CASE WHEN p_known THEN 'KNOWN' ELSE 'UNKNOWN' END,'SELF_REPORT');
 UPDATE public.study_session_items SET request_id=p_request_id WHERE session_id=p_session_id AND hanja_id=p_hanja_id AND request_id IS NULL;
END $fn$;

CREATE OR REPLACE FUNCTION public.complete_verified_study_session(p_session_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $fn$
DECLARE uid uuid:=auth.uid(); session_row public.study_sessions%rowtype; answered integer; correct integer; wrong integer;
BEGIN
 IF uid IS NULL OR p_session_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(uid::text));
 SELECT * INTO session_row FROM public.study_sessions WHERE id=p_session_id AND user_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;
 IF session_row.completed_at IS NOT NULL THEN RETURN; END IF;
 IF session_row.started_at<now()-interval '12 hours' THEN RAISE EXCEPTION 'session expired'; END IF;
 SELECT count(r.request_id),count(r.request_id) FILTER(WHERE r.result_kind='KNOWN'),count(r.request_id) FILTER(WHERE r.result_kind='UNKNOWN') INTO answered,correct,wrong
 FROM public.study_session_items i LEFT JOIN public.learning_request_receipts r ON r.user_id=i.user_id AND r.request_id=i.request_id AND r.event_kind='FLASHCARD' AND r.hanja_id=i.hanja_id
 WHERE i.session_id=p_session_id AND i.user_id=uid;
 IF answered<>(SELECT count(*) FROM public.study_session_items WHERE session_id=p_session_id AND user_id=uid) OR answered=0 THEN RAISE EXCEPTION 'session incomplete'; END IF;
 UPDATE public.study_sessions SET completed_at=now(),actual_new=(SELECT count(*) FROM public.study_session_items WHERE session_id=p_session_id AND user_id=uid AND item_kind='NEW'),actual_review=(SELECT count(*) FROM public.study_session_items WHERE session_id=p_session_id AND user_id=uid AND item_kind='REVIEW'),correct_count=correct,wrong_count=wrong,duration_seconds=least(43200,greatest(0,extract(epoch FROM now()-session_row.started_at)::integer)) WHERE id=p_session_id;
END $fn$;

REVOKE ALL ON FUNCTION public.start_verified_study_session(uuid,text,bigint[],bigint[]) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.record_verified_session_flashcard(uuid,uuid,bigint,boolean) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.complete_verified_study_session(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.start_verified_study_session(uuid,text,bigint[],bigint[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_verified_session_flashcard(uuid,uuid,bigint,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_verified_study_session(uuid) TO authenticated;
