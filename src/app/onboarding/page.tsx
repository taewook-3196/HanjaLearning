"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Provider = { id: number; code: string; name: string };
type Grade = { id: number; provider_id: number; code: string; name: string; cumulative_hanja_count: number | null; sort_order: number };

export default function OnboardingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [provider, setProvider] = useState("");
  const [grade, setGrade] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const s = createClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: account } = await s.from("account_status").select("status").eq("user_id", user.id).maybeSingle();
      if (account?.status !== "ACTIVE") { router.replace("/pending"); return; }
      const [{ data: p }, { data: st }, { data: ps }, { data: gs }, { data: links }] = await Promise.all([
        s.from("profiles").select("nickname,target_provider,target_grade").eq("user_id", user.id).maybeSingle(),
        s.from("user_settings").select("exam_provider_id").eq("user_id", user.id).maybeSingle(),
        s.from("exam_providers").select("id,code,name").order("id"),
        s.from("exam_grades").select("id,provider_id,code,name,cumulative_hanja_count,sort_order").order("sort_order"),
        s.from("grade_hanja").select("grade_id"),
      ]);
      setNickname(p?.nickname ?? "");
      setProviders(ps ?? []);
      const available = new Set((links ?? []).map((row) => row.grade_id));
      setGrades((gs ?? []).filter((g) => available.has(g.id)));
      if (st?.exam_provider_id) setProvider(String(st.exam_provider_id));
      else if (p?.target_provider === "ALL") setProvider("ALL");
      if (p?.target_grade) setGrade(p.target_grade);
      setLoading(false);
    })();
  }, [router]);

  const visible = provider === "ALL" ? grades : grades.filter((g) => String(g.provider_id) === provider);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nickname.trim() || !provider || !grade) { setMessage("이름, 시험기관, 목표급수를 모두 선택해 주세요."); return; }
    setSaving(true); setMessage("");
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const selected = providers.find((p) => String(p.id) === provider);
    const providerId = provider === "ALL" ? null : Number(provider);
    const targetProvider = provider === "ALL" ? "ALL" : selected?.code ?? null;
    const { error: a } = await s.from("profiles").update({ nickname: nickname.trim(), target_provider: targetProvider, target_grade: grade, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    const { error: b } = await s.from("user_settings").update({ exam_provider_id: providerId, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (a || b) { setMessage("설정을 저장하지 못했습니다. 다시 시도해 주세요."); setSaving(false); return; }
    router.replace("/"); router.refresh();
  }

  if (loading) return <main className="auth-shell"><section className="auth-card"><p>학습 준비 중...</p></section></main>;

  return <main className="auth-shell"><section className="auth-card onboarding-card">
    <p className="eyebrow">처음 한 번만 설정해요</p><h1>누구의 공부인가요?</h1>
    <p className="subtitle">내 이름과 목표를 고르면 바로 시작할 수 있어요.</p>
    <form className="auth-form" onSubmit={save}>
      <label><span>이름</span><input value={nickname} maxLength={30} onChange={(e) => setNickname(e.target.value)} placeholder="예: 민준" required /></label>
      <label><span>시험기관</span><select value={provider} onChange={(e) => { setProvider(e.target.value); setGrade(""); }} required><option value="">골라 주세요</option><option value="ALL">전체</option>{providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label><span>목표급수</span><select value={grade} onChange={(e) => setGrade(e.target.value)} required disabled={!provider}><option value="">골라 주세요</option>{visible.map((g) => <option key={g.id} value={g.code}>{g.name}{g.cumulative_hanja_count ? " · " + g.cumulative_hanja_count + "자" : ""}</option>)}</select></label>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button disabled={saving}>{saving ? "저장 중..." : "공부 시작하기"}</button>
    </form>
  </section></main>;
}
