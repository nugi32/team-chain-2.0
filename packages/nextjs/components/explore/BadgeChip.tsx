import React from "react";
import { Shield, BadgeCheck, Zap, Target, Sparkles, AlertTriangle } from "lucide-react";
import { RiskBadge } from "./types";

const badgeConfig: Record<RiskBadge, { color: string; icon: React.ReactNode }> = {
  "Low Risk":     { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <Shield className="w-2.5 h-2.5" /> },
  "Verified Team":{ color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",   icon: <BadgeCheck className="w-2.5 h-2.5" /> },
  "High Stake":   { color: "bg-amber-500/15 text-amber-400 border-amber-500/20",       icon: <Zap className="w-2.5 h-2.5" /> },
  "Fast Review":  { color: "bg-sky-500/15 text-sky-400 border-sky-500/20",             icon: <Target className="w-2.5 h-2.5" /> },
  "New Team":     { color: "bg-purple-500/15 text-purple-400 border-purple-500/20",    icon: <Sparkles className="w-2.5 h-2.5" /> },
  "Urgent":       { color: "bg-red-500/15 text-red-400 border-red-500/20",             icon: <AlertTriangle className="w-2.5 h-2.5" /> },
};

export default function BadgeChip({ badge }: { badge: RiskBadge }) {
  const cfg = badgeConfig[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}{badge}
    </span>
  );
}