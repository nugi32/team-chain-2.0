"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lock, DollarSign, Calendar, Clock, Star,
  Users, Shield, BadgeCheck, Zap, AlertTriangle, Target,
  Sparkles, CircleDot, Trophy, ChevronRight, ExternalLink,
  Copy, Check, CheckCircle2, XCircle, GitCommit,
  MessageSquare, Send, FileText, Link2, Hash,
  TrendingUp, Flame, BarChart3, Activity, Info,
  ChevronDown, ChevronUp, Play, Pause, HelpCircle,
  GitBranch, Package, Upload, Eye, ThumbsUp, Flag,
} from "lucide-react";

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
type MilestoneStatus = "completed" | "active" | "pending" | "disputed";
type TabKey = "overview" | "milestones" | "onchain" | "discussion";
type RiskBadge = "Low Risk" | "Verified Team" | "High Stake" | "Fast Review" | "New Team" | "Urgent";

interface Milestone {
  id: string;
  index: number;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  status: MilestoneStatus;
  proofUrl?: string;
  approvals: number;
  approvalsNeeded: number;
  completedAt?: string;
}

interface Comment {
  id: string;
  author: string;
  authorRep: number;
  avatar: string;
  avatarColor: string;
  content: string;
  timestamp: string;
  likes: number;
  isTeam?: boolean;
}

interface TxEvent {
  id: string;
  type: "stake_locked" | "milestone_approved" | "reward_released" | "dispute_opened" | "application" | "review_started";
  label: string;
  value?: string;
  timestamp: string;
  txHash: string;
  actor?: string;
}

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────
const TASK = {
  id: "t1",
  title: "Frontend Milestone for DAO Portal",
  project: "GovChain DAO",
  teamAvatar: "GC",
  teamName: "GovChain Core Team",
  teamRep: 91,
  teamCompletions: 47,
  teamMembers: 8,
  objective: "Build wallet connection and multi-sig transaction UI for the GovChain governance portal.",
  stake: 40,
  reward: 120,
  effort: "~40h",
  deadline: "5 days",
  deadlineDays: 5,
  deadlineDate: "May 16, 2026",
  requiredRep: 72,
  role: "Frontend Developer",
  skills: ["React", "Ethers.js", "Tailwind CSS", "RainbowKit", "TypeScript"],
  applicants: 3,
  slots: 1,
  category: "Frontend",
  badges: ["Verified Team", "Fast Review"] as RiskBadge[],
  status: "open" as const,
  contractAddress: "0x4f3a...9c2d",
  stakeToken: "ETH",
  chain: "Ethereum Mainnet",
  postedAt: "May 8, 2026",
  description: `GovChain DAO is building the next generation of on-chain governance infrastructure. We need an experienced frontend developer to implement two core flows for our governance portal:

**1. Wallet Connection Flow**  
Integrate RainbowKit with support for MetaMask, WalletConnect, and Coinbase Wallet. The connection state must persist across sessions and handle chain-switching prompts gracefully when users are on the wrong network.

**2. Multi-Sig Transaction Dashboard**  
Build a real-time transaction queue UI that displays pending proposals awaiting signatures. Each transaction card must show: proposal hash, current signers vs. required threshold, time remaining before expiry, and gas estimate. Clicking "Sign" should trigger an EIP-712 typed signature via the connected wallet.

The deliverable is a production-ready Next.js page with full TypeScript types, unit tests for the signature flow, and Storybook stories for the transaction card component.`,
  requirements: [
    "3+ years React / Next.js experience",
    "Familiarity with EIP-712 typed signatures",
    "Experience with RainbowKit or Wagmi v2",
    "Ability to write unit tests (Vitest or Jest)",
    "Availability for 1 async review round within 48h of submission",
  ],
  totalValue: 160,
  escrowAddress: "0x8b2c...1f4a",
};

