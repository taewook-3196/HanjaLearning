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
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("study_count",0).lte("next_review_at",now),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("study_count",0).gt("wrong_streak",0),
      ]);
      learnedCount=learned??0; reviewCount=review??0; wrongCount=wrong??0;
    }
  }
  if (targetCount === 0) {
    return <main className="app-shell"><section className="hero-card appa-hero"><div className="hero-actions"><div><p className="eyebrow">{profile.nickname}님의 학습 설정</p><h1>아빠한자</h1><p className="subtitle">선택한 목표급수의 학습 콘텐츠를 아직 준비 중이에요.</p></div><div className="hero-mascot" aria-hidden="true">👨‍👧<span>漢</span></div></div><LogoutButton /></section><section className="study-card"><div><p className="eyebrow">목표급수 확인</p><h2>{profile.target_grade}은(는) 아직 학습할 수 없어요.</h2><p className="subtitle">지금 학습 가능한 급수로 목표를 바꿔 주세요. 기존 학습 기록은 그대로 남습니다.</p></div><Link className="primary-link" href="/settings">학습 가능한 급수 선택하기</Link></section></main>;
  }
  // /learn serves due reviews first, then unseen Hanja, capped at 8 cards total.
  // Keep the home summary aligned with that exact session composition.
  const todayReviewCount=Math.min(8,reviewCount);
  const newCount=Math.min(Math.max(0,8-todayReviewCount),Math.max(0,targetCount-learnedCount));
  const todayTotal=todayReviewCount+newCount;
  const percent=targetCount?Math.min(100,Math.round((learnedCount/targetCount)*100)):0;
  const providerLabel=profile.target_provider==="ALL"?"전체":profile.target_provider;

  return <main className="app-shell">
    <section className="hero-card appa-hero"><div className="hero-actions"><div><p className="eyebrow">{profile.nickname}님의 오늘 학습</p><h1>아빠한자</h1><p className="subtitle">아빠와 함께 매일 조금씩, 한자 실력이 자라요.</p></div><div className="hero-mascot" aria-hidden="true">👨‍👧<span>漢</span></div></div><LogoutButton /></section>
    <section className="study-card"><div><p className="eyebrow">오늘의 학습</p><h2>오늘도 한자 공부 어때요? 😊</h2></div><div className="study-grid"><div className="study-item"><span>새 한자</span><strong>{newCount}자</strong></div><div className="study-item"><span>오늘 복습</span><strong>{todayReviewCount}자</strong></div><div className="study-item"><span>오늘 총 학습</span><strong>{todayTotal}자</strong></div></div><Link className="primary-link" href="/learn">오늘 학습 시작 · {todayTotal}자</Link><Link className="settings-link" href="/write">✍️ 배운 한자 쓰기 연습</Link>{wrongCount>0?<Link className="settings-link" href="/learn?mode=wrong">오답 {wrongCount}자 따로 복습하기</Link>:null}</section>
    <section className="progress-card"><div className="progress-heading"><div><p className="eyebrow">{providerLabel} · 목표 급수</p><h2>{profile.target_grade} 도전</h2></div><strong>{learnedCount} / {targetCount}</strong></div><div className="progress-track" aria-label={"학습 진도 "+percent+"%"}><span style={{width:percent+"%"}} /></div><p>실제 학습 기록을 기준으로 계산합니다.</p><Link className="settings-link" href="/stats">📈 나의 학습 기록 보기</Link><Link className="settings-link" href="/settings">시험기관 · 목표급수 바꾸기</Link></section>
    <nav className="bottom-nav" aria-label="주 메뉴"><span className="active">홈</span><Link href="/learn">학습</Link><Link href="/collection">도감</Link><Link href="/quiz">퀴즈</Link><Link href="/settings">나</Link></nav>
  </main>;
}
