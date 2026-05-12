"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, LineChart, Line, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import {
  Shield, Lock, CheckCircle2, Gift, TrendingUp, AlertTriangle,
  ChevronDown, ChevronRight, Layers, Users, Star, Award, Zap,
  ArrowRight, Wallet, GitBranch, BarChart2, FileText, Clock,
  ArrowUpRight, ArrowDownRight, Info, Flame
} from "lucide-react";

import Link from "next/link";
/* ═══════════════════════════════════════
   CHART DATA
═══════════════════════════════════════ */
const REP_GROWTH_DATA = [
  { month: "M1",  beginner: 120, consistent: 140, top: 165 },
  { month: "M2",  beginner: 145, consistent: 195, top: 260 },
  { month: "M3",  beginner: 155, consistent: 265, top: 390 },
  { month: "M4",  beginner: 170, consistent: 340, top: 530 },
  { month: "M5",  beginner: 190, consistent: 440, top: 690 },
  { month: "M6",  beginner: 210, consistent: 560, top: 870 },
  { month: "M7",  beginner: 225, consistent: 660, top: 1020 },
  { month: "M8",  beginner: 235, consistent: 740, top: 1150 },
  { month: "M9",  beginner: 250, consistent: 820, top: 1280 },
  { month: "M10", beginner: 260, consistent: 900, top: 1400 },
  { month: "M11", beginner: 268, consistent: 960, top: 1510 },
  { month: "M12", beginner: 275, consistent: 1020, top: 1620 },
];

const STAKE_REWARD_DATA = [
  { category: "Docs",     avgStake: 22,  avgReward: 65,  ratio: 3.0 },
  { category: "Design",   avgStake: 60,  avgReward: 170, ratio: 2.8 },
  { category: "Frontend", avgStake: 55,  avgReward: 160, ratio: 2.9 },
  { category: "Backend",  avgStake: 90,  avgReward: 250, ratio: 2.8 },
  { category: "Mobile",   avgStake: 145, avgReward: 430, ratio: 3.0 },
  { category: "Research", avgStake: 85,  avgReward: 245, ratio: 2.9 },
  { category: "Audit",    avgStake: 220, avgReward: 640, ratio: 2.9 },
  { category: "Blockchain",avgStake: 290, avgReward: 860, ratio: 3.0 },
];

const SUCCESS_RATE_DATA = [
  { week: "W1",  rate: 88 },
  { week: "W2",  rate: 91 },
  { week: "W3",  rate: 86 },
  { week: "W4",  rate: 93 },
  { week: "W5",  rate: 90 },
  { week: "W6",  rate: 94 },
  { week: "W7",  rate: 92 },
  { week: "W8",  rate: 96 },
  { week: "W9",  rate: 93 },
  { week: "W10", rate: 95 },
  { week: "W11", rate: 97 },
  { week: "W12", rate: 95 },
];

const RADAR_DATA = [
  { subject: "Reliability",  Bronze: 40, Gold: 80, Platinum: 95 },
  { subject: "Speed",        Bronze: 30, Gold: 70, Platinum: 90 },
  { subject: "Quality",      Bronze: 35, Gold: 75, Platinum: 92 },
  { subject: "Collab",       Bronze: 45, Gold: 72, Platinum: 88 },
  { subject: "Stake Power",  Bronze: 20, Gold: 60, Platinum: 95 },
  { subject: "Track Record", Bronze: 25, Gold: 65, Platinum: 93 },
];

/* ═══════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════ */
const TIERS = [
  {
    name: "Bronze", color: "text-amber-700", bg: "bg-amber-900/20", border: "border-amber-700/30",
    dot: "bg-amber-700", rep: "0 – 249", stake: "Up to $50", tasks: "Entry-level",
    perks: ["Basic task access", "1 active task", "Standard review time"],
    icon: <Award className="w-4 h-4" />,
  },
  {
    name: "Silver", color: "text-gray-300", bg: "bg-gray-700/20", border: "border-gray-600/30",
    dot: "bg-gray-400", rep: "250 – 599", stake: "Up to $200", tasks: "Mid-level",
    perks: ["Priority task feed", "2 active tasks", "Faster review queue"],
    icon: <Award className="w-4 h-4" />,
  },
  {
    name: "Gold", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30",
    dot: "bg-yellow-400", rep: "600 – 999", stake: "Up to $600", tasks: "Senior-level",
    perks: ["Featured in talent pool", "5 active tasks", "Arbitration priority"],
    icon: <Award className="w-4 h-4" />,
  },
  {
    name: "Platinum", color: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/30",
    dot: "bg-cyan-400", rep: "1000+", stake: "Unlimited",  tasks: "Expert / Lead",
    perks: ["Governance voting rights", "Unlimited tasks", "Dispute arbitration access"],
    icon: <Award className="w-4 h-4" />,
  },
];

