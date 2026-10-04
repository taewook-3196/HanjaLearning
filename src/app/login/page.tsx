"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const FAMILY_AUTH_DOMAIN = "hanjalearning.local";

function normalizeLoginId(value: string) {
  const loginId = value.trim().toLowerCase();

  if (loginId.includes("@")) {
    return { email: loginId, nickname: loginId.split("@")[0].slice(0, 30) || "학습자" };
  }

  return {
    email: `${loginId}@${FAMILY_AUTH_DOMAIN}`,
    nickname: loginId.slice(0, 30) || "학습자",
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { email, nickname } = normalizeLoginId(loginId);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setMessage("아이디 또는 비밀번호를 확인해 주세요.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: data.user.id,
        nickname,
        target_grade: "5급",
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

    if (profileError) {
      await supabase.auth.signOut();
      setMessage("학습 프로필을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    await supabase.from("user_settings").upsert(
      { user_id: data.user.id },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">아빠한자</p>
        <h1>로그인</h1>
        <p className="subtitle">내 아이디로 로그인하면 내 학습 기록만 안전하게 저장돼요.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            <span>아이디</span>
            <input
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="예: test-a"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
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
          <button type="submit" disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button>
        </form>

        <p className="auth-note">처음인가요? <Link href="/signup">회원가입</Link></p>
      </section>
    </main>
  );
}
