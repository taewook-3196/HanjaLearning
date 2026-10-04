import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export default async function PendingPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data:account}=await supabase.from("account_status").select("status").eq("user_id",user.id).maybeSingle();
  if(account?.status==="ACTIVE") redirect("/onboarding");
  return <main className="auth-shell"><section className="auth-card">
    <p className="eyebrow">아빠한자 회원가입</p>
    <h1>{account?.status==="SUSPENDED"?"이용이 제한된 계정이에요":"승인을 기다리고 있어요"}</h1>
    <p className="subtitle">{account?.status==="SUSPENDED"?"운영자에게 문의해 주세요.":"회원가입 신청이 완료되었습니다. 운영자가 승인하면 학습을 시작할 수 있어요."}</p>
    <div style={{marginTop:24}}><LogoutButton /></div>
  </section></main>;
}
