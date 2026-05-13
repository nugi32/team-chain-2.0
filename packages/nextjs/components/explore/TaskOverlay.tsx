import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CircleDot, Lock, DollarSign, Clock, Calendar,
  Trophy, ExternalLink, Zap, ArrowRight,
} from "lucide-react";
import { Task } from "./types";
import BadgeChip from "./BadgeChip";
import SkillTag from "./SkillTag";

const teamAvatarColors: Record<string, string> = {
  GC: "from-indigo-600 to-violet-600",
  ZL: "from-emerald-600 to-teal-600",
  PM: "from-rose-600 to-pink-600",
  BN: "from-amber-600 to-orange-600",
  VD: "from-sky-600 to-blue-600",
  MW: "from-red-600 to-rose-600",
  OD: "from-purple-600 to-violet-600",
};

export default function TaskOverlay({ task, onClose }: { task: Task | null; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* panel */}
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 h-full w-full max-w-[460px] bg-gray-950 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
          >
            {/* header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-800">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${teamAvatarColors[task.teamAvatar] ?? "from-gray-600 to-gray-700"} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{task.teamAvatar}</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-100 leading-tight">{task.title}</h2>
                  <p className="text-xs text-indigo-400 mt-0.5">{task.project}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors mt-0.5 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* badges */}
              <div className="flex flex-wrap gap-2">
                {task.badges.map(b => <BadgeChip key={b} badge={b} />)}
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium
                  ${task.status === "open" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-800 text-gray-500 border-gray-700"}`}>
                  <CircleDot className="w-2.5 h-2.5" /> {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>

              {/* description */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">Task Description</p>
                <p className="text-sm text-gray-400 leading-relaxed">{task.description}</p>
              </div>

              {/* commitment grid */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">Commitment Terms</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Lock className="w-3.5 h-3.5 text-amber-400" />, label: "Stake Required", value: `${task.stake} ETH`, color: "text-amber-400" },
                    { icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />, label: "Reward", value: `${task.reward} ETH`, color: "text-emerald-400" },
                    { icon: <Clock className="w-3.5 h-3.5 text-indigo-400" />, label: "Estimated Effort", value: task.effort, color: "text-gray-200" },
                    { icon: <Calendar className="w-3.5 h-3.5 text-red-400" />, label: "Deadline", value: task.deadline, color: task.deadlineDays <= 3 ? "text-red-400" : "text-gray-200" },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-900 rounded-xl border border-gray-800 p-3">
                      <div className="flex items-center gap-1.5 mb-1">{item.icon}<span className="text-[10px] text-gray-500">{item.label}</span></div>
                      <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* access */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">Access Requirements</p>
                <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-gray-500">Required Reputation</span>
                    <span className="text-xs font-semibold text-indigo-400">{task.requiredRep}+ REP</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-gray-500">Role</span>
                    <span className="text-xs font-semibold text-gray-200">{task.role}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-gray-500">Open Slots</span>
                    <span className={`text-xs font-semibold ${task.applicants >= task.slots ? "text-red-400" : "text-emerald-400"}`}>
                      {task.slots - task.applicants} / {task.slots} available
                    </span>
                  </div>
                </div>
              </div>

              {/* skills */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {task.skills.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              </div>

              {/* team trust */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">Team Track Record</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-100">{task.teamRep}</p>
                      <p className="text-[10px] text-gray-500">Team Rep</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                    <CircleDot className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-100">{task.teamCompletions}</p>
                      <p className="text-[10px] text-gray-500">Completions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* fixed footer actions */}
            <div className="px-6 py-4 border-t border-gray-800 space-y-2.5">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Apply <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Stake & Join
                </motion.button>
              </div>
              <button className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Details
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}