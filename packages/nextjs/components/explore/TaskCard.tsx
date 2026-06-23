"use client";

import React from "react";
import SkillTag from "./SkillTag";
import StatPill from "./StatPill";
import { CompleteTaskOutput, TaskStatus } from "./types";
import { useDashboardUserData } from "@/utils/lib/dashboard/useDashboardUserData";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, CircleDot, DollarSign, Lock, Star, Tag, Trophy, User, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const TIER_BADGE: Record<string, string> = {
  Bronze: "bg-amber-900/40  border-amber-700/50  text-amber-400",
  Silver: "bg-slate-700/40  border-slate-500/50  text-slate-300",
  Gold: "bg-yellow-900/40 border-yellow-700/50 text-yellow-400",
  Platinum: "bg-cyan-900/40   border-cyan-600/50   text-cyan-400",
};

const STATUS_STYLE: Partial<Record<TaskStatus, string>> = {
  [TaskStatus.OpenRegistration]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [TaskStatus.Active]: "bg-sky-500/10     text-sky-400     border-sky-500/20",
  [TaskStatus.InProgres]: "bg-sky-500/10     text-sky-400     border-sky-500/20",
  [TaskStatus.Completed]: "bg-gray-700/30    text-gray-500    border-gray-700",
  [TaskStatus.Cancelled]: "bg-red-500/10     text-red-400     border-red-500/20",
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Safe ETH display — handles both number (from hook) and bigint (raw contract).
 */
const ethLabel = (wei: number | bigint | undefined): string => {
  if (wei === undefined || wei === null) return "N/A";
  const eth = Number(wei) / 1e18;
  if (eth === 0) return "0 ETH";
  if (eth < 0.0001) return "< 0.0001 ETH";
  return `${eth.toFixed(4)} ETH`;
};

/**
 * Safe timestamp → days until — handles bigint from raw contract data.
 */
const daysUntil = (ts: number | bigint | undefined): number => {
  const t = Number(ts ?? 0);
  if (!t) return 9999;
  return Math.max(0, Math.floor((t - Math.floor(Date.now() / 1000)) / 86400));
};

const deadlineLabel = (ts: number | bigint | undefined): string => {
  const d = daysUntil(ts);
  if (d === 9999) return "No deadline";
  if (d === 0) return "< 1 day";
  return `${d} day${d === 1 ? "" : "s"} left`;
};

const statusLabel = (s: TaskStatus): string => TaskStatus[s] ?? "Unknown";

const shortAddr = (addr?: string): string =>
  addr && addr !== ZERO_ADDRESS ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function TaskCard({
  task,
  onSelect,
  featured = false,
}: {
  task: CompleteTaskOutput;
  onSelect: (t: CompleteTaskOutput) => void;
  featured?: boolean;
}) {
  // Prefer on-chain creator address; fall back to Express owner
  const creatorAddr = task.creator && task.creator !== ZERO_ADDRESS ? task.creator : task.owner;

  // Always called unconditionally (Rules of Hooks)
  const { user: creator } = useDashboardUserData(creatorAddr);

  const days = daysUntil(task.deadlineAt);
  const isUrgent = days !== 9999 && days <= 3;
  const statusStyle = STATUS_STYLE[task.status] ?? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

  // Safe skills array — contract may not have this field
  const skills = task.skills ?? [];
  // Safe roles array
  const roles = task.roles ?? [];

  // deadlineHours is already in hours from contract
  const deadlineHours = task.deadlineHours ?? BigInt(0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(task)}
      className={`group relative cursor-pointer rounded-2xl border bg-gray-900
                transition-colors duration-200 overflow-hidden
                ${
                  featured
                    ? "border-indigo-500/40 hover:border-indigo-400/60 shadow-lg shadow-indigo-950/30"
                    : "border-gray-800 hover:border-gray-700"
                }`}
    >
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* ── ROW 1: Creator avatar + project title ─────────── */}
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {creator?.profilePicture ? (
              <img
                src={creator.profilePicture}
                alt={creator.name ?? "Creator"}
                className="w-9 h-9 rounded-xl object-cover border border-gray-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                {creator?.name ? (
                  <span className="text-[11px] font-bold text-white">{creator.name.slice(0, 2).toUpperCase()}</span>
                ) : (
                  <User className="w-4 h-4 text-white/70" />
                )}
              </div>
            )}

            {/* Tier badge corner */}
            {creator?.tier && (
              <span
                className={`absolute -bottom-1 -right-1 px-1 py-px rounded border text-[8px] font-bold uppercase leading-tight ${TIER_BADGE[creator.tier]}`}
              >
                {creator.tier[0]}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-100 leading-tight group-hover:text-white transition-colors truncate">
                {task.projectName || (task as any).title || `Task #${task.smartContractId}`}
              </h3>
              {isUrgent && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[9px] font-bold text-red-400 uppercase tracking-wide flex-shrink-0">
                  Urgent
                </span>
              )}
            </div>

            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              {creator?.name ? (
                <span className="text-gray-300">{creator.name}</span>
              ) : (
                <span className="font-mono">{shortAddr(creatorAddr)}</span>
              )}
              {task.objective && (
                <>
                  {" "}
                  · <span>{task.objective}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* ── Category + effort + status chips ─────────────── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-[10px] text-indigo-400">
              <Tag className="w-2.5 h-2.5" />
              {task.category}
            </span>
          )}
          {task.effort && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-[10px] text-gray-500">
              <Zap className="w-2.5 h-2.5" />
              {task.effort}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${statusStyle}`}>
            {statusLabel(task.status)}
          </span>
        </div>

        {/* ── Stat grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <StatPill
            icon={<Lock className="w-3 h-3" />}
            value={ethLabel(task.creatorStake)}
            label="stake"
            highlight="text-amber-400"
          />
          <StatPill
            icon={<DollarSign className="w-3 h-3" />}
            value={ethLabel(task.reward)}
            label="reward"
            highlight="text-emerald-400"
          />
          <StatPill
            icon={<Calendar className="w-3 h-3" />}
            value={`${Number(deadlineHours)}h`}
            label=""
            highlight={isUrgent ? "text-red-400" : "text-gray-200"}
          />
          <StatPill
            icon={<Star className="w-3 h-3" />}
            value={`${task.minReputation || "0"}+ REP`}
            label=""
            highlight="text-indigo-400"
          />
        </div>

        <div className="h-px bg-gray-800" />

        {/* ── Skills + CTA ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {skills.slice(0, 3).map(s => (
              <SkillTag key={s} skill={s} />
            ))}
            {skills.length > 3 && <span className="text-[10px] text-gray-600 self-center">+{skills.length - 3}</span>}
            {skills.length === 0 && <span className="text-[10px] text-gray-700 italic">No skills listed</span>}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={e => {
              e.stopPropagation();
              onSelect(task);
            }}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
          >
            View <ChevronRight className="w-3 h-3" />
          </motion.button>
        </div>

        {/* ── Creator trust row ─────────────────────────────── */}
        <div className="flex items-center gap-3 pt-0.5">
          {creator ? (
            <>
              <div className="flex items-center gap-1 text-[10px] text-gray-600">
                <Trophy className="w-3 h-3 text-amber-500/60" />
                <span>
                  Rep <span className="text-gray-400 font-medium">{Number(creator.reputation ?? 0).toString()}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600">
                <CircleDot className="w-3 h-3 text-emerald-500/60" />
                <span>
                  <span className="text-gray-400 font-medium">{creator.successRate ?? 0}%</span> success
                </span>
              </div>
              {Number(creator.totalTasksCompleted ?? 0) > 0 && (
                <span className="text-[10px] text-gray-600">
                  <span className="text-gray-400 font-medium">{Number(creator.totalTasksCompleted).toString()}</span>{" "}
                  done
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-gray-600 font-mono">{shortAddr(creatorAddr) || "Unknown creator"}</span>
          )}

          {roles.length > 0 && (
            <div className="ml-auto">
              <span className="text-[9px] uppercase tracking-wide font-medium text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                {roles[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
