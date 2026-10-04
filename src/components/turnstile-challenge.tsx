"use client";

import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (target: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback": () => void;
        "error-callback": (errorCode?: string) => boolean | void;
        "timeout-callback"?: () => void;
        "unsupported-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "flexible" | "compact";
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = { onToken: (token: string | null) => void };
type Status = "loading" | "ready" | "error";

export default function TurnstileChallenge({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const reactId = useId();
  const elementId = `turnstile-${reactId.replace(/:/g, "")}`;
  const widgetId = useRef<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorCode, setErrorCode] = useState("");

  const fail = useCallback((code: string) => {
    onToken(null);
    setErrorCode(code);
    setStatus("error");
  }, [onToken]);

  const renderWidget = useCallback(() => {
    if (!siteKey || !window.turnstile || widgetId.current) return;
    const target = document.getElementById(elementId);
    if (!target) return;
    try {
      widgetId.current = window.turnstile.render(target, {
        sitekey: siteKey,
        theme: "auto",
        size: "flexible",
        callback: (token) => {
          setErrorCode("");
          setStatus("ready");
          onToken(token);
        },
        "expired-callback": () => {
          onToken(null);
          setStatus("loading");
          if (widgetId.current) window.turnstile?.reset(widgetId.current);
        },
        "error-callback": (code) => {
          fail(code || "unknown");
          return true;
        },
        "timeout-callback": () => fail("timeout"),
        "unsupported-callback": () => fail("unsupported-browser"),
      });
    } catch {
      fail("render-error");
    }
  }, [elementId, fail, onToken, siteKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!widgetId.current) fail(window.turnstile ? "widget-not-rendered" : "script-not-loaded");
    }, 8000);
    renderWidget();
    return () => {
      window.clearTimeout(timer);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [fail, renderWidget]);

  const retry = () => {
    setErrorCode("");
    setStatus("loading");
    onToken(null);
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      return;
    }
    widgetId.current = null;
    renderWidget();
  };

  if (!siteKey) {
    return <p className="form-message" role="alert">보안 확인 설정을 불러오지 못했습니다. 운영자에게 알려 주세요.</p>;
  }

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
        onError={() => fail("script-load-error")}
      />
      <div className="turnstile-wrap" aria-label="자동 가입 방지 보안 확인">
        <div id={elementId} />
      </div>
      {status === "loading" ? <p className="field-note">보안 확인을 불러오는 중입니다…</p> : null}
      {status === "error" ? (
        <div className="form-message" role="alert">
          <p>보안 확인을 완료하지 못했습니다. 오류 코드: <strong>{errorCode}</strong></p>
          <button type="button" onClick={retry}>보안 확인 다시 시도</button>
          <p className="field-note">계속 실패하면 Chrome에서 새로고침하거나 다른 네트워크에서 다시 시도해 주세요.</p>
        </div>
      ) : null}
    </div>
  );
}
