import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/service-worker-register";
import DadGate from "@/components/dad-gate";
import ActivityTracker from "@/components/activity-tracker";

export const metadata: Metadata = {
  title: "아빠한자",
  description: "가족과 함께 사용하는 광고 없는 한자 학습 앱",
  applicationName: "아빠한자",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "아빠한자",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body><ServiceWorkerRegister /><ActivityTracker /><DadGate>{children}</DadGate></body>
    </html>
  );
}
