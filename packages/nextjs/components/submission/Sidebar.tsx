import React from "react";
import MilestoneTracker from "./MilestoneTracker";
import type { Milestone, Reviewer, Transaction } from "./types";
import { CircleDot, ExternalLink, Star } from "lucide-react";

interface SidebarProps {
  milestones: Milestone[];
  progress: number;
  stakeAmount: number;
  rewardAmount: number;
  reviewers: Reviewer[];
  txHistory: Transaction[];
  requiredDocs: string[];
}

export default function Sidebar({
  milestones,
  progress,
  stakeAmount,
  rewardAmount,
  reviewers,
  txHistory,
  requiredDocs,
}: SidebarProps) {
  return (
    <div className="space-y-4">
      <MilestoneTracker milestones={milestones} progress={progress} />

      {/* Economic State */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Economic State</p>
        {[
          ["Stake locked", `${stakeAmount} USDC`, "text-white"],
          ["M1 reward earned", "+36 USDC", "text-emerald-400"],
          ["M2 reward (pending)", "+48 USDC", "text-gray-500"],
          ["Remaining reward", "+36 USDC", "text-gray-500"],
        ].map(([k, v, c]) => (
          <div key={k as string} className="flex justify-between text-xs">
            <span className="text-gray-500">{k}</span>
            <span className={`font-semibold ${c}`}>{v}</span>
          </div>
        ))}
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-xs">
          <span className="text-gray-400 font-medium">Net if all complete</span>
          <span className="text-emerald-400 font-bold">+80 USDC</span>
        </div>
      </div>

      {/* Reviewers */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Assigned Reviewers</p>
        <div className="space-y-3">
          {reviewers.map(r => (
            <div key={r.name} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                {r.avatar}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-200">{r.name}</p>
                <p className="text-[10px] text-gray-500">{r.status}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-gray-400">{r.rep}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* On-chain transactions */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">On-chain History</p>
        <div className="space-y-3">
          {txHistory.map((tx, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-300">{tx.event}</p>
                  <span
                    className={`text-[10px] font-semibold flex-shrink-0 ${
                      tx.amount.startsWith("+") ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-600">{tx.time}</span>
                  <span className="text-gray-700">·</span>
                  <button className="text-[10px] text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-0.5">
                    {tx.hash}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission checklist */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Submission Checklist</p>
        <div className="space-y-2">
          {requiredDocs.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <CircleDot className="w-3 h-3 text-gray-600 flex-shrink-0" />
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
