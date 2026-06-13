import React from "react";

interface TextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export default function Textarea({ value, onChange, placeholder, rows = 3, maxLength }: TextareaProps) {
  return (
    <div className="relative rounded-xl border border-gray-800 bg-gray-900 focus-within:border-indigo-500/50 transition-colors">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full bg-transparent px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none resize-none"
      />
      {maxLength && (
        <span className="absolute bottom-2 right-3 text-[10px] text-gray-700">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}