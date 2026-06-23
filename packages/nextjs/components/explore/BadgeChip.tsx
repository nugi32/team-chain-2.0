"use client";

import React from "react";
import { Trophy } from "lucide-react";

export default function BadgeChip({ badge }: { badge: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-medium text-yellow-400">
      <Trophy className="w-2.5 h-2.5" />
      {badge}
    </span>
  );
}
