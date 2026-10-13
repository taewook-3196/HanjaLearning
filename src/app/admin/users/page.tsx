"use client";
import { useEffect,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Account={user_id:string;login_id:string;nickname:string|null;application_message:string;status:string;created_at:string;last_seen_at:string|null;is_admin:boolean};
const DAY_MS=86400000;
function daysSince(value:string|null,now:number){if(!value)return null;return Math.max(0,Math.floor((now-new Date(value).getTime())/DAY_MS));}
export default function AdminUsersPage(){
 const router=useRouter();const [now]=useState(()=>Date.now());const [rows,setRows]=useState<Account[]>([]);const [loading,setLoading]=useState(true);const [message,setMessage]=useState("");const [resetCode,setResetCode]=useState("");const [resetIssuedAt,setResetIssuedAt]=useState<Record<string,number>>({});const resetPending=useRef<Set<string>>(new Set());const [resetBusy,setResetBusy]=useState<Record<string,boolean>>({});const [approvalMode,setApprovalMode]=useState<"AUTO"|"MANUAL">("AUTO");const [adminId,setAdminId]=useState("");
 async function load(){
  setResetCode("");const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){router.replace("/login");return;}setAdminId(user.id);
  const {data:isAdmin}=await s.rpc("is_app_admin");if(!isAdmin){router.replace("/");return;}
  const {data:mode}=await s.rpc("get_signup_approval_mode");setApprovalMode(mode==="MANUAL"?"MANUAL":"AUTO");
  const {data,error}=await s.rpc("admin_list_accounts");
  if(error)setMessage("회원 목록을 불러오지 못했어요.");else setRows(data??[]);setLoading(false);
 }
 useEffect(()=>{queueMicrotask(()=>{void load();});},[]);
 async function change(userId:string,status:"ACTIVE"|"REJECTED"|"SUSPENDED"){
  setResetCode("");if(userId===adminId){setMessage("현재 로그인한 운영자 계정의 상태는 변경할 수 없어요.");return;}
  const s=createClient();const {error}=await s.from("account_status").update({status,updated_at:new Date().toISOString()}).eq("user_id",userId);
  if(error){setMessage("상태를 변경하지 못했어요.");return;}await load();
 }
 async function remove(account:Account){
  setResetCode("");if(account.user_id===adminId)return;
  if(!window.confirm(`${account.nickname||account.login_id} 회원의 계정을 완전히 삭제할까요?\n학습 기록과 친구 관계도 함께 삭제되며 되돌릴 수 없습니다.`))return;
  const s=createClient();const {error}=await s.rpc("admin_delete_user",{target_user_id:account.user_id});
  if(error){setMessage("계정을 삭제하지 못했어요. 운영자 계정은 삭제할 수 없습니다.");return;}
  setMessage("회원 계정을 삭제했습니다.");await load();
 }
 async function createReset(account:Account){
  if(resetPending.current.has(account.user_id))return;
  setResetCode("");const lastIssued=resetIssuedAt[account.user_id];if(lastIssued&&Date.now()-lastIssued<60000){setMessage(`복구 코드는 ${Math.ceil((60000-(Date.now()-lastIssued))/1000)}초 후 다시 발급할 수 있어요.`);return;}const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const bytes=crypto.getRandomValues(new Uint8Array(10));const code=Array.from(bytes,b=>alphabet[b%alphabet.length]).join("");const digestBytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(code));const digest=Array.from(new Uint8Array(digestBytes),b=>b.toString(16).padStart(2,"0")).join("");resetPending.current.add(account.user_id);setResetBusy(prev=>({...prev,[account.user_id]:true}));try{const s=createClient();const {error}=await s.rpc("admin_create_password_reset",{target_user_id:account.user_id,token_digest:digest});if(error){setMessage(error.message.includes("once every 60 seconds")?"복구 코드는 동일 회원에게 60초 간격으로 발급할 수 있어요. 잠시 후 다시 시도해 주세요.":"복구 코드를 만들지 못했어요.");return;}setResetIssuedAt(prev=>({...prev,[account.user_id]:Date.now()}));setMessage("");setResetCode(`${account.nickname||account.login_id} 복구 코드: ${code} (15분간 1회 사용)`);}catch{setMessage("복구 코드 발급 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");}finally{resetPending.current.delete(account.user_id);setResetBusy(prev=>({...prev,[account.user_id]:false}));}
 }
 async function setMode(mode:"AUTO"|"MANUAL"){setResetCode("");const s=createClient();const {error}=await s.rpc("set_signup_approval_mode",{new_mode:mode});if(error){setMessage("가입 승인 방식을 변경하지 못했어요.");return;}setApprovalMode(mode);setMessage(mode==="AUTO"?"신규 회원은 가입 즉시 자동 승인됩니다.":"신규 회원은 운영자 승인 후 이용할 수 있습니다.");}
 return <main className="app-shell"><section className="hero-card"><p className="eyebrow">아빠한자 운영자</p><h1>회원 관리</h1><p className="subtitle">회원 상태와 최근 접속을 확인하고 오래된 계정을 정리할 수 있어요.</p></section>
 <section className="admin-user-card"><div><strong>회원가입 승인 방식</strong><span>새로 가입하는 회원에게만 적용됩니다.</span></div><div className="admin-actions"><button className={approvalMode==="AUTO"?"":"secondary-button"} onClick={()=>setMode("AUTO")}>자동 승인</button><button className={approvalMode==="MANUAL"?"":"secondary-button"} onClick={()=>setMode("MANUAL")}>운영자 승인</button></div></section>{message?<p className="form-message">{message}</p>:null}{resetCode?<div className="form-message" role="status"><p>{resetCode}</p><button type="button" className="secondary-button" onClick={()=>setResetCode("")}>복구 코드 닫기</button></div>:null}{loading?<p>불러오는 중...</p>:<section className="admin-list">{rows.map(a=>{const inactive=daysSince(a.last_seen_at,now);const self=a.user_id===adminId;const protectedAccount=self||a.is_admin;return <article className="admin-user-card" key={a.user_id}><div><strong>{a.nickname||a.login_id}{a.is_admin?" · 운영자":""}</strong><span>@{a.login_id} · 가입 {new Date(a.created_at).toLocaleDateString("ko-KR")}</span><span>마지막 접속 {a.last_seen_at?new Date(a.last_seen_at).toLocaleDateString("ko-KR"):"기록 없음"}{inactive!==null?` · ${inactive}일 전`:""}</span></div><p>{a.application_message||"남긴 메시지가 없습니다."}</p><small>{a.status}</small>{protectedAccount?<p className="subtitle">운영자 계정은 상태 변경·삭제할 수 없습니다.</p>:<div className="admin-actions"><button onClick={()=>change(a.user_id,"ACTIVE")}>승인</button><button className="secondary-button" onClick={()=>change(a.user_id,"REJECTED")}>거절</button><button className="danger-button" onClick={()=>change(a.user_id,"SUSPENDED")}>이용정지</button><button className="secondary-button" disabled={!!resetBusy[a.user_id]} onClick={()=>createReset(a)}>{resetBusy[a.user_id]?"발급 중...":"복구 코드 발급"}</button><button className="danger-button" onClick={()=>remove(a)}>계정 삭제</button></div>}</article>})}</section>}
 </main>;
}
