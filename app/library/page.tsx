"use client";

import { useEffect, useMemo, useState } from "react";
import { PhraseCard } from "@/components/PhraseCard";
import { allTags, phrases, PhraseTone } from "@/data/phrases";

const toneLabels: Record<PhraseTone, string> = {
  casual: "随意",
  polite: "礼貌",
  soft: "柔和"
};

const pageSize = 12;

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedTone, setSelectedTone] = useState("all");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [query, selectedTag, selectedTone]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

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
        {pageItems.map((phrase) => (
          <PhraseCard key={phrase.id} phrase={phrase} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-500">
          第 {page} / {totalPages} 页，共 {filtered.length} 条
        </span>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            上一页
          </button>
          <button
            className="btn"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
