import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Submission } from "./types";

interface Milestone {
  id: number;
  label: string;
  pct: number;
  status: string;
}

interface MilestoneOverviewProps {
  milestones: Milestone[];
  submissions: Submission[];
}

export default function MilestoneOverview({ milestones, submissions }: MilestoneOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Milestone Overview</h2>
        <div className="relative">
          <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-800" />
          <div className="space-y-4">
            {milestones.map((m, i) => {
              const isDone = m.status === "done";
              const isActive = m.status === "active";
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="relative z-10 flex-shrink-0">
                    {isDone ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-indigo-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <span className="text-[10px] text-gray-600 font-bold">{i + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1.5 border-b border-gray-800/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${isDone ? "text-gray-500" : isActive ? "text-white" : "text-gray-500"}`}>
                        M{i + 1}: {m.label}
                      </p>
                      <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${
                        isDone ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                        isActive ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" :
                        "text-gray-600 border-gray-700 bg-gray-800"
                      }`}>
                        {isDone ? "Completed" : isActive ? "Active" : "Locked"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-gray-600">{m.pct}% of total reward</span>
                      {isActive && (
                        <span className="text-[10px] text-indigo-400">
                          {submissions.filter(s => s.milestone === i).length} submission(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reward breakdown */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Reward Breakdown</h2>
        <div className="space-y-2">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">M{i + 1}</span>
                  <span className="text-gray-400">{((120 * m.pct) / 100)} USDC</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.status === "done" ? "bg-emerald-500" : m.status === "active" ? "bg-indigo-500" : "bg-gray-700"}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
              <span className={`text-[10px] font-semibold w-16 text-right ${m.status === "done" ? "text-emerald-400" : m.status === "active" ? "text-indigo-400" : "text-gray-600"}`}>
                {m.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}