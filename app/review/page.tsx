"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DialogueAudioPlayer } from "@/components/DialogueAudioPlayer";
import { ProgressMeter } from "@/components/ProgressMeter";
import { SrsButtons } from "@/components/SrsButtons";
import { useSrs } from "@/hooks/useSrs";
import { useOpenedPhrases } from "@/hooks/useOpenedPhrases";
import { dailyReviewLimit } from "@/lib/srs";
import { phrases } from "@/data/phrases";

export default function ReviewPage() {
  const { srsMap, dueToday, setEase } = useSrs();
  const { opened } = useOpenedPhrases();
  const learnedPhrases = useMemo(() => {
    const phraseMap = new Map(phrases.map((phrase) => [phrase.id, phrase]));
    return opened
      .map((id) => phraseMap.get(id))
      .filter((phrase): phrase is (typeof phrases)[number] => Boolean(phrase));
  }, [opened]);
  const hasEnoughLearned = learnedPhrases.length >= dailyReviewLimit;
  const dueList = useMemo(
    () =>
      learnedPhrases
        .slice(-50)
        .sort((a, b) => {
          const aEntry = a ? srsMap[a.id] : undefined;
          const bEntry = b ? srsMap[b.id] : undefined;
          const easeDiff = (aEntry?.ease ?? 1) - (bEntry?.ease ?? 1);
          if (easeDiff !== 0) return easeDiff;
          return (aEntry?.lastReviewedAt ?? 0) - (bEntry?.lastReviewedAt ?? 0);
        })
        .slice(0, dailyReviewLimit),
    [learnedPhrases, srsMap]
  );
  const [index, setIndex] = useState(0);
  const completed = Math.min(index, dueList.length);

  const current = dueList[index];

  const handleSelect = (ease: 1 | 2 | 3) => {
    if (!current) return;
    setEase(current.id, ease);
    setIndex((prev) => prev + 1);
  };

  if (!hasEnoughLearned) {
    return (
      <div className="space-y-6">
        <div className="card space-y-3 text-center">
          <p className="text-lg font-semibold">请先学习</p>
          <p className="text-slate-600">
            学习句子不足 {dailyReviewLimit} 条，暂时无法进入复习。
          </p>
          <Link href="/library" className="btn btn-primary">
            去会话库学习
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h1 className="text-2xl font-semibold">今日复习</h1>
        <p className="text-slate-600">
          今日到期：{dueToday.length} 句。优先复习熟练度较低的内容。
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
          {current.dialogue ? (
            <DialogueAudioPlayer
              lines={[
                { label: "A", text: current.dialogue.a },
                { label: "B", text: current.dialogue.b }
              ]}
            />
          ) : (
            <AudioPlayer text={current.jp} />
          )}
          <SrsButtons onSelect={handleSelect} />
        </div>
      )}

      {!current && dueList.length > 0 && (
        <div className="card text-center">
          <p className="text-lg font-semibold">今日复习完成！</p>
          <p className="text-slate-600">完成 {completed} 句，保持节奏。</p>
          <Link href="/practice/shadowing" className="btn btn-primary">
            进入跟读
          </Link>
        </div>
      )}
    </div>
  );
}
