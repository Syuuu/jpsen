import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "JP Phrases Trainer",
  description: "Daily Japanese phrase trainer with SRS and shadowing.",
  manifest: "/manifest.webmanifest",
  themeColor: "#ffffff"
};

export const viewport = {
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
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <img src="/icon.svg" alt="" className="h-7 w-7" />
              <span>JP Phrases Trainer</span>
            </Link>
            <HeaderNav />
          </div>
        </header>
        <main className="container flex-1 py-8">{children}</main>
        <footer className="container pb-6 text-center text-xs text-slate-400">
          版本 1.0.2
        </footer>
      </body>
    </html>
  );
}
