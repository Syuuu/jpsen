"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { phrases } from "@/data/phrases";
import { PhraseCard } from "@/components/PhraseCard";
import { ProgressMeter } from "@/components/ProgressMeter";
import { useSrs } from "@/hooks/useSrs";
import { useOpenedPhrases } from "@/hooks/useOpenedPhrases";
import { dailyReviewLimit } from "@/lib/srs";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";

const shuffle = <T,>(list: T[]) => {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export default function HomePage() {
  const { dueToday, srsMap } = useSrs();
  const { opened } = useOpenedPhrases();
  const goal = dailyReviewLimit;
  const completed = Math.max(0, goal - dueToday.length);
  const [showReviewNudge, setShowReviewNudge] = useState(false);
  const continueList = useMemo(() => {
    const openedSet = new Set(opened);
    const unlearned = phrases.filter((phrase) => !openedSet.has(phrase.id));
    if (unlearned.length > 0) {
      return shuffle(unlearned);
    }
    return [...phrases].sort((a, b) => {
      const aEntry = srsMap[a.id];
      const bEntry = srsMap[b.id];
      const easeDiff = (aEntry?.ease ?? 1) - (bEntry?.ease ?? 1);
      if (easeDiff !== 0) return easeDiff;
      return (aEntry?.lastReviewedAt ?? 0) - (bEntry?.lastReviewedAt ?? 0);
    });
  }, [opened, srsMap]);

  useEffect(() => {
    if (opened.length === 0 || opened.length % 20 !== 0) return;
    const lastNotified = readStorage<number>(storageKeys.reviewNudge, 0);
    if (opened.length <= lastNotified) return;
    setShowReviewNudge(true);
    writeStorage(storageKeys.reviewNudge, opened.length);
    const timer = window.setTimeout(() => setShowReviewNudge(false), 5000);
    return () => window.clearTimeout(timer);
  }, [opened.length]);

  return (
    <div className="space-y-8">
      <section className="card space-y-4">
        <h1 className="text-2xl font-semibold">🌟 今天想练哪一段？</h1>
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
            搜索会话库
          </Link>
        </div>
        {showReviewNudge && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            你已经学习了 {opened.length} 句，可以进行复习啦。
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">📌 继续练习</h2>
          <Link href="/library" className="text-sm text-accent">
            查看全部
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {continueList.slice(0, 4).map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      </section>
    </div>
  );
}
