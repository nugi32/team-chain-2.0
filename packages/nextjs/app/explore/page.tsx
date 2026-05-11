"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, ChevronDown, X, Star,
  Clock, Zap, Shield, Users, TrendingUp, AlertTriangle,
  Flame, BadgeCheck, ArrowRight, Layers, Lock,
  DollarSign, Calendar, Target, ChevronRight, ExternalLink,
  Filter, ArrowUpDown, Sparkles, CircleDot, Trophy,
} from "lucide-react";

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
type RiskBadge = "Low Risk" | "Verified Team" | "High Stake" | "Fast Review" | "New Team" | "Urgent";
type TaskStatus = "open" | "review" | "filled";
type SortKey = "newest" | "highest_reward" | "urgent" | "low_rep";

interface Task {
  id: string;
  title: string;
  project: string;
  teamAvatar: string;
  objective: string;
  stake: number;
  reward: number;
  effort: string;
  deadline: string;
  deadlineDays: number;
  requiredRep: number;
  role: string;
  skills: string[];
  applicants: number;
  slots: number;
  teamRep: number;
  teamCompletions: number;
  badges: RiskBadge[];
  status: TaskStatus;
  category: string;
  description: string;
  featured?: boolean;
}

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────
const TASKS: Task[] = [
  {
    id: "t1", title: "Frontend Milestone for DAO Portal",
    project: "GovChain DAO", teamAvatar: "GC",
    objective: "Build wallet connection and multi-sig transaction UI.",
    stake: 40, reward: 120, effort: "~40h", deadline: "5 days", deadlineDays: 5,
    requiredRep: 72, role: "Frontend Dev", skills: ["React", "Ethers.js", "Tailwind"],
    applicants: 3, slots: 1, teamRep: 91, teamCompletions: 47,
    badges: ["Verified Team", "Fast Review"], status: "open",
    category: "Frontend", featured: true,
    description: "We need an experienced frontend developer to implement the wallet connect flow and multi-sig transaction dashboard for the GovChain DAO portal. This includes integrating RainbowKit, displaying transaction queues, and handling signature states across multiple signers.",
  },
  {
    id: "t2", title: "ZK Proof Verifier Smart Contract",
    project: "ZeroLayer Protocol", teamAvatar: "ZL",
    objective: "Write and audit on-chain ZK proof verification logic.",
    stake: 120, reward: 380, effort: "~80h", deadline: "12 days", deadlineDays: 12,
    requiredRep: 88, role: "Smart Contract Dev", skills: ["Solidity", "ZK-SNARKs", "Foundry"],
    applicants: 1, slots: 1, teamRep: 97, teamCompletions: 23,
    badges: ["High Stake", "Verified Team"], status: "open",
    category: "Smart Contracts", featured: true,
    description: "ZeroLayer is building a privacy-first layer-2 rollup and needs a Solidity engineer to implement the on-chain verifier contract for Groth16 proofs. You'll work directly with our cryptography team and review the verification gas costs.",
  },
  {
    id: "t3", title: "Subgraph Indexer for NFT Marketplace",
    project: "Pixelform Market", teamAvatar: "PM",
    objective: "Index trades, bids, and royalty events via The Graph.",
    stake: 20, reward: 60, effort: "~20h", deadline: "3 days", deadlineDays: 3,
    requiredRep: 45, role: "Indexer / Backend", skills: ["GraphQL", "AssemblyScript", "IPFS"],
    applicants: 6, slots: 2, teamRep: 74, teamCompletions: 12,
    badges: ["Low Risk", "Urgent"], status: "open",
    category: "Backend",
    description: "Pixelform needs a subgraph developer to build indexing schemas for NFT trades, bid events, and ERC-2981 royalty splits. The existing subgraph needs to be refactored for efficiency and extended with new event handlers.",
  },
  {
    id: "t4", title: "Cross-Chain Bridge UI Audit",
    project: "BridgeNet Labs", teamAvatar: "BN",
    objective: "Audit UX flow and write a security risk report for the bridge.",
    stake: 60, reward: 200, effort: "~60h", deadline: "8 days", deadlineDays: 8,
    requiredRep: 80, role: "Security Reviewer", skills: ["Auditing", "Figma", "Web3 UX"],
    applicants: 2, slots: 1, teamRep: 85, teamCompletions: 31,
    badges: ["Fast Review", "High Stake"], status: "open",
    category: "Security",
    description: "BridgeNet Labs is preparing a public mainnet launch and needs an experienced auditor to review the bridge UI for security anti-patterns, misleading UX flows, phishing risk, and transaction clarity issues.",
  },
  {
    id: "t5", title: "Token Vesting Dashboard",
    project: "VestDAO", teamAvatar: "VD",
    objective: "Build interactive vesting schedule and cliff visualizer.",
    stake: 15, reward: 45, effort: "~18h", deadline: "7 days", deadlineDays: 7,
    requiredRep: 30, role: "Frontend Dev", skills: ["React", "Recharts", "Wagmi"],
    applicants: 9, slots: 3, teamRep: 62, teamCompletions: 7,
    badges: ["New Team", "Low Risk"], status: "open",
    category: "Frontend",
    description: "VestDAO is launching their token and needs a clean vesting dashboard where token holders can view their cliff dates, unlock schedules, and claim amounts. Responsive design required.",
  },
  {
    id: "t6", title: "MEV Bot Detection Module",
    project: "MemPool Watch", teamAvatar: "MW",
    objective: "Build real-time sandwich attack detection for the mempool monitor.",
    stake: 90, reward: 270, effort: "~70h", deadline: "14 days", deadlineDays: 14,
    requiredRep: 85, role: "Backend / Blockchain Dev", skills: ["Rust", "Go", "Ethereum RPC"],
    applicants: 0, slots: 1, teamRep: 93, teamCompletions: 19,
    badges: ["Verified Team", "High Stake"], status: "open",
    category: "Backend",
    description: "MemPool Watch is extending its monitoring suite with a real-time MEV detection engine. You'll build heuristics for sandwich attack identification using mempool data streams and integrate them into an alerting pipeline.",
  },
  {
    id: "t7", title: "Governance Proposal UI",
    project: "GovChain DAO", teamAvatar: "GC",
    objective: "Create proposal creation, voting, and result display screens.",
    stake: 35, reward: 100, effort: "~30h", deadline: "6 days", deadlineDays: 6,
    requiredRep: 55, role: "Frontend Dev", skills: ["Next.js", "Ethers.js", "Radix UI"],
    applicants: 4, slots: 1, teamRep: 91, teamCompletions: 47,
    badges: ["Verified Team", "Fast Review"], status: "open",
    category: "Frontend",
    description: "Second milestone for GovChain DAO — implement the governance proposal flow including rich text editor for proposals, on-chain voting with delegation support, quorum tracking, and result visualization.",
  },
  {
    id: "t8", title: "Smart Contract Gas Optimizer",
    project: "OptimizeDAO", teamAvatar: "OD",
    objective: "Reduce gas costs on staking contract by at least 20%.",
    stake: 50, reward: 150, effort: "~45h", deadline: "10 days", deadlineDays: 10,
    requiredRep: 75, role: "Smart Contract Dev", skills: ["Solidity", "Hardhat", "Gas Profiling"],
    applicants: 2, slots: 1, teamRep: 78, teamCompletions: 15,
    badges: ["Low Risk", "Fast Review"], status: "open",
    category: "Smart Contracts",
    description: "OptimizeDAO's staking contract is functional but expensive. We need a Solidity specialist to profile gas usage, apply packing strategies, remove redundant storage reads, and document all optimizations with before/after benchmarks.",
  },
];

