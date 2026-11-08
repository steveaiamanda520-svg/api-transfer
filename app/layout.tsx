import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelPort · 模型 API 中转站",
  description: "连接模型，掌控每一次调用。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
