import React from "react";
import { ToggleRight, ToggleLeft } from "lucide-react";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}

export default function Toggle({ value, onChange, label, desc }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-start justify-between gap-4 w-full text-left py-3 border-b border-gray-800/60 last:border-0"
    >
      <div>
        <p className="text-xs font-medium text-gray-300">{label}</p>
        {desc && <p className="text-[11px] text-gray-600 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0 mt-0.5">
        {value ? (
          <ToggleRight className="w-5 h-5 text-indigo-400" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-600" />
        )}
      </div>
    </button>
  );
}