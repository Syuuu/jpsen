import Link from "next/link";
import { Phrase } from "@/data/phrases";
import { TagChips } from "@/components/TagChips";

export function PhraseCard({
  phrase,
  showDialogue = false
}: {
  phrase: Phrase;
  showDialogue?: boolean;
}) {
  return (
    <Link href={`/phrase/${phrase.id}`} className="card block hover:border-accent">
      <div className="space-y-2">
        <div className="text-lg font-semibold">{phrase.jp}</div>
        <div className="text-sm text-slate-600">{phrase.cn}</div>
        {showDialogue && phrase.dialogue && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">场景对话</p>
            <p className="mt-2">A：{phrase.dialogue.a}</p>
            <p>B：{phrase.dialogue.b}</p>
          </div>
        )}
        <TagChips tags={phrase.tags} tone={phrase.tone} />
      </div>
    </Link>
  );
}
