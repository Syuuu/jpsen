import Link from "next/link";
import { Phrase } from "@/data/phrases";
import { TagChips } from "@/components/TagChips";

export function PhraseCard({ phrase }: { phrase: Phrase }) {
  return (
    <Link href={`/phrase/${phrase.id}`} className="card block hover:border-accent">
      <div className="space-y-2">
        <div className="text-lg font-semibold">{phrase.jp}</div>
        <div className="text-sm text-slate-600">{phrase.cn}</div>
        <TagChips tags={phrase.tags} tone={phrase.tone} />
      </div>
    </Link>
  );
}
