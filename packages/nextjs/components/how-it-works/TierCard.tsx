import React from "react";
import { CheckCircle2 } from "lucide-react";

interface Tier {
  name: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  rep: string;
  stake: string;
  tasks: string;
  perks: string[];
  icon: React.ReactNode;
}

export default function TierCard({ tier }: { tier: Tier }) {
  return (
    <div className={`rounded-2xl border p-5 ${tier.bg} ${tier.border}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${tier.dot}`} />
        <span className={`text-sm font-bold ${tier.color}`}>{tier.name}</span>
      </div>
      <div className="space-y-2 text-xs mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Rep Range</span>
          <span className="text-gray-300 font-mono">{tier.rep}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Max Stake</span>
          <span className="text-gray-300">{tier.stake}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Task Level</span>
          <span className="text-gray-300">{tier.tasks}</span>
        </div>
      </div>
      <div className="border-t border-gray-800/60 pt-3 space-y-1.5">
        {tier.perks.map(p => (
          <div key={p} className="flex items-start gap-2 text-[11px] text-gray-400">
            <CheckCircle2 className={`w-3 h-3 flex-shrink-0 mt-0.5 ${tier.color}`} />
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
