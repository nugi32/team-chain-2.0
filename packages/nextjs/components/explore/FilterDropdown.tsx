import React, { useRef, useEffect } from "react";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClose: () => void;
}

export default function FilterDropdown({ label, options, selected, onToggle, onClose }: FilterDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-800">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      </div>
      <div className="py-1 max-h-52 overflow-y-auto">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 transition-colors text-left"
          >
            <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected.includes(opt) ? "bg-indigo-600 border-indigo-600" : "border-gray-700"}`}>
              {selected.includes(opt) && <span className="w-1.5 h-1.5 rounded-sm bg-white" />}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}