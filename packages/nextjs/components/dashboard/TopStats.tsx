import React from "react";
import {
  Shield,
  Lock,
  Target,
  Award,
  Coins,
  ArrowUpRight,
  CheckCircle2,
  Gift,
} from "lucide-react";
import StatCard from "./StatCard";

const TIER_STYLE: Record<string, string> = {
  Bronze: "text-amber-700 bg-amber-900/30 border-amber-700/30",
  Silver: "text-gray-300 bg-gray-700/30 border-gray-600/30",
  Gold: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Platinum: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
};

interface UserStats {
  tier?: string;
  reputationScore: number;
  reputationDelta: number;
  activeStake: number;
  stakeUSD: number;
  successRate: number;
  rank: number;
  availableBalance: number;
  pendingRewards: number;
}

export default function TopStats({ user }: { user: UserStats }) {
  const tier = user.tier ?? "Bronze";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <StatCard
        accent
        icon={<Shield className="w-4.5 h-4.5 text-indigo-300" />}
        label="Reputation Score"
        value={
          <span className="flex items-baseline gap-1.5">
            {user.reputationScore}
            <span className="text-xs font-normal text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />+{user.reputationDelta}
            </span>
          </span>
        }
        sub="Top 8% this month"
        badge={
          <div
            className={[
              "text-[10px] font-semibold rounded-full border px-2 py-0.5",
              TIER_STYLE[tier],
            ].join(" ")}
          >
            {tier}
          </div>
        }
      />

      <StatCard
        icon={<Lock className="w-4 h-4 text-amber-400" />}
        label="Active Stake Locked"
        value={<span className="font-mono">{user.activeStake} ETH</span>}
        sub={`$${user.stakeUSD.toLocaleString()} USD`}
      />

      <StatCard
        icon={<Target className="w-4 h-4 text-emerald-400" />}
        label="Success Rate"
        value={`${user.successRate}%`}
        sub={
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            47 of 50 completed
          </span>
        }
      />

      <StatCard
        icon={<Award className="w-4 h-4 text-yellow-400" />}
        label="Global Rank"
        value={`#${user.rank}`}
        sub="Top contributor this week"
      />

      <StatCard
        icon={<Coins className="w-4 h-4 text-gray-400" />}
        label="Available Balance"
        value={<span className="font-mono">{user.availableBalance} ETH</span>}
        sub={
          <span className="flex items-center gap-1 text-emerald-400">
            <Gift className="w-3 h-3" />
            +{user.pendingRewards} ETH pending
          </span>
        }
      />
    </div>
  );
}