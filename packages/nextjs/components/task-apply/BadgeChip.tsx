export default function BadgeChip({ badge }: { badge: string }) {
  return (
    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
      {badge}
    </span>
  );
}