"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { phrases } from "@/data/phrases";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TagChips } from "@/components/TagChips";
import { useFavorites } from "@/hooks/useFavorites";
import { useOpenedPhrases } from "@/hooks/useOpenedPhrases";

export default function PhraseDetailPage() {
  const params = useParams<{ id: string }>();
  const phraseIndex = phrases.findIndex((item) => item.id === params.id);
  const phrase = phraseIndex >= 0 ? phrases[phraseIndex] : null;
  const nextPhrase = phraseIndex >= 0 ? phrases[phraseIndex + 1] : null;
  const { favorites, toggleFavorite } = useFavorites();
  const { markOpened } = useOpenedPhrases();

  useEffect(() => {
    if (phrase) {
      markOpened(phrase.id);
    }
  }, [phrase, markOpened]);

  if (!phrase) {
    return (
      <div className="space-y-4">
        <p>没有找到这条句子。</p>
        <Link href="/library" className="text-accent">
          返回会话库
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(phrase.id);

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{phrase.jp}</h1>
            {phrase.kana && <p className="text-slate-500">{phrase.kana}</p>}
            <p className="text-slate-600">{phrase.cn}</p>
          </div>
          <button
            onClick={() => toggleFavorite(phrase.id)}
            className={`btn ${isFavorite ? "btn-primary" : ""}`}
          >
            {isFavorite ? "已收藏" : "收藏"}
          </button>
        </div>
        <TagChips tags={phrase.tags} tone={phrase.tone} />
        {phrase.notes && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            使用注意：{phrase.notes}
          </div>
        )}
        {phrase.dialogue && (
          <div className="rounded-xl border border-slate-200 p-4 text-sm">
            <p className="font-semibold text-slate-600">💬 对话</p>
            <p className="mt-2">A：{phrase.dialogue.a}</p>
            <p className="text-slate-500">A：{phrase.dialogue.cn.a}</p>
            <p>B：{phrase.dialogue.b}</p>
            <p className="text-slate-500">B：{phrase.dialogue.cn.b}</p>
          </div>
        )}
        <AudioPlayer text={phrase.jp} />
        <div className="flex items-center justify-between">
          <Link href="/library" className="btn">
            返回会话库
          </Link>
          {nextPhrase ? (
            <Link href={`/phrase/${nextPhrase.id}`} className="btn btn-primary">
              下一个
            </Link>
          ) : (
            <button className="btn" disabled>
              已是最后一条
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
