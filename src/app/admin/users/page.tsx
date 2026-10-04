"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type Account={user_id:string;login_id:string;nickname:string|null;application_message:string;status:string;created_at:string};
export default function AdminUsersPage(){
 const router=useRouter();const [rows,setRows]=useState<Account[]>([]);const [loading,setLoading]=useState(true);const [message,setMessage]=useState("");const [approvalMode,setApprovalMode]=useState<"AUTO"|"MANUAL">("AUTO");
 async function load(){
  const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){router.replace("/login");return;}
  const {data:isAdmin}=await s.rpc("is_app_admin");if(!isAdmin){router.replace("/");return;}
  const {data:mode}=await s.rpc("get_signup_approval_mode");setApprovalMode(mode==="MANUAL"?"MANUAL":"AUTO");\n  const {data,error}=await s.from("account_status").select("user_id,login_id,nickname,application_message,status,created_at").order("created_at",{ascending:false});
  if(error)setMessage("회원 목록을 불러오지 못했어요.");else setRows(data??[]);setLoading(false);
 }
 useEffect(()=>{queueMicrotask(()=>{void load();});},[]);
 async function change(userId:string,status:"ACTIVE"|"REJECTED"|"SUSPENDED"){
  const s=createClient();const {error}=await s.from("account_status").update({status,updated_at:new Date().toISOString()}).eq("user_id",userId);
  if(error){setMessage("상태를 변경하지 못했어요.");return;}await load();
 }
 async function setMode(mode:"AUTO"|"MANUAL"){const s=createClient();const {error}=await s.rpc("set_signup_approval_mode",{new_mode:mode});if(error){setMessage("가입 승인 방식을 변경하지 못했어요.");return;}setApprovalMode(mode);setMessage(mode==="AUTO"?"신규 회원은 가입 즉시 자동 승인됩니다.":"신규 회원은 운영자 승인 후 이용할 수 있습니다.");}\n return <main className="app-shell"><section className="hero-card"><p className="eyebrow">아빠한자 운영자</p><h1>회원 관리</h1><p className="subtitle">가입 신청 내용을 확인한 뒤 승인하거나 거절할 수 있어요.</p></section>
 <section className="admin-user-card"><div><strong>회원가입 승인 방식</strong><span>새로 가입하는 회원에게만 적용됩니다.</span></div><div className="admin-actions"><button className={approvalMode==="AUTO"?"":"secondary-button"} onClick={()=>setMode("AUTO")}>자동 승인</button><button className={approvalMode==="MANUAL"?"":"secondary-button"} onClick={()=>setMode("MANUAL")}>운영자 승인</button></div></section>{message?<p className="form-message">{message}</p>:null}{loading?<p>불러오는 중...</p>:<section className="admin-list">{rows.map(a=><article className="admin-user-card" key={a.user_id}><div><strong>{a.nickname||a.login_id}</strong><span>@{a.login_id} · {new Date(a.created_at).toLocaleDateString("ko-KR")}</span></div><p>{a.application_message||"남긴 메시지가 없습니다."}</p><small>{a.status}</small><div className="admin-actions"><button onClick={()=>change(a.user_id,"ACTIVE")}>승인</button><button className="secondary-button" onClick={()=>change(a.user_id,"REJECTED")}>거절</button><button className="danger-button" onClick={()=>change(a.user_id,"SUSPENDED")}>이용정지</button></div></article>)}</section>}
 </main>;
}