const MILESTONES: Milestone[] = [
  {
    id: "m1", index: 1,
    title: "Wallet Connection Integration",
    description: "Implement RainbowKit with MetaMask, WalletConnect, Coinbase Wallet. Persistent session, chain-switch prompts.",
    reward: 35, deadline: "May 13, 2026",
    status: "active",
    approvals: 0, approvalsNeeded: 2,
  },
  {
    id: "m2", index: 2,
    title: "Multi-Sig Transaction Queue UI",
    description: "Real-time pending queue with signer threshold, expiry countdown, gas estimates, and sign button.",
    reward: 50, deadline: "May 15, 2026",
    status: "pending",
    approvals: 0, approvalsNeeded: 2,
  },
  {
    id: "m3", index: 3,
    title: "Tests + Storybook Stories",
    description: "Unit tests for signature flow, Storybook stories for transaction card, final PR review.",
    reward: 35, deadline: "May 16, 2026",
    status: "pending",
    approvals: 0, approvalsNeeded: 2,
  },
];

const COMMENTS: Comment[] = [
  {
    id: "c1", author: "Alex M.", authorRep: 91, avatar: "AM",
    avatarColor: "from-indigo-600 to-violet-600",
    content: "Is WalletConnect v2 required or is v1 still acceptable for this scope? The migration adds some complexity.",
    timestamp: "2h ago", likes: 3, isTeam: false,
  },
  {
    id: "c2", author: "GovChain Team", authorRep: 91, avatar: "GC",
    avatarColor: "from-indigo-600 to-violet-600",
    content: "WalletConnect v2 is required — we're targeting long-term support. RainbowKit 2.x handles the adapter for you so the migration overhead is minimal. Happy to answer follow-up questions.",
    timestamp: "1h ago", likes: 7, isTeam: true,
  },
  {
    id: "c3", author: "devkata.eth", authorRep: 78, avatar: "DK",
    avatarColor: "from-emerald-600 to-teal-600",
    content: "For the multi-sig queue, should we use polling or WebSocket subscriptions? Polling seems simpler but WebSockets would give real-time updates.",
    timestamp: "45m ago", likes: 2, isTeam: false,
  },
  {
    id: "c4", author: "GovChain Team", authorRep: 91, avatar: "GC",
    avatarColor: "from-indigo-600 to-violet-600",
    content: "WebSocket via Alchemy's Subscription API preferred — we already have the API key in the env setup. But polling fallback is acceptable if you document it.",
    timestamp: "30m ago", likes: 5, isTeam: true,
  },
];

const TX_EVENTS: TxEvent[] = [
  { id: "e1", type: "stake_locked", label: "Stake locked into escrow", value: "40 ETH", timestamp: "May 8, 2026 09:14", txHash: "0xab3f...2c1d", actor: "GovChain DAO" },
  { id: "e2", type: "application", label: "Application submitted", timestamp: "May 9, 2026 11:42", txHash: "0xcc91...5f3a", actor: "devkata.eth" },
  { id: "e3", type: "application", label: "Application submitted", timestamp: "May 9, 2026 14:08", txHash: "0xd712...8e4b", actor: "0xmarcus.eth" },
  { id: "e4", type: "review_started", label: "Review period started", timestamp: "May 10, 2026 10:00", txHash: "0xfe44...9a2c", actor: "GovChain DAO" },
];

const RELATED = [
  { id: "r1", title: "Governance Proposal UI", project: "GovChain DAO", reward: 100, stake: 35, deadline: "6 days", skills: ["Next.js", "Ethers.js"], teamAvatar: "GC", avatarColor: "from-indigo-600 to-violet-600" },
  { id: "r2", title: "Token Vesting Dashboard", project: "VestDAO", reward: 45, stake: 15, deadline: "7 days", skills: ["React", "Wagmi"], teamAvatar: "VD", avatarColor: "from-sky-600 to-blue-600" },
];

