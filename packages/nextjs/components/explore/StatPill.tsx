"use client";

import React from "react";

interface StatPillProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight: string;
}

export default function StatPill({ icon, value, label, highlight }: StatPillProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-gray-600">{icon}</span>
      <span className={`font-semibold tabular-nums ${highlight}`}>{value}</span>
      {label && <span className="text-gray-600">{label}</span>}
    </div>
  );
}
