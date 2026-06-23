import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
  badge?: React.ReactNode;
}

export default function StatCard({ icon, label, value, sub, accent = false, badge }: StatCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 flex flex-col gap-3 relative",
        accent ? "border-indigo-500/30 bg-indigo-500/5" : "border-gray-800 bg-gray-900",
      ].join(" ")}
    >
      {badge && <div className="absolute top-3 right-3">{badge}</div>}
      <div
        className={[
          "w-9 h-9 rounded-xl flex items-center justify-center",
          accent ? "bg-indigo-500/20" : "bg-gray-800",
        ].join(" ")}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="text-xl font-bold text-white leading-tight">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}
