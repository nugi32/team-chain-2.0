interface MilestoneRowProps {
  label: string;
  pct: number;
  idx: number;
}

export default function MilestoneRow({ label, pct, idx }: MilestoneRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-800/60 last:border-0">
      <div className="w-5 h-5 rounded-full border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[9px] font-bold text-indigo-400">{idx + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 leading-snug">{label}</p>
      </div>
      <span className="text-[10px] font-semibold text-indigo-400 flex-shrink-0">{pct}%</span>
    </div>
  );
}
