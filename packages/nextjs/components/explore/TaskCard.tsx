import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Lock, DollarSign, Calendar, Star, Users, Trophy, CircleDot } from "lucide-react";
import { Task } from "./types";
import BadgeChip from "./BadgeChip";
import SkillTag from "./SkillTag";
import StatPill from "./StatPill";

const teamAvatarColors: Record<string, string> = {
  GC: "from-indigo-600 to-violet-600",
  ZL: "from-emerald-600 to-teal-600",
  PM: "from-rose-600 to-pink-600",
  BN: "from-amber-600 to-orange-600",
  VD: "from-sky-600 to-blue-600",
  MW: "from-red-600 to-rose-600",
  OD: "from-purple-600 to-violet-600",
};

export default function TaskCard({
  task,
  onSelect,
  featured,
}: {
  task: Task;
  onSelect: (t: Task) => void;
  featured?: boolean;
}) {
  const isUrgent = task.deadlineDays <= 3;
  const isFull = task.applicants >= task.slots;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(task)}
      className={`group relative cursor-pointer rounded-2xl border bg-gray-900 transition-colors duration-200 overflow-hidden
        ${featured
          ? "border-indigo-500/40 hover:border-indigo-400/60 shadow-lg shadow-indigo-950/30"
          : "border-gray-800 hover:border-gray-700"
        }`}
    >
      {/* top accent bar */}
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Row 1: avatar + title + badges */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${teamAvatarColors[task.teamAvatar] ?? "from-gray-600 to-gray-700"} flex items-center justify-center flex-shrink-0`}>
            <span className="text-[11px] font-bold text-white">{task.teamAvatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-100 leading-tight group-hover:text-white transition-colors truncate">
                {task.title}
              </h3>
              {isUrgent && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[9px] font-bold text-red-400 uppercase tracking-wide flex-shrink-0">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              <span className="text-indigo-400">{task.project}</span> · {task.objective}
            </p>
          </div>
        </div>

        {/* Risk badges */}
        <div className="flex flex-wrap gap-1.5">
          {task.badges.map(b => <BadgeChip key={b} badge={b} />)}
        </div>

        {/* Row 2: metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <StatPill icon={<Lock className="w-3 h-3" />} value={`${task.stake} ETH`} label="stake" highlight="text-amber-400" />
          <StatPill icon={<DollarSign className="w-3 h-3" />} value={`${task.reward} ETH`} label="reward" highlight="text-emerald-400" />
          <StatPill icon={<Calendar className="w-3 h-3" />} value={task.deadline} label="" highlight={isUrgent ? "text-red-400" : "text-gray-200"} />
          <StatPill icon={<Star className="w-3 h-3" />} value={`${task.requiredRep}+ REP`} label="" highlight="text-indigo-400" />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800" />

        {/* Row 3: skills + slots + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {task.skills.slice(0, 3).map(s => <SkillTag key={s} skill={s} />)}
            {task.skills.length > 3 && (
              <span className="text-[10px] text-gray-600 self-center">+{task.skills.length - 3}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-medium ${isFull ? "text-red-400" : "text-gray-500"}`}>
              <Users className="w-3 h-3 inline mr-1" />
              {task.applicants}/{task.slots}
            </span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={e => { e.stopPropagation(); onSelect(task); }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              View <ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
        </div>

        {/* Team trust row */}
        <div className="flex items-center gap-3 pt-0.5">
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
            <Trophy className="w-3 h-3 text-amber-500/60" />
            <span>Team rep <span className="text-gray-400 font-medium">{task.teamRep}</span></span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
            <CircleDot className="w-3 h-3 text-emerald-500/60" />
            <span><span className="text-gray-400 font-medium">{task.teamCompletions}</span> completions</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
            <span className="text-[9px] uppercase tracking-wide font-medium text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
              {task.role}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}