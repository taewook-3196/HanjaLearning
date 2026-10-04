"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (target: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback": (code?: string) => boolean | void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "flexible" | "compact";
      }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Result = "idle" | "running" | "success" | "error";

export default function TurnstileDiagnosticPage() {
  const productionKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [testResult, setTestResult] = useState<Result>("idle");
  const [testError, setTestError] = useState("");
  const [productionResult, setProductionResult] = useState<Result>("idle");
  const [productionError, setProductionError] = useState("");
  const widgets = useRef<string[]>([]);

  const renderChecks = useCallback(() => {
    if (!window.turnstile) return;
    widgets.current.forEach(id => window.turnstile?.remove(id));
    widgets.current = [];
    setTestResult("running");
    setProductionResult(productionKey ? "running" : "error");
    setTestError("");
    setProductionError(productionKey ? "" : "site-key-missing");

    widgets.current.push(window.turnstile.render("#turnstile-test-key", {
      sitekey: "1x00000000000000000000AA",
      theme: "auto",
      size: "flexible",
      callback: () => setTestResult("success"),
      "error-callback": code => {
        setTestError(code || "unknown");
        setTestResult("error");
        return true;
      },
    }));

    if (productionKey) {
      widgets.current.push(window.turnstile.render("#turnstile-production-key", {
        sitekey: productionKey,
        theme: "auto",
        size: "flexible",
        callback: () => setProductionResult("success"),
        "error-callback": code => {
          setProductionError(code || "unknown");
          setProductionResult("error");
          return true;
        },
      }));
    }
  }, [productionKey]);

  const label = (result: Result, code: string) => {
    if (result === "success") return "성공";
    if (result === "error") return `실패 · ${code}`;
    if (result === "running") return "확인 중…";
    return "대기 중";
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Android 보안 확인 진단</p>
        <h1>Turnstile 확인</h1>
        <p className="subtitle">회원가입은 진행하지 않습니다. 테스트 키와 실제 서비스 키가 이 브라우저에서 동작하는지만 확인합니다.</p>

        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderChecks}
        />

        <div style={{marginTop:24}}>
          <strong>1. Cloudflare 공식 테스트 키</strong>
          <div id="turnstile-test-key" className="turnstile-wrap" />
          <p className="field-note">결과: {label(testResult, testError)}</p>
        </div>

        <div style={{marginTop:20}}>
          <strong>2. 아빠한자 실제 키</strong>
          <div id="turnstile-production-key" className="turnstile-wrap" />
          <p className="field-note">결과: {label(productionResult, productionError)}</p>
        </div>

        <button type="button" onClick={renderChecks} style={{marginTop:18}}>다시 확인</button>
        <p className="auth-note">두 결과를 함께 알려주시면 단말 환경 문제와 서비스 설정 문제를 구분할 수 있습니다.</p>
      </section>
    </main>
  );
}
