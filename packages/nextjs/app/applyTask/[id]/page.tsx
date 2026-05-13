"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Clock,
  Star,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ExternalLink,
  FileText,
  Code2,
  GitBranch,
  Award,
  TrendingUp,
  Info,
  Lock,
  Unlock,
  BadgeCheck,
  CircleDot,
  ChevronRight,
  Trophy,
} from "lucide-react";

import StatPill from "@/components/task-apply/StatPill";
import MilestoneRow from "@/components/task-apply/MilestoneRow";
import SectionLabel from "@/components/task-apply/SectionLabel";
import BadgeChip from "@/components/task-apply/BadgeChip";
import StakePanel from "@/components/task-apply/StakePanel";
import SuccessOverlay from "@/components/task-apply/SuccessOverlay";
import RelatedTasks from "@/components/task-apply/RelatedTasks";
import TeamSection from "@/components/task-apply/TeamSection";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TASK = {
  id: "task-001",
  title: "Frontend Milestone for DAO Portal",
  project: "OpenDAO Collective",
  category: "Frontend Dev",
  objective:
    "Build a fully functional wallet connection interface with transaction history UI, supporting MetaMask, WalletConnect, and Coinbase Wallet.",
  stakeRequired: 40,
  reward: 120,
  currency: "USDC",
  deadline: "5 days",
  deadlineDate: "May 17, 2026",
  reputationRequired: 72,
  userReputation: 89,
  slots: { open: 2, total: 3 },
  applicants: 7,
  estimatedHours: "20–30h",
  riskBadge: "Low Risk",
  riskColor: "emerald",
  tags: ["React", "Ethers.js", "Wagmi", "TypeScript", "TailwindCSS"],
  milestones: [
    { label: "Wallet connect modal + provider detection", pct: 30 },
    { label: "Transaction history feed with pagination", pct: 40 },
    { label: "Mobile responsive + accessibility pass", pct: 20 },
    { label: "Unit tests + PR review", pct: 10 },
  ],
  teamRep: 94,
  teamCompletionRate: 97,
  teamTasksDone: 38,
  teamName: "OpenDAO Collective",
  teamMembers: 12,
  teamAvatar: "OC",
  teamCompletions: 38,
  description: `The DAO Portal needs a polished wallet integration layer. Currently users must use a raw JSON-RPC call to connect — this milestone delivers a proper modal-based flow covering detection, switching, disconnect, and error states.

The transaction history panel should pull from an indexer (provided) and display paginated entries with filters for type (send, receive, contract, stake).

Deliverables must pass our internal accessibility checklist and work on mobile Safari.`,
  requiredDocs: ["GitHub repo link", "Screen recording of wallet flow", "Test coverage report"],
};

const TEAM_COLLAB = [
  { name: "0xmara.eth", rep: 91, role: "Lead Dev", avatar: "M", color: "indigo" },
  { name: "devchain.eth", rep: 88, role: "Reviewer", avatar: "D", color: "violet" },
  { name: "you", rep: 89, role: "Applicant", avatar: "Y", color: "emerald", isYou: true },
];