const SKILL_OPTIONS = ["React", "Solidity", "Rust", "Go", "GraphQL", "TypeScript", "Figma", "ZK-SNARKs", "Ethers.js", "Next.js"];
const CATEGORY_OPTIONS = ["Frontend", "Smart Contracts", "Backend", "Security", "Design"];
const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: "newest", label: "Newest", icon: <Clock className="w-3.5 h-3.5" /> },
  { key: "highest_reward", label: "Highest Reward", icon: <DollarSign className="w-3.5 h-3.5" /> },
  { key: "urgent", label: "Urgent", icon: <Flame className="w-3.5 h-3.5" /> },
  { key: "low_rep", label: "Low Rep Barrier", icon: <TrendingUp className="w-3.5 h-3.5" /> },
];

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const badgeConfig: Record<RiskBadge, { color: string; icon: React.ReactNode }> = {
  "Low Risk":     { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <Shield className="w-2.5 h-2.5" /> },
  "Verified Team":{ color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",   icon: <BadgeCheck className="w-2.5 h-2.5" /> },
  "High Stake":   { color: "bg-amber-500/15 text-amber-400 border-amber-500/20",       icon: <Zap className="w-2.5 h-2.5" /> },
  "Fast Review":  { color: "bg-sky-500/15 text-sky-400 border-sky-500/20",             icon: <Target className="w-2.5 h-2.5" /> },
  "New Team":     { color: "bg-purple-500/15 text-purple-400 border-purple-500/20",    icon: <Sparkles className="w-2.5 h-2.5" /> },
  "Urgent":       { color: "bg-red-500/15 text-red-400 border-red-500/20",             icon: <AlertTriangle className="w-2.5 h-2.5" /> },
};

const teamAvatarColors: Record<string, string> = {
  GC: "from-indigo-600 to-violet-600",
  ZL: "from-emerald-600 to-teal-600",
  PM: "from-rose-600 to-pink-600",
  BN: "from-amber-600 to-orange-600",
  VD: "from-sky-600 to-blue-600",
  MW: "from-red-600 to-rose-600",
  OD: "from-purple-600 to-violet-600",
};

function sortTasks(tasks: Task[], sort: SortKey): Task[] {
  return [...tasks].sort((a, b) => {
    if (sort === "highest_reward") return b.reward - a.reward;
    if (sort === "urgent") return a.deadlineDays - b.deadlineDays;
    if (sort === "low_rep") return a.requiredRep - b.requiredRep;
    return 0; // newest — preserve insert order
  });
}

// ─────────────────────────────────────────────
//  BADGE CHIP
// ─────────────────────────────────────────────
function BadgeChip({ badge }: { badge: RiskBadge }) {
  const cfg = badgeConfig[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}{badge}
    </span>
  );
}

