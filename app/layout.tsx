import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelPort · 模型 API 中转站",
  description: "连接模型，掌控每一次调用。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head><script src="/assets/theme-runtime.js"/><link rel="stylesheet" href="/assets/themes.css"/><link rel="stylesheet" href="/assets/mobile.css"/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
