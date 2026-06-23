import React from "react";

export default function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-600">{hint}</p>}
    </div>
  );
}
