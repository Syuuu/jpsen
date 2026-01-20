"use client";

import { useMemo, useState } from "react";
import { phrases } from "@/data/phrases";

const extractKeyword = (text: string) => {
  const matches = text.match(/[一-龠ぁ-んァ-ン]{2,}/g);
  if (!matches || matches.length === 0) return text.slice(0, 3);
  return matches.sort((a, b) => b.length - a.length)[0];
};

export default function ClozePage() {
  const items = useMemo(() => phrases.slice(0, 12), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const current = items[index];
  const keyword = current ? extractKeyword(current.jp) : "";
  const masked = current ? current.jp.replace(keyword, "____") : "";

  const options = useMemo(() => {
    if (!current) return [];
    const pool = new Set(
      phrases.map((phrase) => extractKeyword(phrase.jp)).filter(Boolean)
    );
    pool.add(keyword);
    const shuffled = Array.from(pool).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4).includes(keyword)
      ? shuffled.slice(0, 4)
      : [keyword, ...shuffled.slice(0, 3)];
  }, [current, keyword]);

  const handleSelect = (choice: string) => {
    if (!current) return;
    setSelected(choice);
    if (choice === keyword) {
      setCorrectCount((prev) => prev + 1);
    }
    setTimeout(() => {
      setSelected(null);
      setIndex((prev) => Math.min(items.length, prev + 1));
    }, 700);
  };

  if (!current) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold">填空练习完成</h1>
        <p className="text-slate-600">
          正确 {correctCount} / {items.length}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">填空练习</h1>
        <p className="text-slate-600">
          选择正确的短语填空，强化记忆。
        </p>
        <p className="text-sm text-slate-500">
          进度 {index + 1} / {items.length}
        </p>
      </div>

      <div className="card space-y-4">
        <p className="text-xl font-semibold">{masked}</p>
        <p className="text-slate-600">{current.cn}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {options.map((option) => {
            const isCorrect = selected && option === keyword;
            const isWrong = selected === option && option !== keyword;
            return (
              <button
                key={option}
                className={`btn ${
                  isCorrect ? "btn-primary" : isWrong ? "border-rose-300 text-rose-500" : ""
                }`}
                onClick={() => handleSelect(option)}
                disabled={selected !== null}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
