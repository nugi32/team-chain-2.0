import { Info } from "lucide-react";

export default function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-xs font-medium text-gray-400">{children}</span>
      {hint && (
        <span className="group relative">
          <Info className="w-3 h-3 text-gray-700 cursor-help" />
          <span className="absolute left-5 top-0 z-20 w-44 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-[10px] text-gray-300 leading-snug opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {hint}
          </span>
        </span>
      )}
    </div>
  );
}
