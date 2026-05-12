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

/* ─── HELPERS ───────────────────────────────────────────────── */
const riskColors: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STEPS = [
  { id: 1, label: "Review Task" },
  { id: 2, label: "Stake USDC" },
  { id: 3, label: "Confirm & Sign" },
];

/* ─── SUBCOMPONENTS ─────────────────────────────────────────── */
function StatPill({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${
        accent
          ? "border-indigo-500/30 bg-indigo-500/10"
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <Icon className={`w-4 h-4 ${accent ? "text-indigo-400" : "text-gray-400"}`} />
      <div>
        <p className="text-[10px] text-gray-500 leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${accent ? "text-indigo-300" : "text-white"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function MilestoneRow({
  label,
  pct,
  idx,
}: {
  label: string;
  pct: number;
  idx: number;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-800/60 last:border-0">
      <div className="w-5 h-5 rounded-full border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[9px] font-bold text-indigo-400">{idx + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 leading-snug">{label}</p>
      </div>
      <span className="text-[10px] font-semibold text-indigo-400 flex-shrink-0">{pct}%</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-indigo-500 rounded-full" />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

function BadgeChip({ badge }: { badge: string }) {
  return (
    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
      {badge}
    </span>
  );
}

/* ─── STAKE PANEL ───────────────────────────────────────────── */
function StakePanel({
  step,
  setStep,
  onConfirm,
}: {
  step: number;
  setStep: (n: number) => void;
  onConfirm: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [staking, setStaking] = useState(false);

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      setStep(3);
    }, 1500);
  };

  const handleSign = () => {
    setStaking(true);
    setTimeout(() => {
      setStaking(false);
      onConfirm();
    }, 1800);
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Step progress */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                    step >= s.id
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="w-3 h-3" /> : s.id}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    step >= s.id ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 mx-1 transition-colors ${
                    step > s.id ? "bg-indigo-500/60" : "bg-gray-800"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Step 1 — Review */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Stake-Backed Commitment</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Joining this task locks{" "}
                  <span className="text-white font-semibold">40 USDC</span> as stake. If you
                  abandon without resolution, part of your stake may be slashed.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Stake Summary
              </p>
              {[
                ["You lock", "40 USDC"],
                ["Potential reward", "+120 USDC"],
                ["Net if successful", "+80 USDC"],
                ["Slash if abandoned", "Up to −20 USDC"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-gray-500">{k}</span>
                  <span
                    className={`font-semibold ${
                      v.startsWith("+")
                        ? "text-emerald-400"
                        : v.startsWith("Up to")
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  agreed
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-gray-600 group-hover:border-gray-500"
                }`}
              >
                {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                I understand the stake terms and commit to completing this task by{" "}
                <span className="text-white font-medium">{TASK.deadlineDate}</span>.
              </p>
            </label>

            <button
              onClick={() => agreed && setStep(2)}
              disabled={!agreed}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
            >
              Continue to Stake
            </button>
          </motion.div>
        )}

        {/* Step 2 — Stake */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Wallet</span>
                <span className="text-xs font-mono text-gray-300">0x4a2f...8e3c</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">USDC Balance</span>
                <span className="text-xs font-semibold text-white">320.00 USDC</span>
              </div>
              <div className="h-px bg-gray-800" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Amount to Lock</span>
                <span className="text-sm font-bold text-indigo-300">40.00 USDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Remaining</span>
                <span className="text-xs text-gray-300">280.00 USDC</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-3.5 flex gap-3">
              <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Funds are locked in the Team Chain smart contract escrow and released automatically
                upon task approval.
              </p>
            </div>

            <button
              onClick={handleStake}
              disabled={staking}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              {staking ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Locking Stake…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Lock 40 USDC
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 3 — Sign */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">Stake Locked ✓</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  40 USDC escrowed. Sign to finalize your commitment.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Signing Message
              </p>
              <p className="text-[11px] font-mono text-gray-400 leading-relaxed break-all">
                "I commit to task-001 on Team Chain. Stake: 40 USDC. Deadline:{" "}
                {TASK.deadlineDate}. Chain: Mainnet."
              </p>
            </div>

            <button
              onClick={handleSign}
              disabled={staking}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              {staking ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing…
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  Sign & Join Task
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── SUCCESS OVERLAY ───────────────────────────────────────── */
function SuccessOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-gray-900 p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">You're In!</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          You've successfully joined{" "}
          <span className="text-white font-medium">{TASK.title}</span>. Your stake of{" "}
          <span className="text-indigo-300 font-semibold">40 USDC</span> is now locked.
        </p>
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
          >
            Go to Dashboard
          </button>
          <button className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-sm text-gray-300 transition-colors">
            View Task Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
            <div>
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
            <StakePanel step={step} setStep={setStep} onConfirm={() => setSuccess(true)} />

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
        {success && <SuccessOverlay onClose={() => setSuccess(false)} />}
      </AnimatePresence>
    </div>
  );
}