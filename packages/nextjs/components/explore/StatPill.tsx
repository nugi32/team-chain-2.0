import React from "react";

interface StatPillProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  highlight?: string;
}

export default function StatPill({ icon, value, label, highlight }: StatPillProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500">{icon}</span>
      <span className={`text-xs font-semibold ${highlight ?? "text-gray-200"}`}>{value}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}