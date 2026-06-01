import React from "react";
import {
  Clock,
  MessageSquare,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Deadline {
  id: string;
  project: string;
  risk: string;
  deadline: string;
}

interface RightSidebarProps {
  walletAddress: string;
  chain: string;
  availableBalance: number;
  activeStake: number;
  deadlines: Deadline[];
}

export default function RightSidebar({
  walletAddress,
  chain,
  availableBalance,
  activeStake,
  deadlines,
}: RightSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-300">
            {chain} Mainnet
          </span>
        </div>

<div className="font-mono text-sm text-indigo-300 mb-3 truncate">
  {walletAddress}
</div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
            <p className="text-gray-500 mb-1">Available</p>
            <p className="font-mono font-semibold">
              {availableBalance} ETH
            </p>
          </div>

          <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
            <p className="text-gray-500 mb-1">Staked</p>
            <p className="font-mono font-semibold">
              {activeStake} ETH
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <SectionHeading
          icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
          title="Upcoming Deadlines"
        />

        <div className="space-y-2">
          {deadlines.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={[
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    d.risk === "overdue"
                      ? "bg-red-400"
                      : d.risk === "at-risk"
                      ? "bg-amber-400"
                      : "bg-emerald-400",
                  ].join(" ")}
                />

                <span className="text-xs text-gray-300 truncate">
                  {d.project}
                </span>
              </div>

              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                {d.deadline}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}