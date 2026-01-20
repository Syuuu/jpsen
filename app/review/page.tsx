"use client";

import { useMemo, useState } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ProgressMeter } from "@/components/ProgressMeter";
import { SrsButtons } from "@/components/SrsButtons";
import { useSrs } from "@/hooks/useSrs";
import { getDuePhrases } from "@/lib/srs";

export default function ReviewPage() {
  const { srsMap, dueToday, setEase } = useSrs();
  const dueList = useMemo(() => getDuePhrases(srsMap), [srsMap]);
  const [index, setIndex] = useState(0);
  const completed = Math.min(index, dueList.length);

  const current = dueList[index];

  const handleSelect = (ease: 1 | 2 | 3) => {
    if (!current) return;
    setEase(current.id, ease);
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h1 className="text-2xl font-semibold">今日复习</h1>
        <p className="text-slate-600">
          今日到期：{dueToday.length} 句。按顺序复习并标记熟练度。
        </p>
        <ProgressMeter value={completed} total={dueList.length} />
      </div>

      {dueList.length === 0 && (
        <div className="card text-center text-slate-600">
          今天没有到期句子，去句子库挑一些加入收藏吧。
        </div>
      )}

      {current && (
        <div className="card space-y-4">
          <div>
            <p className="text-xl font-semibold">{current.jp}</p>
            <p className="text-slate-600">{current.cn}</p>
          </div>
          <AudioPlayer text={current.jp} />
          <SrsButtons onSelect={handleSelect} />
        </div>
      )}

      {!current && dueList.length > 0 && (
        <div className="card text-center">
          <p className="text-lg font-semibold">今日复习完成！</p>
          <p className="text-slate-600">完成 {completed} 句，保持节奏。</p>
        </div>
      )}
    </div>
  );
}