const REP_EVENTS = [
  { event: "Milestone completed on time", delta: "+10 – +25", direction: "up",   category: "Completion" },
  { event: "Full task completed",         delta: "+30 – +60", direction: "up",   category: "Completion" },
  { event: "5-star peer review received", delta: "+5 – +15",  direction: "up",   category: "Social" },
  { event: "Endorsement from Gold+ user", delta: "+8",         direction: "up",   category: "Social" },
  { event: "Dispute resolved in your favor", delta: "+20",     direction: "up",   category: "Dispute" },
  { event: "Milestone submitted late",    delta: "−10 – −20", direction: "down", category: "Penalty" },
  { event: "Task abandoned mid-progress", delta: "−25 – −50", direction: "down", category: "Penalty" },
  { event: "Stake slashed (dispute lost)",delta: "−30 – −80", direction: "down", category: "Penalty" },
  { event: "Inactivity (90+ days)",       delta: "−5 / month", direction: "down", category: "Decay" },
  { event: "Quality flag from reviewer",  delta: "−10 – −15", direction: "down", category: "Penalty" },
];

const FEE_TABLE = [
  { action: "Profile Registration",   fee: "~$0.01 – $0.05", paidBy: "Worker",   note: "One-time on-chain write" },
  { action: "Stake Commitment",       fee: "~0.1% of stake",  paidBy: "Worker",   note: "Locked in escrow contract" },
  { action: "Milestone Submission",   fee: "~$0.005 – $0.02", paidBy: "Worker",   note: "Proof-of-work signature" },
  { action: "Reward Payout",          fee: "2% of reward",    paidBy: "Protocol", note: "Deducted from gross reward" },
  { action: "Dispute Filing",         fee: "$5 flat",         paidBy: "Claimant", note: "Refunded if you win" },
  { action: "Stake Withdrawal",       fee: "~$0.01",          paidBy: "Worker",   note: "After task completion" },
  { action: "Cross-Chain Transfer",   fee: "Bridge fee",      paidBy: "User",     note: "Varies by chain" },
];

const STEPS = [
  {
    number: "01", icon: <Wallet className="w-5 h-5" />, color: "indigo",
    title: "Connect & Register",
    desc: "Connect your wallet and create your on-chain profile. A small gas fee registers your identity in the Team Chain registry.",
    detail: "Your profile stores reputation score, tier, stake history, and completed work — all verifiable on-chain.",
  },
  {
    number: "02", icon: <FileText className="w-5 h-5" />, color: "purple",
    title: "Browse & Apply",
    desc: "Explore open tasks filtered by your skills, reputation, and preferred stake size. Click any card to preview details.",
    detail: "Each task shows required reputation, stake, reward, deadline, and team trust score so you can assess fit instantly.",
  },
  {
    number: "03", icon: <Lock className="w-5 h-5" />, color: "amber",
    title: "Stake & Commit",
    desc: "Stake the required ETH into the protocol escrow. This signals serious intent and protects the team from abandonment.",
    detail: "Your stake is locked until the task is completed or resolved. It is returned in full on successful completion.",
  },
  {
    number: "04", icon: <GitBranch className="w-5 h-5" />, color: "cyan",
    title: "Complete Milestones",
    desc: "Work through milestones and submit progress. Peer reviewers validate each submission on-chain.",
    detail: "Each milestone approval earns reputation. Late submissions incur small reputation penalties. Quality matters.",
  },
  {
    number: "05", icon: <CheckCircle2 className="w-5 h-5" />, color: "emerald",
    title: "Get Reviewed",
    desc: "After all milestones pass, the team signs off on the full delivery. Disputes are resolved by arbitration.",
    detail: "Reviews are staked too — reviewers risk their own reputation for inaccurate approvals.",
  },
  {
    number: "06", icon: <Gift className="w-5 h-5" />, color: "green",
    title: "Earn Rewards & Reputation",
    desc: "Your stake is returned plus your earned reward. Reputation is updated on-chain reflecting your performance.",
    detail: "Reputation compounds — completing more tasks, on time, at high quality accelerates your tier progression.",
  },
];

