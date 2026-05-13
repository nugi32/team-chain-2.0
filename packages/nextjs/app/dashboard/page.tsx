"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Activity, Coins, Users,
} from "lucide-react";

import KanbanBoard from "@/components/dashboard/KanbanBoard";
import RightSidebar from "@/components/dashboard/RightSidebar";
import TopStats from "@/components/dashboard/TopStats";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import ReputationActivity from "@/components/dashboard/ReputationActivity";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import TeamCollaboration from "@/components/dashboard/TeamCollaboration";
import SectionHeading from "@/components/dashboard/SectionHeading";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
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

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function TeamChainDashboard() {
  const [kanbanTab, setKanbanTab] = useState<KanbanTab>("Active");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <main className="relative max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        {/* Greeting */}
        <GreetingHeader user={USER} />

        {/* Stats row */}
        <TopStats user={USER} />

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-6">
          {/* Kanban Board */}
          <KanbanBoard
            tabs={KANBAN_TABS}
            activeTab={kanbanTab}
            onTabChange={setKanbanTab}
            tasks={TASKS}
          />

          {/* Right Sidebar */}
          <RightSidebar
            walletAddress={USER.wallet}
            chain={USER.chain}
            availableBalance={USER.availableBalance}
            activeStake={USER.activeStake}
            invitations={INVITATIONS}
            deadlines={TASKS.filter(
              (t) => t.tab === "Active" || t.tab === "Review"
            ).slice(0, 4)}
          />
        </div>

        {/* Bottom grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <ReputationActivity activities={ACTIVITY} />
          <FinancialSummary
            availableBalance={USER.availableBalance}
            activeStake={USER.activeStake}
            totalEarned={USER.totalEarned}
            pendingRewards={USER.pendingRewards}
            transactions={TRANSACTIONS}
          />
          <TeamCollaboration collaborators={COLLABORATORS} />
        </div>
      </main>
    </div>
  );
}