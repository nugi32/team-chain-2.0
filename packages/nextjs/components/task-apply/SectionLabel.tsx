export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-indigo-500 rounded-full" />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{children}</span>
    </div>
  );
}
