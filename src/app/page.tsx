import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

const todayItems = [
  { label: "새 한자", value: "5자" },
  { label: "오늘 복습", value: "8자" },
  { label: "오답 복습", value: "3자" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, target_provider, target_grade")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.target_provider || !profile?.target_grade) redirect("/onboarding");

  const nickname = profile.nickname ?? "학습자";
  const targetGrade = profile?.target_grade ?? "5급";

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-actions">
          <div>
            <p className="eyebrow">{nickname}님의 오늘 학습</p>
            <h1>한자배움</h1>
          </div>
          <LogoutButton />
        </div>
        <p className="subtitle">매일 조금씩, 오래 기억하는 한자 학습</p>
      </section>

      <section className="study-card" aria-labelledby="today-title">
        <div>
          <p className="eyebrow">오늘의 학습</p>
          <h2 id="today-title">약 10분이면 끝나요</h2>
        </div>
        <div className="study-grid">
          {todayItems.map((item) => (
            <div className="study-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <button type="button">오늘 학습 시작</button>
      </section>

      <section className="progress-card" aria-labelledby="progress-title">
        <div className="progress-heading">
          <div>
            <p className="eyebrow">목표 급수</p>
            <h2 id="progress-title">{targetGrade} 도전</h2>
          </div>
          <strong>0 / 500</strong>
        </div>
        <div className="progress-track" aria-label="학습 진도 0%">
          <span style={{ width: "0%" }} />
        </div>
        <p>학습 기록은 로그인한 사용자 계정에만 저장됩니다.</p>
      </section>

      <nav className="bottom-nav" aria-label="주 메뉴">
        <span className="active">홈</span><span>학습</span><span>도감</span><span>시험</span><span>나</span>
      </nav>
    </main>
  );
}
