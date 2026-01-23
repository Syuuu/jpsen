import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "JP Phrases Trainer",
  description: "Daily Japanese phrase trainer with SRS and shadowing.",
  manifest: "/manifest.webmanifest",
  themeColor: "#ffffff"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-semibold">
              JP Phrases Trainer
            </Link>
            <HeaderNav />
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