// ─────────────────────────────────────────────
//  SKILL TAG
// ─────────────────────────────────────────────
function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700/60 text-[10px] text-gray-400 font-mono">
      {skill}
    </span>
  );
}

// ─────────────────────────────────────────────
//  STAT PILL
// ─────────────────────────────────────────────
function StatPill({ icon, value, label, highlight }: { icon: React.ReactNode; value: string | number; label: string; highlight?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500">{icon}</span>
      <span className={`text-xs font-semibold ${highlight ?? "text-gray-200"}`}>{value}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TASK CARD
// ─────────────────────────────────────────────
function TaskCard({ task, onSelect, featured }: { task: Task; onSelect: (t: Task) => void; featured?: boolean }) {
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

// ─────────────────────────────────────────────
//  SLIDE-OVER OVERLAY
// ─────────────────────────────────────────────
function TaskOverlay({ task, onClose }: { task: Task | null; onClose: () => void }) {
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

// ─────────────────────────────────────────────
//  FILTER DROPDOWN
// ─────────────────────────────────────────────
function FilterDropdown({
  label, options, selected, onToggle, onClose,
}: {
  label: string; options: string[]; selected: string[];
  onToggle: (v: string) => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-800">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      </div>
      <div className="py-1 max-h-52 overflow-y-auto">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 transition-colors text-left"
          >
            <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selected.includes(opt) ? "bg-indigo-600 border-indigo-600" : "border-gray-700"}`}>
              {selected.includes(opt) && <span className="w-1.5 h-1.5 rounded-sm bg-white" />}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function Explore() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [stakeRange, setStakeRange] = useState<[number, number]>([0, 200]);
  const [repMax, setRepMax] = useState(100);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleSkill = useCallback((s: string) =>
    setSkillFilter(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]), []);
  const toggleCat = useCallback((c: string) =>
    setCatFilter(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]), []);

  const filtered = sortTasks(
    TASKS.filter(t => {
      const q = search.toLowerCase();
      if (q && !t.title.toLowerCase().includes(q) && !t.project.toLowerCase().includes(q) && !t.skills.some(s => s.toLowerCase().includes(q))) return false;
      if (skillFilter.length > 0 && !skillFilter.some(s => t.skills.includes(s))) return false;
      if (catFilter.length > 0 && !catFilter.includes(t.category)) return false;
      if (t.stake < stakeRange[0] || t.stake > stakeRange[1]) return false;
      if (t.requiredRep > repMax) return false;
      return true;
    }),
    sort
  );

  const featured = filtered.filter(t => t.featured);
  const regular = filtered.filter(t => !t.featured);

  const activeFiltersCount = skillFilter.length + catFilter.length + (stakeRange[0] > 0 || stakeRange[1] < 200 ? 1 : 0) + (repMax < 100 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* subtle grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        backgroundSize: "48px 48px"
      }} />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 py-6">

        {/* ── PAGE HEADER ── */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-widest">Open Tasks</span>
            </div>
            <h1 className="text-xl font-bold text-gray-100">Explore Work</h1>
            <p className="text-xs text-gray-500 mt-0.5">Stake-backed commitments — find your next contribution.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-100 tabular-nums">{filtered.length}</p>
            <p className="text-[10px] text-gray-600">tasks available</p>
          </div>
        </div>

        {/* ── UTILITY ROW ── */}
        <div className="sticky top-14 z-20 bg-gray-950/90 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 border-b border-gray-800/60">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks, projects, skills…"
                className="w-full h-8 pl-8 pr-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>

              {/* Skill filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "skill" ? null : "skill")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${skillFilter.length > 0 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Skill {skillFilter.length > 0 && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">{skillFilter.length}</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "skill" && (
                  <FilterDropdown label="Skill" options={SKILL_OPTIONS} selected={skillFilter} onToggle={toggleSkill} onClose={() => setActiveFilterDropdown(null)} />
                )}
              </div>

              {/* Category filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "cat" ? null : "cat")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${catFilter.length > 0 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Category {catFilter.length > 0 && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">{catFilter.length}</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "cat" && (
                  <FilterDropdown label="Category" options={CATEGORY_OPTIONS} selected={catFilter} onToggle={toggleCat} onClose={() => setActiveFilterDropdown(null)} />
                )}
              </div>

              {/* Stake range */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "stake" ? null : "stake")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${stakeRange[0] > 0 || stakeRange[1] < 200 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Stake <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "stake" && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Stake Range (ETH)</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-indigo-400 font-semibold">{stakeRange[0]} ETH</span>
                      <span className="text-xs text-indigo-400 font-semibold">{stakeRange[1]} ETH</span>
                    </div>
                    <input type="range" min={0} max={200} value={stakeRange[0]} onChange={e => setStakeRange([+e.target.value, stakeRange[1]])} className="w-full accent-indigo-500 mb-2" />
                    <input type="range" min={0} max={200} value={stakeRange[1]} onChange={e => setStakeRange([stakeRange[0], +e.target.value])} className="w-full accent-indigo-500" />
                  </div>
                )}
              </div>

              {/* Rep requirement */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "rep" ? null : "rep")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${repMax < 100 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Rep req. <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "rep" && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Max Rep Required</p>
                    <p className="text-lg font-bold text-indigo-400 mb-2">{repMax}</p>
                    <input type="range" min={0} max={100} value={repMax} onChange={e => setRepMax(+e.target.value)} className="w-full accent-indigo-500" />
                    <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                      <span>0</span><span>100</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSkillFilter([]); setCatFilter([]); setStakeRange([0, 200]); setRepMax(100); }}
                  className="h-8 px-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(p => !p)}
                className="h-8 px-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 flex items-center gap-1.5 hover:border-gray-700 transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                {SORT_OPTIONS.find(s => s.key === sort)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 overflow-hidden"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setSort(opt.key); setSortOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left ${sort === opt.key ? "bg-indigo-600/20 text-indigo-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}
                      >
                        {opt.icon} {opt.label}
                        {sort === opt.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── FEATURED ROW ── */}
        {featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Featured / Recommended</span>
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {featured.map(t => (
                  <TaskCard key={t.id} task={t} onSelect={setSelectedTask} featured />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── ALL TASKS ── */}
        {regular.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">All Open Tasks</span>
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-[10px] text-gray-600">{regular.length} tasks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {regular.map(t => (
                  <TaskCard key={t.id} task={t} onSelect={setSelectedTask} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No tasks match your filters.</p>
            <button
              onClick={() => { setSearch(""); setSkillFilter([]); setCatFilter([]); setStakeRange([0, 200]); setRepMax(100); }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      {/* ── SLIDE-OVER ── */}
      <TaskOverlay task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}