"use client";

import { useMemo, useState } from "react";
import { PhraseCard } from "@/components/PhraseCard";
import { allTags, phrases, PhraseTone } from "@/data/phrases";

const toneLabels: Record<PhraseTone, string> = {
  casual: "随意",
  polite: "礼貌",
  soft: "柔和"
};

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedTone, setSelectedTone] = useState("all");

  const filtered = useMemo(() => {
    return phrases.filter((phrase) => {
      const matchesQuery =
        phrase.jp.toLowerCase().includes(query.toLowerCase()) ||
        phrase.cn.toLowerCase().includes(query.toLowerCase());
      const matchesTag = selectedTag === "all" || phrase.tags.includes(selectedTag);
      const matchesTone = selectedTone === "all" || phrase.tone === selectedTone;
      return matchesQuery && matchesTag && matchesTone;
    });
  }, [query, selectedTag, selectedTone]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">句子库</h1>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索日文或中文"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          />
          <select
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          >
            <option value="all">全部场景</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <select
            value={selectedTone}
            onChange={(event) => setSelectedTone(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          >
            <option value="all">全部语气</option>
            {Object.entries(toneLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((phrase) => (
          <PhraseCard key={phrase.id} phrase={phrase} />
        ))}
      </div>
    </div>
  );
}
