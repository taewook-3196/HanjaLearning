"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("아이디 또는 비밀번호를 확인해 주세요.");
      setLoading(false);
      return;
    }

    window.location.assign("/");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">가족 학습 공간</p>
        <h1>로그인</h1>
        <p className="subtitle">각자의 계정으로 로그인하면 학습 기록이 서로 섞이지 않아요.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            <span>아이디</span>
            <input
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="family@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="form-message" role="alert">{message}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="auth-note">계정은 가족용으로만 생성하며 비밀번호 원문은 앱 DB에 저장하지 않습니다.</p>
      </section>
    </main>
  );
}
