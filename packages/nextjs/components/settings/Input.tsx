import React from "react";

interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  maxLength?: number;
  type?: string;
}

export default function Input({
  value, onChange, placeholder, prefix, maxLength, type = "text",
}: InputProps) {
  return (
    <div className="flex items-center rounded-xl border border-gray-800 bg-gray-900 focus-within:border-indigo-500/50 transition-colors overflow-hidden">
      {prefix && (
        <span className="pl-3 text-xs text-gray-600 select-none flex-shrink-0">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="flex-1 bg-transparent px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none"
      />
      {maxLength && (
        <span className="pr-3 text-[10px] text-gray-700 flex-shrink-0">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}