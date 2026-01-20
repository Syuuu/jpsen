"use client";

import Link from "next/link";
import { phrases } from "@/data/phrases";
import { PhraseCard } from "@/components/PhraseCard";
import { ProgressMeter } from "@/components/ProgressMeter";
import { useSrs } from "@/hooks/useSrs";

export default function HomePage() {
  const { dueToday } = useSrs();
  const goal = 12;
  const completed = Math.max(0, goal - dueToday.length);

  return (
    <div className="space-y-8">
      <section className="card space-y-4">
        <h1 className="text-2xl font-semibold">今天想练哪一段？</h1>
        <p className="text-slate-600">
          以整句话为核心，用短对话和真实场景建立记忆。
        </p>
        <ProgressMeter value={completed} total={goal} />
        <div className="flex flex-wrap gap-3">
          <Link href="/review" className="btn btn-primary">
            今日复习 {dueToday.length} 句
          </Link>
          <Link href="/practice/shadowing" className="btn">
            开始跟读
          </Link>
          <Link href="/library" className="btn">
            搜索句子库
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">继续练习</h2>
          <Link href="/library" className="text-sm text-accent">
            查看全部
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {phrases.slice(0, 4).map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      </section>
    </div>
  );
}
