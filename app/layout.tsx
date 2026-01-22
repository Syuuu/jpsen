import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "JP Phrases Trainer",
  description: "Daily Japanese phrase trainer with SRS and shadowing.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-semibold">
              JP Phrases Trainer
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link href="/library" className="hover:text-accent">
                句子库
              </Link>
              <Link href="/review" className="hover:text-accent">
                今日复习
              </Link>
              <Link href="/practice/shadowing" className="hover:text-accent">
                跟读
              </Link>
              <Link href="/practice/cloze" className="hover:text-accent">
                听力
              </Link>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
