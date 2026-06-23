import React from "react";
import StatCard from "./StatCard";
import { useDashboardUserData } from "@/utils/lib/dashboard";
import { CheckCircle2, Coins, ListTodo, Loader2, Shield, Target, XCircle } from "lucide-react";

const TIER_STYLE: Record<string, string> = {
  Bronze: "text-amber-700 bg-amber-900/30 border-amber-700/30",
  Silver: "text-gray-300 bg-gray-700/30 border-gray-600/30",
  Gold: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Platinum: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
};

export default function TopStats({ id }: { id: string }) {
  const { user, loadingUser } = useDashboardUserData(undefined, id);

  if (loadingUser || !user) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex items-center justify-center h-24"
          >
            <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const completed = Number(user.totalTasksCompleted);
  const total = completed + Number(user.totalTasksFailed);
  const tier = user.tier ?? "Bronze";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* Reputation */}
      <StatCard
        accent
        icon={<Shield className="w-4 h-4 text-indigo-300" />}
        label="Reputation"
        value={Number(user.reputation).toLocaleString()}
        sub="Overall score"
        badge={
          <div className={["text-[10px] font-semibold rounded-full border px-2 py-0.5", TIER_STYLE[tier]].join(" ")}>
            {tier}
          </div>
        }
      />

      {/* Success Rate */}
      <StatCard
        icon={<Target className="w-4 h-4 text-emerald-400" />}
        label="Success Rate"
        value={`${user.successRate}%`}
        sub={
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {completed} of {total} completed
          </span>
        }
      />

      {/* Tasks Created */}
      <StatCard
        icon={<ListTodo className="w-4 h-4 text-blue-400" />}
        label="Tasks Created"
        value={Number(user.totalTasksCreated).toLocaleString()}
        sub="All time"
      />

      {/* Tasks Completed vs Failed */}
      <StatCard
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        label="Completed"
        value={completed.toLocaleString()}
        sub={
          <span className="flex items-center gap-1 text-red-400">
            <XCircle className="w-3 h-3" />
            {Number(user.totalTasksFailed)} failed
          </span>
        }
      />

      {/* Balance */}
      <StatCard
        icon={<Coins className="w-4 h-4 text-gray-400" />}
        label="Balance"
        value={<span className="font-mono">{user.formattedBalance} ETH</span>}
        sub={user.isRegistered ? "Registered user" : "Not registered"}
      />
    </div>
  );
}
