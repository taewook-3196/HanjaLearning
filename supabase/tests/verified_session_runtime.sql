\set ON_ERROR_STOP on
DO $roles$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF; IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF; END $roles$;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE TABLE public.hanja(id bigint PRIMARY KEY);
CREATE TABLE public.user_hanja_progress(user_id uuid,hanja_id bigint,study_count integer NOT NULL,PRIMARY KEY(user_id,hanja_id));
CREATE TABLE public.study_sessions(id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES auth.users(id),session_type text NOT NULL,started_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,planned_new integer DEFAULT 0,planned_review integer DEFAULT 0,planned_wrong integer DEFAULT 0,actual_new integer DEFAULT 0,actual_review integer DEFAULT 0,correct_count integer DEFAULT 0,wrong_count integer DEFAULT 0,duration_seconds integer DEFAULT 0);
CREATE TABLE public.learning_request_receipts(user_id uuid NOT NULL,request_id uuid NOT NULL,hanja_id bigint NOT NULL,event_kind text NOT NULL,result_kind text,PRIMARY KEY(user_id,request_id));
CREATE FUNCTION public.record_learning_event_once(target_request_id uuid,target_hanja_id bigint,target_event_kind text,target_result_kind text,target_question_kind text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE u uuid:=auth.uid();
BEGIN
 INSERT INTO public.learning_request_receipts(user_id,request_id,hanja_id,event_kind,result_kind) VALUES(u,target_request_id,target_hanja_id,target_event_kind,target_result_kind) ON CONFLICT DO NOTHING;
 INSERT INTO public.user_hanja_progress(user_id,hanja_id,study_count) VALUES(u,target_hanja_id,1) ON CONFLICT(user_id,hanja_id) DO UPDATE SET study_count=public.user_hanja_progress.study_count+1;
END $$;
INSERT INTO auth.users VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
INSERT INTO public.hanja VALUES(1),(2),(3);
INSERT INTO public.user_hanja_progress VALUES('00000000-0000-4000-8000-000000000001',2,1);
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
\i sql/20261014_study_sessions_rls.sql
\i sql/20261014_verified_study_session_rpcs.sql
GRANT USAGE ON SCHEMA public TO authenticated,anon;
GRANT SELECT ON public.study_sessions TO authenticated;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
DO $$ BEGIN
 BEGIN
  INSERT INTO public.study_sessions(id,user_id,session_type) VALUES('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','TODAY');
  RAISE EXCEPTION 'direct session insert unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
-- Reject malformed or dishonest lesson selections without changing progress.
DO $negative$ BEGIN
 BEGIN
  PERFORM public.start_verified_study_session('10000000-0000-4000-8000-000000000002','TODAY',ARRAY[1,1]::bigint[],ARRAY[]::bigint[]);
  RAISE EXCEPTION 'duplicate cards accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='duplicate cards accepted' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.start_verified_study_session('10000000-0000-4000-8000-000000000002','TODAY',ARRAY[999]::bigint[],ARRAY[]::bigint[]);
  RAISE EXCEPTION 'unknown card accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='unknown card accepted' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.start_verified_study_session('10000000-0000-4000-8000-000000000002','TODAY',ARRAY[2]::bigint[],ARRAY[]::bigint[]);
  RAISE EXCEPTION 'studied card accepted as new';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='studied card accepted as new' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.start_verified_study_session('10000000-0000-4000-8000-000000000002','TODAY',ARRAY[]::bigint[],ARRAY[3]::bigint[]);
  RAISE EXCEPTION 'unseen card accepted as review';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='unseen card accepted as review' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.start_verified_study_session('10000000-0000-4000-8000-000000000002','INVALID',ARRAY[3]::bigint[],ARRAY[]::bigint[]);
  RAISE EXCEPTION 'invalid lesson type accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='invalid lesson type accepted' THEN RAISE; END IF; END;
END $negative$;
SELECT public.start_verified_study_session('10000000-0000-4000-8000-000000000001','TODAY',ARRAY[1]::bigint[],ARRAY[2]::bigint[]);
SELECT public.start_verified_study_session('10000000-0000-4000-8000-000000000001','TODAY',ARRAY[1]::bigint[],ARRAY[2]::bigint[]);
DO $$ BEGIN
 BEGIN PERFORM public.complete_verified_study_session('10000000-0000-4000-8000-000000000001'); RAISE EXCEPTION 'incomplete session accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='incomplete session accepted' THEN RAISE; END IF; END;
END $$;
SELECT public.record_verified_session_flashcard('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1,true);
SELECT public.record_verified_session_flashcard('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1,true);
DO $$ BEGIN
 BEGIN PERFORM public.record_verified_session_flashcard('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',1,false); RAISE EXCEPTION 'double answer accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='double answer accepted' THEN RAISE; END IF; END;
END $$;
SELECT public.record_verified_session_flashcard('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002',2,false);
SELECT public.complete_verified_study_session('10000000-0000-4000-8000-000000000001');
SELECT public.complete_verified_study_session('10000000-0000-4000-8000-000000000001');
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.study_sessions WHERE id='10000000-0000-4000-8000-000000000001' AND completed_at IS NOT NULL AND actual_new=1 AND actual_review=1 AND correct_count=1 AND wrong_count=1 AND planned_new=0 AND planned_review=0) THEN RAISE EXCEPTION 'completion counts mismatch'; END IF;
 IF (SELECT count(*) FROM public.learning_request_receipts)<>2 THEN RAISE EXCEPTION 'duplicate receipts'; END IF;
END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false);
DO $$ BEGIN
 BEGIN PERFORM public.complete_verified_study_session('10000000-0000-4000-8000-000000000001'); RAISE EXCEPTION 'cross-user completion accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='cross-user completion accepted' THEN RAISE; END IF; END;
END $$;
DO $isolation$ BEGIN
 IF EXISTS(SELECT 1 FROM public.study_sessions WHERE id='10000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'cross-user session visible'; END IF;
 IF EXISTS(SELECT 1 FROM public.study_session_items WHERE session_id='10000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'cross-user items visible'; END IF;
END $isolation$;
