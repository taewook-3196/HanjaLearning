import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: "한자배움",
  description: "가족과 함께 사용하는 광고 없는 한자 학습 앱",
  applicationName: "한자배움",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "한자배움",
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
      <body><ServiceWorkerRegister />{children}</body>
    </html>
  );
}
