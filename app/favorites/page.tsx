"use client";

import Link from "next/link";
import { useMemo } from "react";
import { phrases } from "@/data/phrases";
import { PhraseCard } from "@/components/PhraseCard";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const favoritePhrases = useMemo(
    () => phrases.filter((phrase) => favorites.includes(phrase.id)),
    [favorites]
  );

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">收藏夹</h1>
        <p className="text-slate-600">集中查看你收藏过的句子。</p>
      </div>

      {favoritePhrases.length === 0 ? (
        <div className="card space-y-3">
          <p className="text-slate-600">还没有收藏的句子。</p>
          <Link href="/library" className="btn btn-primary">
            去句子库看看
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favoritePhrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      )}
    </div>
  );
}