const FAQS = [
  {
    q: "What happens if I miss a deadline?",
    a: "Missing a milestone deadline incurs a reputation penalty of 10–20 REP. If you abandon a task after staking, you forfeit 25–80 REP and a portion of your stake goes to the protocol treasury. The exact amount depends on task progress.",
  },
  {
    q: "How are disputes handled?",
    a: "Either party can open a dispute for a $5 fee (refunded if you win). A panel of Platinum-tier arbitrators reviews evidence and votes. The losing party loses reputation and may have stake slashed. Resolution typically takes 48–72 hours.",
  },
  {
    q: "Is my stake safe?",
    a: "Stakes are held in audited escrow smart contracts. They are only released on task completion, returned on cancellation, or partially redistributed on dispute resolution. Contracts are publicly verifiable on-chain.",
  },
  {
    q: "Can teams post tasks for free?",
    a: "Teams pay a small listing fee (~$1–5) and must lock the reward amount in escrow before a task goes live. This prevents teams from posting tasks they cannot pay for.",
  },
  {
    q: "How long does reputation take to build?",
    a: "A consistent contributor completing 2–3 mid-level tasks per month can reach Silver tier in roughly 2–3 months and Gold in 6–9 months. Top performers completing high-value tasks reach Gold faster.",
  },
  {
    q: "What chains are supported?",
    a: "Team Chain currently supports Ethereum mainnet, Arbitrum, Optimism, and Polygon. Cross-chain staking is available via our CCIP integration. More chains are planned for Q3 2026.",
  },
];

/* ═══════════════════════════════════════
   CUSTOM TOOLTIP
═══════════════════════════════════════ */
function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 shadow-xl text-xs space-y-1">
      <p className="text-gray-400 font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-semibold text-white">{prefix}{p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   SECTION WRAPPER
═══════════════════════════════════════ */
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={["mb-20", className].join(" ")}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] text-indigo-300 font-medium mb-4">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">{children}</h2>;
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 leading-relaxed max-w-xl mb-8">{children}</p>;
}

/* ═══════════════════════════════════════
   STEP COLORS
═══════════════════════════════════════ */
const STEP_COLOR: Record<string, string> = {
  indigo:  "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  purple:  "border-purple-500/40 bg-purple-500/10 text-purple-300",
  amber:   "border-amber-500/40 bg-amber-500/10 text-amber-300",
  cyan:    "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  green:   "border-green-500/40 bg-green-500/10 text-green-300",
};
const STEP_LINE: Record<string, string> = {
  indigo:  "bg-indigo-500", purple: "bg-purple-500", amber: "bg-amber-500",
  cyan:    "bg-cyan-500",   emerald: "bg-emerald-500", green: "bg-green-500",
};

