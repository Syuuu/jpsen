const toneLabel: Record<string, string> = {
  casual: "随意",
  polite: "礼貌",
  soft: "柔和"
};

export function TagChips({ tags, tone }: { tags: string[]; tone?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tone && <span className="chip">语气：{toneLabel[tone]}</span>}
      {tags.map((tag) => (
        <span key={tag} className="chip">
          {tag}
        </span>
      ))}
    </div>
  );
}
