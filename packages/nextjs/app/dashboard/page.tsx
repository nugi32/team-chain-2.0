"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Shield, TrendingUp, Star, Clock, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Bell, Users, Zap,
  ArrowUpRight, ArrowDownRight, GitBranch, Award, Layers,
  BarChart2, Send, Eye, LogOut, Plus, Filter, MoreHorizontal,
  Activity, Coins, Lock, Gift, RefreshCw, UserCheck, MessageSquare,
  Copy, ExternalLink, ChevronDown, Flame, Target, Hash,
} from "lucide-react";

/* ─────────────────────────────────────
   MOCK DATA
────────────────────────────────────── */
const USER = {
  name: "Reza Pratama",
  handle: "@rezapratama",
  avatar: null,
  initials: "RP",
  wallet: "0x4A3B…9F2C",
  chain: "Ethereum",
  tier: "Gold",
  rank: 142,
  reputationScore: 847,
  reputationDelta: +12,
  successRate: 94.2,
  activeStake: 4.28,
  stakeUSD: 14_220,
  availableBalance: 1.74,
  totalEarned: 18.6,
  pendingRewards: 0.42,
};

const KANBAN_TABS = ["Active", "Review", "Completed", "Disputed"] as const;
type KanbanTab = (typeof KANBAN_TABS)[number];

const TASKS = [
  {
    id: "t1", tab: "Active" as KanbanTab,
    project: "DeFi Liquidity Bridge", role: "Lead Developer",
    stake: 1.2, stakeUSD: 3_980, deadline: "Jun 3, 2026",
    milestone: "Milestone 3 / 5 — Smart Contract Audit",
    risk: "on-track", progress: 58,
    tags: ["solidity", "audit"],
  },
  {
    id: "t2", tab: "Active" as KanbanTab,
    project: "NFT Marketplace V2", role: "Reviewer",
    stake: 0.5, stakeUSD: 1_660, deadline: "May 28, 2026",
    milestone: "Milestone 1 / 3 — Design Handoff",
    risk: "at-risk", progress: 35,
    tags: ["review", "design"],
  },
  {
    id: "t3", tab: "Active" as KanbanTab,
    project: "DAO Governance Module", role: "Backend Dev",
    stake: 0.8, stakeUSD: 2_656, deadline: "May 14, 2026",
    milestone: "Milestone 2 / 4 — API Integration",
    risk: "overdue", progress: 20,
    tags: ["api", "governance"],
  },
  {
    id: "t4", tab: "Review" as KanbanTab,
    project: "Cross-Chain Oracle", role: "Core Dev",
    stake: 1.78, stakeUSD: 5_912, deadline: "May 15, 2026",
    milestone: "Final Review — Awaiting 2 approvals",
    risk: "on-track", progress: 95,
    tags: ["oracle", "cross-chain"],
  },
  {
    id: "t5", tab: "Completed" as KanbanTab,
    project: "Staking UI Redesign", role: "Designer",
    stake: 0.3, stakeUSD: 996, deadline: "Apr 30, 2026",
    milestone: "All milestones complete",
    risk: "on-track", progress: 100,
    tags: ["ui", "design"],
  },
  {
    id: "t6", tab: "Disputed" as KanbanTab,
    project: "Layer 2 Bridge SDK", role: "Developer",
    stake: 0.6, stakeUSD: 1_992, deadline: "Apr 20, 2026",
    milestone: "Dispute: Milestone 4 deliverable quality",
    risk: "overdue", progress: 72,
    tags: ["sdk", "l2"],
  },
];

const ACTIVITY = [
  { id: 1, type: "milestone", label: "Milestone 2 completed", sub: "DeFi Liquidity Bridge", time: "2h ago", delta: "+18 REP", positive: true },
  { id: 2, type: "stake", label: "Stake returned", sub: "Staking UI Redesign", time: "1d ago", delta: "+0.30 ETH", positive: true },
  { id: 3, type: "review", label: "Peer review received", sub: "4.8 / 5 from @devmike", time: "1d ago", delta: "+6 REP", positive: true },
  { id: 4, type: "slash", label: "Reputation slashed", sub: "Missed deadline on Layer 2 Bridge SDK", time: "3d ago", delta: "−22 REP", positive: false },
  { id: 5, type: "dispute", label: "Dispute opened", sub: "Layer 2 Bridge SDK — quality challenge", time: "4d ago", delta: "Pending", positive: null },
  { id: 6, type: "milestone", label: "Milestone 1 completed", sub: "Cross-Chain Oracle", time: "5d ago", delta: "+15 REP", positive: true },
  { id: 7, type: "stake", label: "Stake committed", sub: "DAO Governance Module", time: "6d ago", delta: "−0.80 ETH", positive: false },
];

