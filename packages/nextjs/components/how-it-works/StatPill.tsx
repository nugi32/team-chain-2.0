import React from "react";

type StatPillProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
};

export default function StatPill({ icon, label, value, sub, accent = "border-gray-800 bg-gray-900" }: StatPillProps) {
  return (
    <div className={`rounded-2xl border p-5 ${accent}`}>
      <div className="flex items-center gap-2 mb-3 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}