import React from "react";

export default function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-white tracking-tight">{label}</h2>
    </div>
  );
}