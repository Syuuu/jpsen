import { EaseLevel } from "@/lib/srs";

const labels: Record<EaseLevel, string> = {
  1: "不熟",
  2: "还行",
  3: "很熟"
};

export function SrsButtons({ onSelect }: { onSelect: (ease: EaseLevel) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.keys(labels) as unknown as EaseLevel[]).map((ease) => (
        <button
          key={ease}
          className={`btn ${ease === 3 ? "btn-primary" : ""}`}
          onClick={() => onSelect(ease)}
        >
          {labels[ease]}
        </button>
      ))}
    </div>
  );
}