const RELATED = [
  {
    id: "rel-1",
    title: "Smart Contract Testing Suite",
    project: "OpenDAO Collective",
    stake: "25",
    reward: "80",
    deadline: "3 days",
    skills: ["Solidity", "Hardhat", "Chai"],
    teamAvatar: "OC",
    avatarColor: "from-blue-600 to-indigo-600",
  },
  {
    id: "rel-2",
    title: "Governance UI Dashboard",
    project: "OpenDAO Collective",
    stake: "50",
    reward: "150",
    deadline: "7 days",
    skills: ["React", "D3.js", "Web3.js"],
    teamAvatar: "OC",
    avatarColor: "from-violet-600 to-purple-600",
  },
];

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function TaskApplyPage() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const repOk = TASK.userReputation >= TASK.reputationRequired;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Subtle grid bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-2.5 py-0.5">
              {TASK.category}
            </span>
            <span
              className={`text-[10px] font-semibold border rounded-full px-2.5 py-0.5 ${
                riskColors[TASK.riskColor]
              }`}
            >
              {TASK.riskBadge}
            </span>
            <span className="text-[10px] text-gray-500 border border-gray-800 rounded-full px-2.5 py-0.5">
              {TASK.slots.open} slots left
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{TASK.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>by</span>
            <span className="font-medium text-gray-200">{TASK.project}</span>
            <span className="text-gray-700">•</span>
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>{TASK.teamRep} team rep</span>
            <span className="text-gray-700">•</span>
            <span>{TASK.teamCompletionRate}% completion rate</span>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatPill icon={Lock} label="Stake Required" value={`${TASK.stakeRequired} USDC`} />
          <StatPill icon={TrendingUp} label="Reward" value={`${TASK.reward} USDC`} accent />
          <StatPill icon={Clock} label="Deadline" value={TASK.deadline} />
          <StatPill
            icon={Shield}
            label="Min Reputation"
            value={`${TASK.reputationRequired} REP`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left / main ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Objective */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-2">Objective</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{TASK.objective}</p>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <button
                className="w-full flex items-center justify-between"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                <h2 className="text-sm font-semibold text-gray-200">Full Description</h2>
                {descExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {descExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-400 leading-relaxed mt-3 whitespace-pre-line">
                      {TASK.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!descExpanded && (
                <p className="text-[11px] text-indigo-400 mt-2">Click to expand…</p>
              )}
            </div>

            {/* Milestones */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-3">
                Milestones & Reward Split
              </h2>
              {TASK.milestones.map((m, i) => (
                <MilestoneRow key={i} label={m.label} pct={m.pct} idx={i} />
              ))}
              <p className="text-[10px] text-gray-600 mt-3">
                Rewards are released per milestone upon reviewer approval.
              </p>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {TASK.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs text-gray-300 border border-gray-700 bg-gray-800 rounded-lg px-3 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Required deliverables */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-3">Submission Deliverables</h2>
              <ul className="space-y-2">
                {TASK.requiredDocs.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <CircleDot className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Team members */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-3">
                Who You'll Work With
              </h2>
              <div className="space-y-3">
                {TEAM_COLLAB.map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-${m.color}-500/20 border border-${m.color}-500/30 flex items-center justify-center text-xs font-bold text-${m.color}-300`}
                    >
                      {m.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-200 flex items-center gap-1.5">
                        {m.name}
                        {m.isYou && (
                          <span className="text-[9px] text-indigo-400 border border-indigo-500/30 rounded-full px-1.5">
                            you
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500">{m.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-gray-300">{m.rep}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RELATED TASKS ── */}
            <RelatedTasks tasks={RELATED} />

            {/* Team card */}
            <TeamSection
              teamAvatar={TASK.teamAvatar}
              teamName={TASK.teamName}
              teamRep={TASK.teamRep}
              teamCompletions={TASK.teamCompletions}
              teamMembers={TASK.teamMembers}
            />
          </div>

          {/* ─── Right sidebar ─── */}
          <div className="space-y-4">
            {/* Rep check */}
            <div
              className={`rounded-2xl border p-4 flex gap-3 ${
                repOk
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              {repOk ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`text-xs font-semibold ${
                    repOk ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {repOk ? "Reputation Eligible" : "Reputation Too Low"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Your rep:{" "}
                  <span className="text-white font-semibold">{TASK.userReputation}</span>{" "}
                  / Required:{" "}
                  <span className="font-semibold">{TASK.reputationRequired}</span>
                </p>
              </div>
            </div>

            {/* Stake panel */}
            <StakePanel
              step={step}
              setStep={setStep}
              onConfirm={() => setSuccess(true)}
              task={TASK}
            />

            {/* Additional info */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Task Details
              </p>
              {[
                ["Applicants", `${TASK.applicants} applied`],
                ["Est. effort", TASK.estimatedHours],
                ["Team size", `${TASK.teamMembers} members`],
                ["Tasks done", `${TASK.teamTasksDone} completed`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-gray-300 font-medium">{v}</span>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View on-chain contract
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && <SuccessOverlay onClose={() => setSuccess(false)} taskTitle={TASK.title} />}
      </AnimatePresence>
    </div>
  );
}

const riskColors: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
};