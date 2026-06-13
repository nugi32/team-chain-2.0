import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Milestone } from "./types";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  progress: number;
}

export default function MilestoneTracker({ milestones, progress }: MilestoneTrackerProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Milestone Progress</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-800" />
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 relative z-10">
                {m.done ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                ) : m.active ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <span className="text-[10px] text-gray-600 font-bold">{i + 1}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs leading-snug ${
                      m.done
                        ? "text-gray-500 line-through"
                        : m.active
                        ? "text-white font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {m.label}
                  </p>
                  <span
                    className={`text-[10px] font-semibold flex-shrink-0 ${
                      m.done ? "text-emerald-400" : m.active ? "text-indigo-400" : "text-gray-600"
                    }`}
                  >
                    {m.pct}%
                  </span>
                </div>
                {m.active && (
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-2 py-0.5">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall bar */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
          <span>Overall completion</span>
          <span className="font-semibold text-gray-300">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
      </div>
    </div>
  );
}