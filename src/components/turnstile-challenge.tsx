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
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  onToken: (token: string | null) => void;
};

export default function TurnstileChallenge({ onToken }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const reactId = useId();
  const elementId = `turnstile-${reactId.replace(/:/g, "")}`;
  const widgetId = useRef<string | null>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"error">("loading");
  const [errorCode, setErrorCode] = useState("");

  const renderWidget = useCallback(() => {
    if (!siteKey || !window.turnstile || widgetId.current) return;
    const target = document.getElementById(elementId);
    if (!target) return;
    widgetId.current = window.turnstile.render(target, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
  }, [elementId, onToken, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [renderWidget]);

  if (!siteKey) {
    return <p className="form-message" role="alert">보안 확인 설정을 준비 중입니다. 잠시 후 다시 시도해 주세요.</p>;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div className="turnstile-wrap" aria-label="자동 가입 방지 보안 확인">
        <div id={elementId} />
      </div>
    </>
  );
}
