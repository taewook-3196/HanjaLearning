"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TurnstileChallenge from "@/components/turnstile-challenge";

const AUTH_DOMAIN = "hanjalearning.local";
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{2,19}$/;

export default function SignupPage() {
  const router = useRouter();
  const [loginId,setLoginId]=useState("");
  const [nickname,setNickname]=useState("");
  const [password,setPassword]=useState("");
  const [applicationMessage,setApplicationMessage]=useState("");
  const [confirm,setConfirm]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const [privacyConfirmed,setPrivacyConfirmed]=useState(false);
  const [termsConfirmed,setTermsConfirmed]=useState(false);
  const [captchaToken,setCaptchaToken]=useState<string|null>(null);

  async function handleSignup(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const id=loginId.trim().toLowerCase();
    const name=nickname.trim();
    setMessage("");
    if(!ID_PATTERN.test(id)){setMessage("아이디는 영문 소문자·숫자·_·-로 3~20자 입력해 주세요.");return;}
    if(name.length<1||name.length>30){setMessage("별명은 1~30자로 입력해 주세요.");return;}
    if(password.length<8){setMessage("비밀번호는 8자 이상으로 만들어 주세요.");return;}
    if(password!==confirm){setMessage("비밀번호가 서로 달라요.");return;}
    if(!privacyConfirmed){setMessage("개인정보 안내를 확인해 주세요.");return;}
    if(!termsConfirmed){setMessage("이용 안내 및 약관을 확인해 주세요.");return;}
    if(!captchaToken){setMessage("보안 확인을 완료해 주세요.");return;}
    setLoading(true);
    const supabase=createClient();
    const email=`${id}@${AUTH_DOMAIN}`;
    const {data,error}=await supabase.auth.signUp({email,password,options:{captchaToken,data:{login_id:id,nickname:name,application_message:applicationMessage.trim()}}});
    if(error||!data.user){
      setMessage(error?.message?.toLowerCase().includes("already")?"이미 사용 중인 아이디예요.":"회원가입을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setLoading(false);return;
    }
    if(!data.session){
      setMessage("가입은 완료됐지만 자동 로그인이 되지 않았어요. 로그인 화면에서 로그인해 주세요.");
      setLoading(false);return;
    }
    const [{error:profileError},{error:settingsError}]=await Promise.all([
      supabase.from("profiles").upsert({user_id:data.user.id,nickname:name,target_grade:"5급"},{onConflict:"user_id"}),
      supabase.from("user_settings").upsert({user_id:data.user.id},{onConflict:"user_id"}),
    ]);
    if(profileError||settingsError){
      setMessage("계정은 만들어졌지만 학습 프로필 준비에 실패했어요. 다시 로그인해 주세요.");
      setLoading(false);return;
    }
    router.replace("/pending");router.refresh();
  }

  return <main className="auth-shell"><section className="auth-card">
    <p className="eyebrow">아빠한자</p><h1>회원가입</h1>
    <p className="subtitle">이메일 없이 아이디와 비밀번호로 시작할 수 있어요.</p>
    <form className="auth-form" onSubmit={handleSignup}>
      <label><span>아이디</span><input type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="예: hanja123" value={loginId} onChange={e=>setLoginId(e.target.value)} required /></label>
      <label><span>별명</span><input type="text" autoComplete="nickname" maxLength={30} placeholder="앱에서 사용할 이름" value={nickname} onChange={e=>setNickname(e.target.value)} required /></label>
      <label><span>운영자에게 남길 메시지</span><textarea maxLength={300} placeholder="예: 5급 한자 공부를 위해 신청합니다." value={applicationMessage} onChange={e=>setApplicationMessage(e.target.value)} required /><small className="field-note">실명, 전화번호, 학교명, 주소, 계정 비밀번호 등 개인정보나 민감한 정보는 적지 마세요.</small></label>
      <label><span>비밀번호</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <label><span>비밀번호 확인</span><input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label>
      <label className="privacy-confirm"><input type="checkbox" checked={privacyConfirmed} onChange={e=>setPrivacyConfirmed(e.target.checked)} required /><span><Link href="/privacy" target="_blank">개인정보 안내</Link>를 확인했고, 실명·전화번호·학교명·주소 등 불필요한 개인정보를 입력하지 않겠습니다.</span></label>
      <label className="privacy-confirm"><input type="checkbox" checked={termsConfirmed} onChange={e=>setTermsConfirmed(e.target.checked)} required /><span><Link href="/terms" target="_blank">이용 안내 및 약관</Link>을 확인하고 동의합니다.</span></label>
      <TurnstileChallenge onToken={setCaptchaToken} />
      {message?<p className="form-message" role="alert">{message}</p>:null}
      <button type="submit" disabled={loading||!captchaToken}>{loading?"가입 중...":"회원가입"}</button>
    </form>
    <p className="auth-note">이미 계정이 있나요? <Link href="/login">로그인</Link></p>
  </section></main>;
}
