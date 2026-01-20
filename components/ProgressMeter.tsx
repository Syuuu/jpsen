export function ProgressMeter({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>今日 10 分钟</span>
        <span>
          已完成 {value} / {total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
