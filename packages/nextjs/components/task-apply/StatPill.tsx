import React from "react";

interface StatPillProps {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}

export default function StatPill({ icon: Icon, label, value, accent = false }: StatPillProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${
        accent
          ? "border-indigo-500/30 bg-indigo-500/10"
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <Icon className={`w-4 h-4 ${accent ? "text-indigo-400" : "text-gray-400"}`} />
      <div>
        <p className="text-[10px] text-gray-500 leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${accent ? "text-indigo-300" : "text-white"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}