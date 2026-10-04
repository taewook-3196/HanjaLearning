"use client";

import { useEffect, useState } from "react";

const KEY = "appa-hanja-family-choice";

export default function DadGate({ children }: { children: React.ReactNode }) {
  const [dadChosen, setDadChosen] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY) === "dad";
    queueMicrotask(() => setDadChosen(saved));
  }, []);

  function chooseDad() {
    window.localStorage.setItem(KEY, "dad");
    setDadChosen(true);
  }

  if (dadChosen === null) return null;
  if (dadChosen) return <>{children}</>;

  return (
    <main className="dad-gate">
      <section className="dad-gate-card">
        <p className="eyebrow">아빠한자 입장 질문</p>
        <h1>아빠가 좋아?<br />엄마가 좋아?</h1>
        <p className="subtitle">정답을 골라야 한자 공부를 시작할 수 있어요.</p>
        <div className="dad-gate-actions">
          <button type="button" onClick={chooseDad}>아빠가 좋아!</button>
          <button type="button" className="secondary-button" onClick={() => setMessage("음… 다시 생각해 보자 😄")}>엄마가 좋아!</button>
        </div>
        {message ? <p className="dad-gate-message" role="status">{message}</p> : null}
      </section>
    </main>
  );
}
