const todayItems = [
  { label: "새 한자", value: "5자" },
  { label: "오늘 복습", value: "8자" },
  { label: "오답 복습", value: "3자" },
];

export default function Home() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">오늘도 한 걸음</p>
        <h1>한자배움</h1>
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
            <h2 id="progress-title">5급 도전</h2>
          </div>
          <strong>0 / 500</strong>
        </div>
        <div className="progress-track" aria-label="5급 학습 진도 0%">
          <span style={{ width: "0%" }} />
        </div>
        <p>로그인과 학습 기록 기능은 다음 단계에서 연결합니다.</p>
      </section>

      <nav className="bottom-nav" aria-label="주 메뉴">
        <span className="active">홈</span>
        <span>학습</span>
        <span>도감</span>
        <span>시험</span>
        <span>나</span>
      </nav>
    </main>
  );
}
