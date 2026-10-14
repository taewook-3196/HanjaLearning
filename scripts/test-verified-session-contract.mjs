// Static contract tests only: these do not replace execution against a disposable PostgreSQL instance.
// Run: node scripts/test-verified-session-contract.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const rls=readFileSync(new URL('../sql/20261014_study_sessions_rls.sql',import.meta.url),'utf8');
const rpc=readFileSync(new URL('../sql/20261014_verified_study_session_rpcs.sql',import.meta.url),'utf8');
const learn=readFileSync(new URL('../src/app/learn/page.tsx',import.meta.url),'utf8');
const required=(content,pattern,label)=>assert.match(content,pattern,label);

required(rls,/REVOKE INSERT, UPDATE, DELETE ON public\.study_sessions FROM authenticated/i,'Client must not write session completion');
required(rls,/FOR SELECT TO authenticated USING \(user_id = \(select auth\.uid\(\)\)\)/i,'Session read policy must isolate users');
required(rpc,/ALTER TABLE public\.study_session_items ENABLE ROW LEVEL SECURITY/i,'Session items must enable RLS');
required(rpc,/REVOKE ALL ON public\.study_session_items FROM PUBLIC,anon,authenticated/i,'Session items must deny client writes');
required(rpc,/CREATE POLICY study_session_items_select_own[\s\S]*?user_id=\(SELECT auth\.uid\(\)\)/i,'Session items read policy must isolate users');
for(const signature of ['start_verified_study_session\\(uuid,text,bigint\\[\\],bigint\\[\\]\\)','record_verified_session_flashcard\\(uuid,uuid,bigint,boolean\\)','complete_verified_study_session\\(uuid\\)']) {
 required(rpc,new RegExp('REVOKE ALL ON FUNCTION public\\.'+signature+' FROM PUBLIC,anon','i'),'RPC must reject anonymous execution');
 required(rpc,new RegExp('GRANT EXECUTE ON FUNCTION public\\.'+signature+' TO authenticated','i'),'RPC must permit authenticated execution');
}
required(rpc,/n\+r NOT BETWEEN 1 AND 40/i,'Server must limit session size');
required(rpc,/previously studied hanja cannot be new/i,'New cards must reject studied progress');
required(rpc,/unseen hanja cannot be review/i,'Review cards must require studied progress');
required(rpc,/planned_new,planned_review\) VALUES\(p_session_id,uid,p_session_type,0,0\)/i,'Client must not claim daily plan XP');
required(rpc,/card already answered/i,'One answer per card');
required(rpc,/request id reused with different parameters/i,'Idempotency must bind request parameters');
required(rpc,/correct\+wrong<>answered/i,'Completion must reject unknown result kinds');
required(rpc,/session incomplete/i,'Completion must require all answers');
required(learn,/sessionError\.code==="PGRST202"\|\|sessionError\.code==="42883"/,'Fallback only for missing RPC');
required(learn,/record_verified_session_flashcard/,'Frontend must use verified flashcards');
required(learn,/complete_verified_study_session/,'Frontend must complete verified sessions');
console.log('Verified study session static contracts passed (not a PostgreSQL runtime test).');