/* ═══════════════════════════════════════
   FAQ ITEM
═══════════════════════════════════════ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={["rounded-2xl border transition-colors duration-200",
      open ? "border-indigo-500/30 bg-indigo-500/5" : "border-gray-800 bg-gray-900"].join(" ")}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-medium text-gray-200 leading-snug">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 mt-0.5">
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-indigo-500/20 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   STAT PILL
═══════════════════════════════════════ */
function StatPill({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className={["rounded-2xl border p-5", accent ?? "border-gray-800 bg-gray-900"].join(" ")}>
      <div className="flex items-center gap-2 mb-3 text-gray-500">{icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [repFilter, setRepFilter] = useState<"all" | "up" | "down">("all");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto px-4 md:px-6 py-14">

        {/* ══════════════════════════════════
            HERO
        ══════════════════════════════════ */}
        <Section>
          <div className="text-center max-w-2xl mx-auto">
            <SectionLabel>
              <Zap className="w-3 h-3" /> Protocol Overview
            </SectionLabel>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              How <span className="text-indigo-400">Team Chain</span> Works
            </h1>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base mb-10">
              Team Chain is a stake-backed collaboration protocol. Workers and teams commit real value
              on-chain — aligning incentives, enforcing accountability, and rewarding quality
              with verifiable reputation.
            </p>

            {/* Stat pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <StatPill icon={<Users className="w-4 h-4" />}    label="Active Workers"    value="3,840"  sub="Across 12 chains" accent="border-indigo-500/30 bg-indigo-500/5" />
              <StatPill icon={<CheckCircle2 className="w-4 h-4" />} label="Tasks Completed" value="12,400+" sub="Since genesis" />
              <StatPill icon={<Layers className="w-4 h-4" />}   label="Total Staked"      value="$2.1M"  sub="In escrow now" accent="border-amber-500/20 bg-amber-500/5" />
              <StatPill icon={<TrendingUp className="w-4 h-4" />} label="Avg Success Rate" value="94.2%"  sub="Last 90 days" accent="border-emerald-500/20 bg-emerald-500/5" />
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════
            STEP-BY-STEP FLOW
        ══════════════════════════════════ */}
        <Section id="steps">
          <SectionLabel><ChevronRight className="w-3 h-3" /> The Process</SectionLabel>
          <SectionTitle>Six steps from zero to reward</SectionTitle>
          <SectionSub>
            Every engagement on Team Chain follows the same accountable, on-chain flow — from first
            connection to final payout.
          </SectionSub>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-indigo-500/40 via-cyan-500/30 to-green-500/40 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  className={["rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden",
                    activeStep === i
                      ? `${STEP_COLOR[step.color]} border-opacity-100`
                      : "border-gray-800 bg-gray-900 hover:border-gray-700"].join(" ")}
                >
                  {/* Progress line */}
                  <div className={["h-0.5 w-full", activeStep === i ? STEP_LINE[step.color] : "bg-gray-800"].join(" ")} />

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={["w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0", STEP_COLOR[step.color]].join(" ")}>
                        {step.icon}
                      </div>
                      <span className="text-[10px] font-mono text-gray-600">{step.number}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>

                    <AnimatePresence>
                      {activeStep === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-current/20 text-xs text-gray-300 leading-relaxed opacity-80">
                            {step.detail}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button className="mt-3 text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors">
                      {activeStep === i ? "Hide detail" : "Learn more"}
                      <ChevronDown className={["w-3 h-3 transition-transform", activeStep === i ? "rotate-180" : ""].join(" ")} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════
            CHARTS ROW 1
        ══════════════════════════════════ */}
        <Section id="charts">
          <SectionLabel><BarChart2 className="w-3 h-3" /> Data & Analytics</SectionLabel>
          <SectionTitle>Reputation & rewards by the numbers</SectionTitle>
          <SectionSub>
            Real protocol data shows how consistent contributors grow reputation and how stake
            compares to reward across task categories.
          </SectionSub>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Reputation growth chart */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Reputation Growth Over 12 Months</p>
                <p className="text-xs text-gray-500 mt-1">Three contributor profiles — casual, consistent, top performer</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={REP_GROWTH_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gConsistent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gBeginner" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip suffix=" REP" />} />
                  <Area type="monotone" dataKey="top"        name="Top Performer"  stroke="#6366f1" fill="url(#gTop)"        strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="consistent" name="Consistent"     stroke="#06b6d4" fill="url(#gConsistent)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="beginner"   name="Casual"         stroke="#475569" fill="url(#gBeginner)"   strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {[
                  { color: "#6366f1", label: "Top Performer" },
                  { color: "#06b6d4", label: "Consistent" },
                  { color: "#475569", label: "Casual" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <div className="w-2.5 h-0.5 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Stake vs Reward chart */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Avg Stake vs. Reward by Category</p>
                <p className="text-xs text-gray-500 mt-1">Average USD values across all completed tasks</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={STAKE_REWARD_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip prefix="$" />} />
                  <Bar dataKey="avgStake"  name="Avg Stake"  fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} opacity={0.8} />
                  <Bar dataKey="avgReward" name="Avg Reward" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3">
                {[{ color: "#f59e0b", label: "Avg Stake" }, { color: "#10b981", label: "Avg Reward" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color, opacity: 0.8 }} />
                    {l.label}
                  </div>
                ))}
                <span className="text-[10px] text-gray-600 ml-auto">~3× average multiplier</span>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Success rate line */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Protocol-Wide Success Rate (12 Weeks)</p>
                <p className="text-xs text-gray-500 mt-1">% of tasks completed without dispute</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={SUCCESS_RATE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gSuccess" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip suffix="%" />} />
                  <Line
                    type="monotone" dataKey="rate" name="Success Rate"
                    stroke="url(#gSuccess)" strokeWidth={2.5}
                    dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-gray-600">Consistently above 85% target</span>
                <span className="text-xs font-semibold text-emerald-400">94.2% avg</span>
              </div>
            </div>

            {/* Tier radar */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Tier Capability Comparison</p>
                <p className="text-xs text-gray-500 mt-1">Bronze vs Gold vs Platinum contributor profiles</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={RADAR_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 9 }} />
                  <Radar name="Bronze"   dataKey="Bronze"   stroke="#92400e" fill="#92400e" fillOpacity={0.15} strokeWidth={1.5} />
                  <Radar name="Gold"     dataKey="Gold"     stroke="#eab308" fill="#eab308" fillOpacity={0.15} strokeWidth={1.5} />
                  <Radar name="Platinum" dataKey="Platinum" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={1.5} />
                  <Tooltip content={<ChartTooltip suffix=" pts" />} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 flex-wrap justify-center">
                {[{ color: "#92400e", label: "Bronze" }, { color: "#eab308", label: "Gold" }, { color: "#06b6d4", label: "Platinum" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <div className="w-2.5 h-0.5 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════
            TIER TABLE
        ══════════════════════════════════ */}
        <Section id="tiers">
          <SectionLabel><Award className="w-3 h-3" /> Tier System</SectionLabel>
          <SectionTitle>Four tiers of on-chain credibility</SectionTitle>
          <SectionSub>
            Your tier determines which tasks you can access, how much you can stake, and what
            protocol privileges you hold.
          </SectionSub>

          {/* Tier cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {TIERS.map((tier) => (
              <div key={tier.name} className={["rounded-2xl border p-5", tier.bg, tier.border].join(" ")}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={["w-2 h-2 rounded-full", tier.dot].join(" ")} />
                  <span className={["text-sm font-bold", tier.color].join(" ")}>{tier.name}</span>
                </div>
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rep Range</span>
                    <span className="text-gray-300 font-mono">{tier.rep}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Stake</span>
                    <span className="text-gray-300">{tier.stake}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Task Level</span>
                    <span className="text-gray-300">{tier.tasks}</span>
                  </div>
                </div>
                <div className="border-t border-gray-800/60 pt-3 space-y-1.5">
                  {tier.perks.map((p) => (
                    <div key={p} className="flex items-start gap-2 text-[11px] text-gray-400">
                      <CheckCircle2 className={["w-3 h-3 flex-shrink-0 mt-0.5", tier.color].join(" ")} />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed tier table */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-semibold text-gray-300">Full Tier Comparison</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Feature</th>
                    <th className="text-center px-4 py-3 text-amber-700 font-semibold">Bronze</th>
                    <th className="text-center px-4 py-3 text-gray-300 font-semibold">Silver</th>
                    <th className="text-center px-4 py-3 text-yellow-400 font-semibold">Gold</th>
                    <th className="text-center px-4 py-3 text-cyan-300 font-semibold">Platinum</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Reputation Range",       "0–249",     "250–599",  "600–999",  "1000+"],
                    ["Active Tasks Limit",     "1",         "2",        "5",        "Unlimited"],
                    ["Max Stake per Task",     "$50",       "$200",     "$600",     "Unlimited"],
                    ["Review Priority",        "Standard",  "Elevated", "Priority", "Instant"],
                    ["Governance Vote",        "—",         "—",        "Advisory", "Full"],
                    ["Dispute Arbitration",    "—",         "—",        "—",        "✓"],
                    ["Featured in Talent Pool","—",         "—",        "✓",        "✓"],
                    ["REP Decay Rate",         "−5/mo*",    "−3/mo*",   "−1/mo*",   "None"],
                    ["Cross-Chain Staking",    "—",         "✓",        "✓",        "✓"],
                    ["Protocol Fee Discount",  "0%",        "5%",       "10%",      "20%"],
                  ].map(([feature, bronze, silver, gold, platinum], idx) => (
                    <tr key={feature} className={["border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors",
                      idx % 2 === 0 ? "" : "bg-gray-800/10"].join(" ")}>
                      <td className="px-5 py-3 text-gray-400">{feature}</td>
                      <td className="px-4 py-3 text-center text-amber-700/80">{bronze}</td>
                      <td className="px-4 py-3 text-center text-gray-400">{silver}</td>
                      <td className="px-4 py-3 text-center text-yellow-400/90">{gold}</td>
                      <td className="px-4 py-3 text-center text-cyan-300/90">{platinum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-600 px-5 py-3 border-t border-gray-800">
              * REP decay only applies during sustained inactivity (90+ consecutive days without a completed task).
            </p>
          </div>
        </Section>

        {/* ══════════════════════════════════
            REPUTATION EVENTS TABLE
        ══════════════════════════════════ */}
        <Section id="reputation">
          <SectionLabel><Shield className="w-3 h-3" /> Reputation System</SectionLabel>
          <SectionTitle>What changes your reputation score</SectionTitle>
          <SectionSub>
            Every on-chain action is logged and auditable. Reputation is earned through delivery
            and lost through failure — transparently, every time.
          </SectionSub>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-4">
            {[
              { key: "all",  label: "All Events" },
              { key: "up",   label: "Gains" },
              { key: "down", label: "Penalties" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setRepFilter(f.key as typeof repFilter)}
                className={["rounded-xl px-4 py-1.5 text-xs font-medium transition-colors",
                  repFilter === f.key
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                    : "border border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-300"].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3.5 text-gray-500 font-medium w-8"></th>
                    <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Event</th>
                    <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Category</th>
                    <th className="text-right px-5 py-3.5 text-gray-500 font-medium">REP Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {REP_EVENTS
                      .filter((e) => repFilter === "all" || e.direction === repFilter)
                      .map((e, idx) => (
                      <motion.tr
                        key={e.event}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className={["w-6 h-6 rounded-lg flex items-center justify-center",
                            e.direction === "up" ? "bg-emerald-500/10" : "bg-red-500/10"].join(" ")}>
                            {e.direction === "up"
                              ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                              : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-300">{e.event}</td>
                        <td className="px-3 py-3">
                          <span className={["rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            e.category === "Completion" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                            e.category === "Social"     ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5"   :
                            e.category === "Dispute"    ? "text-amber-400 border-amber-500/20 bg-amber-500/5"     :
                            e.category === "Decay"      ? "text-purple-400 border-purple-500/20 bg-purple-500/5"   :
                            "text-red-400 border-red-500/20 bg-red-500/5"].join(" ")}>
                            {e.category}
                          </span>
                        </td>
                        <td className={["px-5 py-3 text-right font-mono font-semibold",
                          e.direction === "up" ? "text-emerald-400" : "text-red-400"].join(" ")}>
                          {e.delta}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════
            FEE TABLE
        ══════════════════════════════════ */}
        <Section id="fees">
          <SectionLabel><Layers className="w-3 h-3" /> Fee Structure</SectionLabel>
          <SectionTitle>Transparent on-chain fees</SectionTitle>
          <SectionSub>
            All fees are fixed by the protocol and visible before any action is signed. No hidden
            costs, no variable platform markups.
          </SectionSub>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-800 flex items-center gap-2 bg-gray-800/30">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs text-gray-400">
                Gas fees vary by network congestion. Estimates are based on Ethereum mainnet at 20 Gwei.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Action</th>
                    <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Fee</th>
                    <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Paid By</th>
                    <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {FEE_TABLE.map((row, idx) => (
                    <tr key={row.action}
                      className={["border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors",
                        idx % 2 === 0 ? "" : "bg-gray-800/10"].join(" ")}>
                      <td className="px-5 py-3.5 text-gray-200 font-medium">{row.action}</td>
                      <td className="px-3 py-3.5">
                        <span className="font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1">
                          {row.fee}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-gray-400">{row.paidBy}</td>
                      <td className="px-5 py-3.5 text-gray-500">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════
            FAQ
        ══════════════════════════════════ */}
        <Section id="faq">
          <SectionLabel><Info className="w-3 h-3" /> FAQ</SectionLabel>
          <SectionTitle>Common questions</SectionTitle>
          <SectionSub>
            Everything you need to know before committing your first stake.
          </SectionSub>
          <div className="space-y-2.5">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </Section>

        {/* ══════════════════════════════════
            CTA BOTTOM
        ══════════════════════════════════ */}
        <Section>
          <div className="rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] text-indigo-300 font-medium mb-4">
                <Flame className="w-3 h-3" /> Ready to start?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Start building your on-chain reputation
              </h2>
              <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8">
                Connect your wallet, create your profile, and browse open tasks — all in under 5 minutes.
                Your first milestone is one click away.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20">
                <Link href="/createAccount" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Connect & Create Profile
                  </Link>
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900 hover:border-gray-600 px-6 py-3 text-sm text-gray-300 transition-colors">
                <Link href="/explore" className="flex items-center gap-2">
                  Browse Open Tasks <ArrowRight className="w-4 h-4" />
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}