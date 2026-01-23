"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/library", label: "会话库", icon: "📚" },
  { href: "/guide", label: "使用方式", icon: "🧭" },
  { href: "/review", label: "今日复习", icon: "🧩" },
  { href: "/practice/shadowing", label: "跟读", icon: "🎧" },
  { href: "/practice/cloze", label: "听力", icon: "🎯" },
  { href: "/favorites", label: "收藏夹", icon: "⭐" },
  { href: "/settings", label: "设置", icon: "⚙️" }
];

export function HeaderNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <button
        className="btn btn-ghost h-10 w-10 p-0 text-lg"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="菜单"
      >
        ☰
      </button>
      {open && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
          role="menu"
        >
          <div className="grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-accent"
                role="menuitem"
              >
                <span aria-hidden>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