const TRANSACTIONS = [
  { id: 1, label: "Stake — DeFi Liquidity Bridge", amount: "-1.20 ETH", usd: "-$3,980", time: "May 1", out: true },
  { id: 2, label: "Reward — Cross-Chain Oracle M1", amount: "+0.18 ETH", usd: "+$598", time: "Apr 30", out: false },
  { id: 3, label: "Stake returned — Staking UI", amount: "+0.30 ETH", usd: "+$996", time: "Apr 30", out: false },
  { id: 4, label: "Stake — DAO Governance Module", amount: "-0.80 ETH", usd: "-$2,656", time: "Apr 29", out: true },
];

const COLLABORATORS = [
  { name: "Dev Mike", handle: "@devmike", initials: "DM", trust: 96, projects: 4, color: "bg-indigo-500/20 text-indigo-300" },
  { name: "Sara K.", handle: "@sarakdev", initials: "SK", trust: 88, projects: 2, color: "bg-emerald-500/20 text-emerald-300" },
  { name: "Nico R.", handle: "@nicor", initials: "NR", trust: 82, projects: 3, color: "bg-amber-500/20 text-amber-300" },
];

const NOTIFICATIONS = [
  { id: 1, type: "deadline", msg: "DAO Governance Module overdue", time: "Now", urgent: true },
  { id: 2, type: "review", msg: "2 approvals pending on Cross-Chain Oracle", time: "4h ago", urgent: false },
  { id: 3, type: "invite", msg: "Invited to join ZK Rollup SDK", time: "1d ago", urgent: false },
  { id: 4, type: "dispute", msg: "Dispute update: L2 Bridge awaiting arbitration", time: "2d ago", urgent: true },
];

const INVITATIONS = [
  { id: 1, project: "ZK Rollup SDK", role: "Auditor", stake: "0.5 ETH", by: "@niklas_eth" },
  { id: 2, project: "Social Graph Protocol", role: "Backend Dev", stake: "1.2 ETH", by: "@teamalpha" },
];

/* ─────────────────────────────────────
   HELPERS
────────────────────────────────────── */
const RISK_STYLES: Record<string, string> = {
  "on-track": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "at-risk":  "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "overdue":  "text-red-400 bg-red-500/10 border-red-500/20",
};
const RISK_ICONS: Record<string, React.ReactNode> = {
  "on-track": <CheckCircle2 className="w-3 h-3" />,
  "at-risk":  <AlertTriangle className="w-3 h-3" />,
  "overdue":  <XCircle className="w-3 h-3" />,
};
const RISK_LABEL: Record<string, string> = {
  "on-track": "On Track", "at-risk": "At Risk", "overdue": "Overdue",
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  milestone: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  stake:     <Lock className="w-4 h-4 text-indigo-400" />,
  review:    <Star className="w-4 h-4 text-amber-400" />,
  slash:     <AlertTriangle className="w-4 h-4 text-red-400" />,
  dispute:   <XCircle className="w-4 h-4 text-orange-400" />,
};

const TIER_STYLE: Record<string, string> = {
  Bronze: "text-amber-700 bg-amber-900/30 border-amber-700/30",
  Silver: "text-gray-300 bg-gray-700/30 border-gray-600/30",
  Gold:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Platinum: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
};