// ─────────────────────────────────────────────
//  BADGE CONFIG
// ─────────────────────────────────────────────
const badgeConfig: Record<RiskBadge, { color: string; icon: React.ReactNode }> = {
  "Low Risk":     { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <Shield className="w-2.5 h-2.5" /> },
  "Verified Team":{ color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",   icon: <BadgeCheck className="w-2.5 h-2.5" /> },
  "High Stake":   { color: "bg-amber-500/15 text-amber-400 border-amber-500/20",       icon: <Zap className="w-2.5 h-2.5" /> },
  "Fast Review":  { color: "bg-sky-500/15 text-sky-400 border-sky-500/20",             icon: <Target className="w-2.5 h-2.5" /> },
  "New Team":     { color: "bg-purple-500/15 text-purple-400 border-purple-500/20",    icon: <Sparkles className="w-2.5 h-2.5" /> },
  "Urgent":       { color: "bg-red-500/15 text-red-400 border-red-500/20",             icon: <AlertTriangle className="w-2.5 h-2.5" /> },
};

const milestoneStatusConfig: Record<MilestoneStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  completed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4" />, label: "Completed" },
  active:    { color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20",   icon: <Play className="w-4 h-4" />,         label: "In Progress" },
  pending:   { color: "text-gray-500",    bg: "bg-gray-800/60 border-gray-700/40",        icon: <Pause className="w-4 h-4" />,        label: "Pending" },
  disputed:  { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",          icon: <Flag className="w-4 h-4" />,         label: "Disputed" },
};

const txIconConfig: Record<TxEvent["type"], { icon: React.ReactNode; color: string }> = {
  stake_locked:       { icon: <Lock className="w-3.5 h-3.5" />,         color: "text-amber-400 bg-amber-500/10" },
  milestone_approved: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-400 bg-emerald-500/10" },
  reward_released:    { icon: <DollarSign className="w-3.5 h-3.5" />,   color: "text-emerald-400 bg-emerald-500/10" },
  dispute_opened:     { icon: <Flag className="w-3.5 h-3.5" />,         color: "text-red-400 bg-red-500/10" },
  application:        { icon: <Users className="w-3.5 h-3.5" />,        color: "text-indigo-400 bg-indigo-500/10" },
  review_started:     { icon: <Eye className="w-3.5 h-3.5" />,          color: "text-sky-400 bg-sky-500/10" },
};

// ─────────────────────────────────────────────
//  SMALL COMPONENTS
// ─────────────────────────────────────────────
function BadgeChip({ badge }: { badge: RiskBadge }) {
  const cfg = badgeConfig[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${cfg.color}`}>
      {cfg.icon}{badge}
    </span>
  );
}

function SkillTag({ skill, size = "sm" }: { skill: string; size?: "sm" | "md" }) {
  return (
    <span className={`px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700/60 font-mono text-gray-400 ${size === "md" ? "text-xs" : "text-[10px]"}`}>
      {skill}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="text-gray-600 hover:text-gray-400 transition-colors ml-1.5"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-3">{children}</p>
  );
}

// ─────────────────────────────────────────────
//  TABS
// ─────────────────────────────────────────────
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview",    label: "Overview",    icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "milestones", label: "Milestones",  icon: <GitCommit className="w-3.5 h-3.5" /> },
  { key: "onchain",    label: "On-Chain",    icon: <Activity className="w-3.5 h-3.5" /> },
  { key: "discussion", label: "Discussion",  icon: <MessageSquare className="w-3.5 h-3.5" /> },
];

// ─────────────────────────────────────────────
//  OVERVIEW TAB
// ─────────────────────────────────────────────
function OverviewTab() {
  const [expanded, setExpanded] = useState(false);

  const paragraphs = TASK.description.split("\n\n");

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <SectionLabel>Task Description</SectionLabel>
        <div className={`relative overflow-hidden transition-all duration-300 ${expanded ? "max-h-none" : "max-h-48"}`}>
          <div className="space-y-3">
            {paragraphs.map((p, i) => {
              const lines = p.split("\n");
              return (
                <div key={i} className="text-sm text-gray-400 leading-relaxed">
                  {lines.map((line, j) => {
                    const bold = line.replace(/\*\*(.*?)\*\*/g, "§§$1§§").split("§§");
                    return (
                      <p key={j} className={line.startsWith("**") ? "font-semibold text-gray-200 mt-2" : ""}>
                        {bold.map((seg, k) => k % 2 === 1 ? <strong key={k} className="text-gray-200 font-semibold">{seg}</strong> : seg)}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 to-transparent" />
          )}
        </div>
        <button
          onClick={() => setExpanded(p => !p)}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read more</>}
        </button>
      </div>

      {/* Requirements */}
      <div>
        <SectionLabel>Requirements</SectionLabel>
        <ul className="space-y-2">
          {TASK.requirements.map((req, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-2.5 text-sm text-gray-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              {req}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div>
        <SectionLabel>Required Skills</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {TASK.skills.map(s => <SkillTag key={s} skill={s} size="md" />)}
        </div>
      </div>

      {/* Milestone summary strip */}
      <div>
        <SectionLabel>Milestone Summary</SectionLabel>
        <div className="space-y-2">
          {MILESTONES.map((m, i) => {
            const cfg = milestoneStatusConfig[m.status];
            return (
              <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg}`}>
                <span className={`flex-shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">M{m.index}: {m.title}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Due {m.deadline}</p>
                </div>
                <span className={`text-xs font-bold ${cfg.color} flex-shrink-0`}>{m.reward} ETH</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team card */}
      <div>
        <SectionLabel>About the Team</SectionLabel>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{TASK.teamAvatar}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-100">{TASK.teamName}</h3>
                <BadgeChip badge="Verified Team" />
              </div>
              <p className="text-xs text-gray-500 mb-3">On-chain governance infrastructure and DAO tooling on Ethereum.</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-gray-400"><span className="font-semibold text-gray-200">{TASK.teamRep}</span> reputation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-gray-400"><span className="font-semibold text-gray-200">{TASK.teamCompletions}</span> completions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs text-gray-400"><span className="font-semibold text-gray-200">{TASK.teamMembers}</span> members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MILESTONES TAB
// ─────────────────────────────────────────────
function MilestonesTab() {
  const completedCount = MILESTONES.filter(m => m.status === "completed").length;
  const progress = (completedCount / MILESTONES.length) * 100;

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Overall Progress</SectionLabel>
          <span className="text-xs font-semibold text-gray-400">{completedCount}/{MILESTONES.length} completed</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-gray-600">0%</span>
          <span className="text-[10px] text-indigo-400 font-semibold">{Math.round(progress)}%</span>
          <span className="text-[10px] text-gray-600">100%</span>
        </div>
      </div>

      {/* Total value bar */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
          <span>Locked stake: <span className="text-amber-400 font-semibold">{TASK.stake} ETH</span></span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
          <span>Total reward pool: <span className="text-emerald-400 font-semibold">{TASK.reward} ETH</span></span>
        </div>
      </div>

      {/* Milestones */}
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-5 top-6 bottom-6 w-px bg-gray-800" />

        <div className="space-y-4">
          {MILESTONES.map((m, i) => {
            const cfg = milestoneStatusConfig[m.status];
            const isLast = i === MILESTONES.length - 1;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4"
              >
                {/* timeline node */}
                <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.icon}
                </div>

                {/* card */}
                <div className={`flex-1 rounded-2xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-gray-600 font-mono">M{m.index}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-100">{m.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-emerald-400">{m.reward} ETH</p>
                      <p className="text-[10px] text-gray-600">reward</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{m.description}</p>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>Due {m.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-600">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{m.approvals}/{m.approvalsNeeded} approvals</span>
                      </div>
                    </div>

                    {m.status === "active" && (
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold hover:bg-indigo-600/30 transition-colors flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Submit Proof
                        </button>
                      </div>
                    )}
                    {m.status === "completed" && m.proofUrl && (
                      <button className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                        <Link2 className="w-3 h-3" /> View proof
                      </button>
                    )}
                    {m.status === "pending" && (
                      <span className="text-[10px] text-gray-600 italic">Awaiting previous milestone</span>
                    )}
                  </div>

                  {/* approval bar */}
                  {m.status === "active" && (
                    <div className="mt-3 pt-3 border-t border-gray-800/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-600">Approval progress</span>
                        <span className="text-[10px] font-semibold text-indigo-400">{m.approvals}/{m.approvalsNeeded}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(m.approvals / m.approvalsNeeded) * 100}%` }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ON-CHAIN TAB
// ─────────────────────────────────────────────
function OnChainTab() {
  return (
    <div className="space-y-8">
      {/* Contract details */}
      <div>
        <SectionLabel>Contract Details</SectionLabel>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 divide-y divide-gray-800">
          {[
            { label: "Escrow Contract", value: TASK.escrowAddress, mono: true, copy: true },
            { label: "Chain", value: TASK.chain, mono: false, copy: false },
            { label: "Stake Token", value: TASK.stakeToken, mono: false, copy: false },
            { label: "Task ID (on-chain)", value: `#${TASK.id.toUpperCase()}`, mono: true, copy: true },
            { label: "Posted", value: TASK.postedAt, mono: false, copy: false },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-gray-500">{row.label}</span>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-semibold text-gray-200 ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                {row.copy && <CopyButton value={row.value} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Economic breakdown */}
      <div>
        <SectionLabel>Economic Breakdown</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Stake Locked", value: `${TASK.stake} ETH`, icon: <Lock className="w-4 h-4" />, color: "text-amber-400", sub: "Returned on success" },
            { label: "Reward Pool", value: `${TASK.reward} ETH`, icon: <DollarSign className="w-4 h-4" />, color: "text-emerald-400", sub: "Paid per milestone" },
            { label: "Total Value", value: `${TASK.totalValue} ETH`, icon: <BarChart3 className="w-4 h-4" />, color: "text-indigo-400", sub: "At risk for worker" },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-center">
              <div className={`flex justify-center mb-1 ${item.color}`}>{item.icon}</div>
              <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{item.label}</p>
              <p className="text-[9px] text-gray-700 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payout mechanism */}
      <div>
        <SectionLabel>Payout Mechanism</SectionLabel>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
          {[
            { step: "1", text: "Worker stakes 40 ETH into the escrow contract on joining.", icon: <Lock className="w-3.5 h-3.5 text-amber-400" /> },
            { step: "2", text: "Each milestone reward is released upon 2-of-3 team approvals on-chain.", icon: <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" /> },
            { step: "3", text: "Stake is returned in full upon final milestone approval.", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
            { step: "4", text: "Disputes trigger a 72h arbitration window with DAO voting.", icon: <Flag className="w-3.5 h-3.5 text-red-400" /> },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 text-[10px] text-gray-500 font-bold">
                {item.step}
              </div>
              <div className="flex items-start gap-2 flex-1">
                <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tx event log */}
      <div>
        <SectionLabel>On-Chain Activity Log</SectionLabel>
        <div className="space-y-2">
          {TX_EVENTS.map((evt, i) => {
            const cfg = txIconConfig[evt.type];
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 bg-gray-900/60"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 font-medium truncate">{evt.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {evt.actor && <span className="text-[10px] text-gray-600">by {evt.actor}</span>}
                    <span className="text-[10px] text-gray-700">·</span>
                    <span className="text-[10px] text-gray-600">{evt.timestamp}</span>
                  </div>
                </div>
                {evt.value && <span className="text-xs font-semibold text-amber-400 flex-shrink-0">{evt.value}</span>}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="font-mono text-[10px] text-gray-700">{evt.txHash}</span>
                  <CopyButton value={evt.txHash} />
                  <button className="text-gray-700 hover:text-gray-500 ml-0.5">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  DISCUSSION TAB
// ─────────────────────────────────────────────
function DiscussionTab() {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(COMMENTS);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: `c${Date.now()}`, author: "You", authorRep: 0, avatar: "ME",
      avatarColor: "from-violet-600 to-purple-600",
      content: newComment, timestamp: "just now", likes: 0,
    };
    setComments(p => [...p, c]);
    setNewComment("");
  };

  const toggleLike = (id: string) => {
    setLikedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Discussion ({comments.length})</SectionLabel>
        <div className="flex items-center gap-1 text-[10px] text-gray-600">
          <Info className="w-3 h-3" />
          <span>Questions visible to all applicants</span>
        </div>
      </div>

      {/* Comment thread */}
      <div className="space-y-4">
        {comments.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex gap-3 ${c.isTeam ? "bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4" : ""}`}
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.avatarColor} flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white`}>
              {c.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-200">{c.author}</span>
                {c.isTeam && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600/20 border border-indigo-500/30 text-[9px] font-bold text-indigo-400 uppercase tracking-wide">Team</span>
                )}
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400/70">
                  <Star className="w-2.5 h-2.5" />{c.authorRep}
                </span>
                <span className="text-[10px] text-gray-700 ml-auto">{c.timestamp}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{c.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => toggleLike(c.id)}
                  className={`flex items-center gap-1 text-[10px] transition-colors ${likedIds.includes(c.id) ? "text-indigo-400" : "text-gray-600 hover:text-gray-400"}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  {c.likes + (likedIds.includes(c.id) ? 1 : 0)}
                </button>
                <button className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Reply</button>
                <button className="text-[10px] text-gray-700 hover:text-red-400 transition-colors ml-auto">
                  <Flag className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New comment box */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-3">Ask a Question</p>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Ask the team a question about this task…"
          rows={3}
          className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-gray-700">Visible to all applicants and the team</p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Post
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  STICKY APPLY SIDEBAR
// ─────────────────────────────────────────────
function ApplySidebar() {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => { setApplying(false); setApplied(true); }, 1400);
  };

  const isUrgent = TASK.deadlineDays <= 5;

  return (
    <div className="space-y-4">
      {/* main CTA card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
        {/* value summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-amber-500/8 border border-amber-500/15 p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{TASK.stake}</p>
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide mt-0.5">ETH Stake</p>
          </div>
          <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{TASK.reward}</p>
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide mt-0.5">ETH Reward</p>
          </div>
        </div>

        {/* meta rows */}
        <div className="space-y-2 pt-1">
          {[
            { icon: <Calendar className="w-3.5 h-3.5 text-gray-500" />, label: "Deadline", value: TASK.deadlineDate, highlight: isUrgent ? "text-red-400" : "text-gray-300" },
            { icon: <Clock className="w-3.5 h-3.5 text-gray-500" />, label: "Est. effort", value: TASK.effort, highlight: "text-gray-300" },
            { icon: <Star className="w-3.5 h-3.5 text-gray-500" />, label: "Required REP", value: `${TASK.requiredRep}+`, highlight: "text-indigo-400" },
            { icon: <Users className="w-3.5 h-3.5 text-gray-500" />, label: "Open slots", value: `${TASK.slots - TASK.applicants} of ${TASK.slots}`, highlight: "text-emerald-400" },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {row.icon}
                <span className="text-xs text-gray-500">{row.label}</span>
              </div>
              <span className={`text-xs font-semibold ${row.highlight}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* divider */}
        <div className="h-px bg-gray-800" />

        {/* CTAs */}
        {!applied ? (
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleApply}
              disabled={applying}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {applying ? (
                <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
              ) : (
                <>Apply for Task <ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Stake & Join Instantly
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-center"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-400">Application submitted!</p>
            <p className="text-[10px] text-gray-500 mt-1">The team will review and respond within 48h.</p>
          </motion.div>
        )}

        {/* gas note */}
        <p className="text-[10px] text-gray-700 text-center flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          A small gas fee is required to submit on-chain.
        </p>
      </div>

      {/* Risk info */}
      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Stake Risk</span>
        </div>
        <p className="text-[11px] text-amber-200/60 leading-relaxed">
          Your <strong className="text-amber-400">{TASK.stake} ETH stake</strong> is held in escrow and returned upon final milestone approval. Failure to deliver may result in partial or full stake slash per protocol rules.
        </p>
        <button className="text-[10px] text-amber-400/70 hover:text-amber-400 flex items-center gap-1 transition-colors">
          Read protocol rules <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Applicants */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <SectionLabel>Applicants ({TASK.applicants})</SectionLabel>
        <div className="space-y-2">
          {["devkata.eth", "0xmarcus.eth", "lila.dev"].slice(0, TASK.applicants).map((addr, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white
                ${i === 0 ? "from-emerald-600 to-teal-600" : i === 1 ? "from-violet-600 to-purple-600" : "from-rose-600 to-pink-600"}`}>
                {addr.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-gray-400 font-mono">{addr}</span>
              <span className="ml-auto text-[10px] text-gray-600">Applied</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-700 mt-3">{TASK.slots - TASK.applicants} slot remaining</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────
export default function TaskDetailPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const isUrgent = TASK.deadlineDays <= 5;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* bg grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 py-6">

        {/* ── BACK BREADCRUMB ── */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-6 text-xs text-gray-600"
        >
          <button className="flex items-center gap-1.5 hover:text-gray-400 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Explore
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">{TASK.project}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-500 truncate max-w-[200px]">{TASK.title}</span>
        </motion.div>

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl border border-gray-800 bg-gray-900/60 overflow-hidden mb-8"
        >
          {/* accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
          {/* bg glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-6 sm:p-8">
            {/* top row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-start gap-4">
                {/* team avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-950/40">
                  <span className="text-base font-bold text-white">{TASK.teamAvatar}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {TASK.badges.map(b => <BadgeChip key={b} badge={b} />)}
                    {isUrgent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-red-500/15 text-red-400 border-red-500/20 text-[10px] font-semibold">
                        <Flame className="w-2.5 h-2.5" /> Urgent
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                      <CircleDot className="w-2.5 h-2.5" /> Open
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100 leading-tight">{TASK.title}</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-indigo-400 font-medium">{TASK.project}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500">{TASK.role}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500">Posted {TASK.postedAt}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 mt-1">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* objective */}
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-2xl">{TASK.objective}</p>

            {/* 5-metric strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { icon: <Lock className="w-3.5 h-3.5" />, label: "Stake", value: `${TASK.stake} ETH`, color: "text-amber-400" },
                { icon: <DollarSign className="w-3.5 h-3.5" />, label: "Reward", value: `${TASK.reward} ETH`, color: "text-emerald-400" },
                { icon: <Calendar className="w-3.5 h-3.5" />, label: "Deadline", value: TASK.deadline, color: isUrgent ? "text-red-400" : "text-gray-200" },
                { icon: <Star className="w-3.5 h-3.5" />, label: "Min REP", value: `${TASK.requiredRep}+`, color: "text-indigo-400" },
                { icon: <Users className="w-3.5 h-3.5" />, label: "Slots", value: `${TASK.applicants}/${TASK.slots}`, color: "text-gray-300" },
              ].map(m => (
                <div key={m.label} className="rounded-xl border border-gray-800 bg-gray-950/50 px-3 py-2.5 flex items-center gap-2">
                  <span className={m.color}>{m.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-[10px] text-gray-600">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── MAIN LAYOUT ── */}
        <div className="flex gap-6 items-start">

          {/* ── LEFT: tabs + content ── */}
          <div className="flex-1 min-w-0">

            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-6 border-b border-gray-800 pb-0">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors rounded-t-lg ${
                    activeTab === tab.key ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.icon} {tab.label}
                  {activeTab === tab.key && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "overview"    && <OverviewTab />}
                {activeTab === "milestones" && <MilestonesTab />}
                {activeTab === "onchain"    && <OnChainTab />}
                {activeTab === "discussion" && <DiscussionTab />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div className="hidden lg:block w-80 xl:w-[340px] flex-shrink-0">
            <div className="sticky top-20">
              <ApplySidebar />
            </div>
          </div>
        </div>

        {/* ── RELATED TASKS ── */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Similar Tasks</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RELATED.map(r => (
              <motion.div
                key={r.id}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-4 cursor-pointer hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${r.avatarColor} flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white`}>
                    {r.teamAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-200 truncate">{r.title}</h4>
                    <p className="text-[11px] text-indigo-400">{r.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
                  <span className="text-amber-400 font-semibold">{r.stake} ETH stake</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{r.reward} ETH reward</span>
                  <span>·</span>
                  <span>{r.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {r.skills.slice(0, 2).map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700/50 text-[9px] font-mono text-gray-500">{s}</span>
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY FOOTER CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 flex gap-2 z-30">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          Apply <ChevronRight className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" /> Stake & Join
        </motion.button>
      </div>
    </div>
  );
}