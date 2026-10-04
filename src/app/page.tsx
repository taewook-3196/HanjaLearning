import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { LogoutButton } from "@/components/logout-button";

export default async function Home() {
  const { supabase, user } = await requireActiveUser();

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("nickname,target_provider,target_grade").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_settings").select("exam_provider_id").eq("user_id", user.id).maybeSingle(),
  ]);
  const { data: isAdmin } = await supabase.rpc("is_app_admin");
  if (!profile?.target_provider || !profile?.target_grade) redirect("/onboarding");

  let gradeQuery = supabase.from("exam_grades").select("id,name,cumulative_hanja_count").eq("code", profile.target_grade);
  if (settings?.exam_provider_id) gradeQuery = gradeQuery.eq("provider_id", settings.exam_provider_id);
  const { data: grades } = await gradeQuery;
  const gradeIds = (grades ?? []).map((grade) => grade.id);
  let targetCount = 0;

  let learnedCount = 0, reviewCount = 0, wrongCount = 0;
  if (gradeIds.length) {
    const { data: mappings } = await supabase.from("grade_hanja").select("hanja_id").in("grade_id", gradeIds);
    const ids = [...new Set((mappings ?? []).map((m) => m.hanja_id))];
    targetCount = ids.length;
    if (ids.length) {
      const now = new Date().toISOString();
      const [{ count: learned }, { count: review }, { count: wrong }] = await Promise.all([
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("study_count",0),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).lte("next_review_at",now),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("wrong_streak",0),
      ]);
      learnedCount=learned??0; reviewCount=review??0; wrongCount=wrong??0;
    }
  }
  const newCount=Math.min(5,Math.max(0,targetCount-learnedCount));
  const percent=targetCount?Math.min(100,Math.round((learnedCount/targetCount)*100)):0;
  const providerLabel=profile.target_provider==="ALL"?"전체":profile.target_provider;

  return <main className="app-shell">
    <section className="hero-card appa-hero"><div className="hero-actions"><div><p className="eyebrow">{profile.nickname}님의 오늘 학습</p><h1>아빠한자</h1><p className="subtitle">아빠와 함께 매일 조금씩, 한자 실력이 자라요.</p></div><div className="hero-mascot" aria-hidden="true">👨‍👧<span>漢</span></div></div><LogoutButton /></section>
    <section className="study-card"><div><p className="eyebrow">오늘의 학습</p><h2>오늘도 한자 공부 어때요? 😊</h2></div><div className="study-grid"><div className="study-item"><span>새 한자</span><strong>{newCount}자</strong></div><div className="study-item"><span>오늘 복습</span><strong>{reviewCount}자</strong></div><div className="study-item"><span><Link href="/learn?mode=wrong">오답 복습</Link></span><strong>{wrongCount}자</strong></div></div><Link className="primary-link" href="/learn">오늘 학습 시작</Link></section>
    <section className="progress-card"><div className="progress-heading"><div><p className="eyebrow">{providerLabel} · 목표 급수</p><h2>{profile.target_grade} 도전</h2></div><strong>{learnedCount} / {targetCount}</strong></div><div className="progress-track" aria-label={"학습 진도 "+percent+"%"}><span style={{width:percent+"%"}} /></div><p>실제 학습 기록을 기준으로 계산합니다.</p><Link className="settings-link" href="/settings">시험기관 · 목표급수 바꾸기</Link></section>
    <nav className="bottom-nav" aria-label="주 메뉴"><span className="active">홈</span><span>학습</span><Link href="/collection">도감</Link><Link href="/quiz">퀴즈</Link><Link href="/exam">시험</Link><Link href="/write">쓰기</Link><Link href="/stats">기록</Link><Link href="/settings">나</Link>{isAdmin ? <Link href="/admin/users">회원 관리</Link> : null}</nav>
  </main>;
}