function StatCard({
  icon, label, value, sub, accent = false, badge,
}: {
  icon: React.ReactNode; label: string; value: string | React.ReactNode;
  sub?: React.ReactNode; accent?: boolean; badge?: React.ReactNode;
}) {
  return (
    <div className={[
      "rounded-2xl border p-5 flex flex-col gap-3 relative",
      accent
        ? "border-indigo-500/30 bg-indigo-500/5"
        : "border-gray-800 bg-gray-900",
    ].join(" ")}>
      {badge && <div className="absolute top-3 right-3">{badge}</div>}
      <div className={["w-9 h-9 rounded-xl flex items-center justify-center",
        accent ? "bg-indigo-500/20" : "bg-gray-800"].join(" ")}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="text-xl font-bold text-white leading-tight">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   TASK CARD
────────────────────────────────────── */
function TaskCard({ task }: { task: (typeof TASKS)[0] }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-3 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white leading-snug">{task.project}</p>
          <p className="text-xs text-gray-500 mt-0.5">{task.role}</p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-400">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={["h-full rounded-full transition-all",
              task.risk === "overdue" ? "bg-red-500" :
              task.risk === "at-risk"  ? "bg-amber-500" : "bg-indigo-500"].join(" ")}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600">{task.milestone}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className={["inline-flex items-center gap-1 text-[10px] font-medium rounded-full border px-2 py-0.5",
          RISK_STYLES[task.risk]].join(" ")}>
          {RISK_ICONS[task.risk]}
          {RISK_LABEL[task.risk]}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {task.deadline}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-mono text-indigo-300">{task.stake} ETH</span>
          <span className="text-[10px] text-gray-600">(${task.stakeUSD.toLocaleString()})</span>
        </div>
        <div className="flex gap-1.5">
          <button className="text-[10px] text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg px-2 py-1 transition-colors flex items-center gap-1">
            <Eye className="w-3 h-3" /> View
          </button>
          {task.tab === "Active" && (
            <button className="text-[10px] text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1">
              <Send className="w-3 h-3" /> Submit
            </button>
          )}
          {task.tab === "Review" && (
            <button className="text-[10px] text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SECTION HEADING
────────────────────────────────────── */
function SectionHeading({ icon, title, action }: {
  icon: React.ReactNode; title: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN DASHBOARD
────────────────────────────────────── */
export default function TeamChainDashboard() {
  const [kanbanTab, setKanbanTab] = useState<KanbanTab>("Active");
  const [notifOpen, setNotifOpen] = useState(false);

  const visibleTasks = TASKS.filter((t) => t.tab === kanbanTab);
  const urgentCount  = NOTIFICATIONS.filter((n) => n.urgent).length;

  const inputClass =
    "w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-indigo-500";

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Background grid ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      {/* ══════════════════════════════
          TOP NAV
      ══════════════════════════════ */}


      <main className="relative max-w-[1440px] mx-auto px-4 md:px-6 py-8">

        {/* ══════════════════════════════
            GREETING
        ══════════════════════════════ */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {USER.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              You have{" "}
              <span className="text-red-400 font-medium">1 overdue task</span>{" "}
              and{" "}
              <span className="text-amber-400 font-medium">2 pending reviews</span>.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Commitment
          </button>
        </div>

        {/* ══════════════════════════════
            TOP STATS ROW
        ══════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">

          {/* Reputation Score */}
          <StatCard
            accent
            icon={<Shield className="w-4.5 h-4.5 text-indigo-300" />}
            label="Reputation Score"
            value={
              <span className="flex items-baseline gap-1.5">
                {USER.reputationScore}
                <span className="text-xs font-normal text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />+{USER.reputationDelta}
                </span>
              </span>
            }
            sub="Top 8% this month"
            badge={
              <div className={["text-[10px] font-semibold rounded-full border px-2 py-0.5", TIER_STYLE[USER.tier]].join(" ")}>
                {USER.tier}
              </div>
            }
          />

          {/* Active Stake */}
          <StatCard
            icon={<Lock className="w-4 h-4 text-amber-400" />}
            label="Active Stake Locked"
            value={<span className="font-mono">{USER.activeStake} ETH</span>}
            sub={`$${USER.stakeUSD.toLocaleString()} USD`}
          />

          {/* Success Rate */}
          <StatCard
            icon={<Target className="w-4 h-4 text-emerald-400" />}
            label="Success Rate"
            value={`${USER.successRate}%`}
            sub={
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                47 of 50 completed
              </span>
            }
          />

          {/* Rank */}
          <StatCard
            icon={<Award className="w-4 h-4 text-yellow-400" />}
            label="Global Rank"
            value={`#${USER.rank}`}
            sub="Top contributor this week"
          />

          {/* Wallet / Balance */}
          <StatCard
            icon={<Coins className="w-4 h-4 text-gray-400" />}
            label="Available Balance"
            value={<span className="font-mono">{USER.availableBalance} ETH</span>}
            sub={
              <span className="flex items-center gap-1 text-emerald-400">
                <Gift className="w-3 h-3" />
                +{USER.pendingRewards} ETH pending
              </span>
            }
          />
        </div>

        {/* ══════════════════════════════
            MAIN CONTENT GRID
            [Tasks | Sidebar]
        ══════════════════════════════ */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-6">

          {/* ── LEFT: COMMITMENTS KANBAN ── */}
          <div>
            <SectionHeading
              icon={<Layers className="w-3.5 h-3.5 text-gray-400" />}
              title="Active Commitments"
              action={
                <div className="flex items-center gap-2">
                  <button className="text-[10px] text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-1 transition-colors">
                    <Filter className="w-3 h-3" /> Filter
                  </button>
                </div>
              }
            />

            {/* Kanban tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-2xl bg-gray-900 border border-gray-800 w-fit">
              {KANBAN_TABS.map((tab) => {
                const count = TASKS.filter((t) => t.tab === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setKanbanTab(tab)}
                    className={["relative rounded-xl px-4 py-1.5 text-xs font-medium transition-all",
                      kanbanTab === tab
                        ? "bg-gray-800 text-white shadow"
                        : "text-gray-500 hover:text-gray-300"].join(" ")}
                  >
                    {tab}
                    <span className={["ml-1.5 text-[10px] rounded-full px-1.5 py-0.5",
                      tab === "Disputed" ? "bg-red-500/20 text-red-400" :
                      tab === "Review"   ? "bg-amber-500/20 text-amber-400" :
                      tab === "Completed"? "bg-emerald-500/20 text-emerald-400" :
                      "bg-indigo-500/20 text-indigo-400"].join(" ")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cards grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={kanbanTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid sm:grid-cols-2 gap-3"
              >
                {visibleTasks.length > 0 ? (
                  visibleTasks.map((task) => <TaskCard key={task.id} task={task} />)
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
                    <p className="text-sm text-gray-600">No tasks in this column</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Wallet card */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-gray-300">{USER.chain} Mainnet</span>
              </div>
              <div className="font-mono text-sm text-indigo-300 mb-3">{USER.wallet}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
                  <p className="text-gray-500 mb-1">Available</p>
                  <p className="font-mono font-semibold">{USER.availableBalance} ETH</p>
                </div>
                <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
                  <p className="text-gray-500 mb-1">Staked</p>
                  <p className="font-mono font-semibold">{USER.activeStake} ETH</p>
                </div>
              </div>
            </div>

            {/* Pending Invitations */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <SectionHeading
                icon={<Users className="w-3.5 h-3.5 text-gray-400" />}
                title="Invitations"
              />
              <div className="space-y-3">
                {INVITATIONS.map((inv) => (
                  <div key={inv.id} className="rounded-xl border border-gray-800 bg-gray-950 p-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-white">{inv.project}</p>
                      <p className="text-[10px] text-gray-500">{inv.role} · from {inv.by}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 rounded-lg px-2 py-0.5">
                        Stake {inv.stake}
                      </span>
                      <div className="flex gap-1.5">
                        <button className="text-[10px] text-gray-500 hover:text-white border border-gray-700 rounded-lg px-2 py-1 transition-colors">Decline</button>
                        <button className="text-[10px] text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg px-2 py-1 transition-colors">Accept</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <SectionHeading
                icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
                title="Upcoming Deadlines"
              />
              <div className="space-y-2">
                {TASKS.filter(t => t.tab === "Active" || t.tab === "Review")
                  .slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={["w-1.5 h-1.5 rounded-full flex-shrink-0",
                        t.risk === "overdue" ? "bg-red-400" :
                        t.risk === "at-risk"  ? "bg-amber-400" : "bg-emerald-400"].join(" ")} />
                      <span className="text-xs text-gray-300 truncate">{t.project}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{t.deadline}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peer Reviews */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <SectionHeading
                icon={<MessageSquare className="w-3.5 h-3.5 text-gray-400" />}
                title="Pending Approvals"
              />
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p>Cross-Chain Oracle awaiting 2 peer approvals to finalize.</p>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-gray-950 border border-gray-800 p-3">
                  <UserCheck className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p>NFT Marketplace V2 review assigned to you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            BOTTOM GRID
            [Activity | Financial | Team]
        ══════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* ── ACTIVITY HISTORY ── */}
          <div className="md:col-span-1">
            <SectionHeading
              icon={<Activity className="w-3.5 h-3.5 text-gray-400" />}
              title="Reputation Activity"
              action={
                <button className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              }
            />
            <div className="rounded-2xl border border-gray-800 bg-gray-900 divide-y divide-gray-800/70">
              {ACTIVITY.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3.5 hover:bg-gray-800/30 transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {ACTIVITY_ICONS[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-200 leading-snug">{item.label}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={["text-[10px] font-mono font-semibold",
                      item.positive === true  ? "text-emerald-400" :
                      item.positive === false ? "text-red-400" : "text-gray-500"].join(" ")}>
                      {item.delta}
                    </span>
                    <span className="text-[10px] text-gray-600">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FINANCIAL SUMMARY ── */}
          <div className="md:col-span-1">
            <SectionHeading
              icon={<Coins className="w-3.5 h-3.5 text-gray-400" />}
              title="Financial Summary"
            />

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Available", val: `${USER.availableBalance} ETH`, icon: <Wallet className="w-3 h-3" />, color: "text-gray-300" },
                { label: "Staked",    val: `${USER.activeStake} ETH`,    icon: <Lock className="w-3 h-3" />, color: "text-amber-400" },
                { label: "Earned",    val: `${USER.totalEarned} ETH`,    icon: <TrendingUp className="w-3 h-3" />, color: "text-emerald-400" },
                { label: "Pending",   val: `${USER.pendingRewards} ETH`, icon: <Gift className="w-3 h-3" />, color: "text-indigo-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                  <div className={["flex items-center gap-1.5 text-[10px] mb-1.5", s.color].join(" ")}>
                    {s.icon} {s.label}
                  </div>
                  <p className={["text-sm font-mono font-semibold", s.color].join(" ")}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Claim rewards button */}
            <button className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 text-xs font-medium py-2.5 mb-3 flex items-center justify-center gap-2 transition-colors">
              <Gift className="w-3.5 h-3.5" />
              Claim {USER.pendingRewards} ETH Rewards
            </button>

            {/* Recent transactions */}
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
              Recent Transactions
            </p>
            <div className="rounded-2xl border border-gray-800 bg-gray-900 divide-y divide-gray-800/70">
              {TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={["w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0",
                      tx.out ? "bg-red-500/10" : "bg-emerald-500/10"].join(" ")}>
                      {tx.out
                        ? <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                        : <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-300 truncate">{tx.label}</p>
                      <p className="text-[10px] text-gray-600">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={["text-xs font-mono font-semibold",
                      tx.out ? "text-red-400" : "text-emerald-400"].join(" ")}>{tx.amount}</p>
                    <p className="text-[10px] text-gray-600">{tx.usd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── TEAM / COLLABORATION ── */}
          <div className="md:col-span-1">
            <SectionHeading
              icon={<Users className="w-3.5 h-3.5 text-gray-400" />}
              title="Team & Collaboration"
            />

            {/* Frequent collaborators */}
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
              Frequent Collaborators
            </p>
            <div className="space-y-2 mb-4">
              {COLLABORATORS.map((c) => (
                <div key={c.handle}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-3 flex items-center justify-between hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={["w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold", c.color].join(" ")}>
                      {c.initials}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-200">{c.name}</p>
                      <p className="text-[10px] text-gray-600">{c.projects} shared projects</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-[10px] rounded-full border px-2 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                      <Shield className="w-2.5 h-2.5" />
                      {c.trust}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Peer endorsements */}
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
              Recent Endorsements
            </p>
            <div className="space-y-2 mb-4">
              {[
                { from: "devmike", skill: "Smart Contract Security", stars: 5 },
                { from: "sarakdev", skill: "API Architecture", stars: 4 },
              ].map((e, i) => (
                <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-300 font-medium">{e.skill}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={["w-3 h-3",
                          si < e.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-700"].join(" ")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600">from @{e.from}</p>
                </div>
              ))}
            </div>

            {/* Open projects needing contributors */}
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
              Projects Seeking Contributors
            </p>
            <div className="space-y-2">
              {[
                { name: "ZK Rollup SDK", role: "Developer", stake: "0.8 ETH", hot: true },
                { name: "Social Graph Protocol", role: "Designer", stake: "0.4 ETH", hot: false },
              ].map((p, i) => (
                <div key={i}
                  className="rounded-xl border border-gray-800 bg-gray-900 p-3 flex items-center justify-between hover:border-gray-700 transition-colors">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-medium text-gray-200">{p.name}</p>
                      {p.hot && (
                        <div className="flex items-center gap-0.5 text-[9px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-1.5 py-0.5">
                          <Flame className="w-2.5 h-2.5" /> Hot
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600">{p.role} · Stake {p.stake}</p>
                  </div>
                  <button className="text-[10px] text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}