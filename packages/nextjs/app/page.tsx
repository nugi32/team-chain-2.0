"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coins,
  FlaskConical,
  Globe,
  Lightbulb,
  Link2,
  Lock,
  Search,
  ShieldAlert,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Suspense } from "react";
import ScrollHandler from "@/components/global/ScrollHandler";
import FadeInSection from "@/components/global/FadeInSection";

// ── Design tokens (matched to existing app style) ──────────────────────────
const C = {
  bg: "#0B0E17",
  surface: "#111827",
  surfaceHi: "#161D2E",
  border: "#1F2A3C",
  borderHi: "#2A3A52",
  cyan: "#22D3EE",
  cyanDim: "#0E7490",
  green: "#10B981",
  greenDim: "#065F46",
  amber: "#F59E0B",
  amberDim: "#92400E",
  purple: "#8B5CF6",
  purpleDim: "#4C1D95",
  red: "#EF4444",
  text: "#F1F5F9",
  muted: "#64748B",
  mutedHi: "#94A3B8",
} as const;

// ── Chain SVG icon ─────────────────────────────────────────────────────────
function ChainIcon({ size = 20, color = C.cyan }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────
function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.04em",
        color: C.mutedHi,
        background: C.surfaceHi,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "4px 12px",
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
}

function GlowDot({ color = C.green }: { color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
        flexShrink: 0,
      }}
    />
  );
}

// ── Hero visual: mock on-chain activity cards ──────────────────────────────
function ProtocolPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const statusColors: Record<string, string> = {
    InProgress: C.cyan,
    OpenRegistration: C.purple,
    Review: C.amber,
    Completed: C.green,
  };

  const tasks = [
    {
      id: "#0041",
      title: "Build REST API for task indexer",
      reward: "0.08 ETH",
      deadline: "Jul 12",
      status: "OpenRegistration",
      progress: 20,
      tags: ["Node.js", "REST"],
    },
    {
      id: "#0039",
      title: "Frontend KanbanBoard component",
      reward: "0.12 ETH",
      deadline: "Jul 8",
      status: "InProgress",
      progress: 65,
      tags: ["React", "TS"],
    },
    {
      id: "#0037",
      title: "Solidity audit: SubmissionLogic",
      reward: "0.20 ETH",
      deadline: "Jul 5",
      status: "Review",
      progress: 88,
      tags: ["Solidity"],
    },
  ];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      {/* Glow behind cards */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380,
          height: 280,
          background: `radial-gradient(ellipse, ${C.cyan}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Reputation toast */}
      <div
        style={{
          position: "absolute",
          top: -16,
          right: 0,
          background: C.surface,
          border: `1px solid ${C.green}50`,
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: `0 0 20px ${C.green}18`,
          zIndex: 2,
          animation: "floatUp 3s ease-in-out infinite",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${C.green}22`,
            border: `1px solid ${C.green}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Star size={13} color={C.green} fill={C.green} />
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: C.text }}>
            Reputation +12
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.green }}>Task #0036 accepted</div>
        </div>
      </div>

      {/* Reward toast */}
      <div
        style={{
          position: "absolute",
          bottom: -10,
          left: 0,
          background: C.surface,
          border: `1px solid ${C.amber}50`,
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: `0 0 20px ${C.amber}14`,
          zIndex: 2,
          animation: "floatUp 3s ease-in-out infinite 1.5s",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${C.amber}22`,
            border: `1px solid ${C.amber}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Coins size={13} color={C.amber} />
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: C.text }}>
            0.08 ETH released
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.amber }}>Stake + reward unlocked</div>
        </div>
      </div>

      {/* Task cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "30px 0" }}>
        {tasks.map(task => {
          const sc = statusColors[task.status] || C.mutedHi;
          return (
            <div
              key={task.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                transition: "border-color 0.3s",
                borderLeft: `2px solid ${sc}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted }}>
                  {task.id}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 10,
                    fontWeight: 500,
                    color: sc,
                    background: `${sc}18`,
                    border: `1px solid ${sc}40`,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {task.status}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.text,
                  marginBottom: 8,
                }}
              >
                {task.title}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {task.tags.map(t => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: C.muted,
                        background: C.surfaceHi,
                        border: `1px solid ${C.border}`,
                        borderRadius: 3,
                        padding: "1px 6px",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: C.green }}
                >
                  {task.reward}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${task.progress}%`,
                    background: sc,
                    borderRadius: 2,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      style={{
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        padding: "80px 24px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "35%",
          width: 700,
          height: 350,
          background: `radial-gradient(ellipse, ${C.cyan}09 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div>
          <div style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <GlowDot color={C.amber} />
            <SectionLabel>Open Beta · Sepolia Testnet</SectionLabel>
          </div>

          <h1
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(34px, 4.2vw, 56px)",
              fontWeight: 800,
              color: C.text,
              lineHeight: 1.12,
              margin: "0 0 20px",
              letterSpacing: "-0.03em",
            }}
          >
            Dev collaboration
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              with real stakes.
            </span>
          </h1>

          <p
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 17,
              color: C.mutedHi,
              lineHeight: 1.72,
              margin: "0 0 36px",
              maxWidth: 480,
            }}
          >
            TeamChain is a trustless microwork protocol for Web3 developers. Post tasks, stake ETH, track work on-chain
            — and let your GitHub profile build verifiable reputation.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 28, marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { val: "On-chain", label: "Stake & Earn" },
              { val: "GitHub", label: "Native Identity" },
              { val: "Sepolia", label: "Testnet Network" },
            ].map(s => (
              <div key={s.label}>
                <div
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: C.cyan }}
                >
                  {s.val}
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/getStarted"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                textDecoration: "none",
                padding: "12px 28px",
                borderRadius: 9,
                background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
                display: "inline-block",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started →
            </Link>
            <Link
              href="/explore"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: C.mutedHi,
                textDecoration: "none",
                padding: "12px 28px",
                borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: "transparent",
                display: "inline-block",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.borderHi;
                e.currentTarget.style.color = C.text;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.mutedHi;
              }}
            >
              Browse Tasks
            </Link>
          </div>
        </div>

        {/* Right: protocol preview */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ProtocolPreview />
        </div>
      </div>
    </section>
  );
}

// ── Testnet Warning ────────────────────────────────────────────────────────
function TestnetWarning() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      style={{
        background: `${C.amberDim}30`,
        border: `1px solid ${C.amber}35`,
        borderRadius: 10,
        maxWidth: 1200,
        margin: "0 auto 48px",
        padding: "13px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <AlertTriangle size={18} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <p
          style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: C.amber, margin: "0 0 3px" }}
        >
          Testnet Only — Sepolia Network
        </p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: `${C.amber}BB`, margin: 0, lineHeight: 1.6 }}>
          All ETH used is <strong>test ETH with no real monetary value</strong>. The protocol is in active development —
          contracts may be redeployed and data may be reset. Do not use real funds.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none",
          border: "none",
          color: `${C.amber}70`,
          cursor: "pointer",
          fontSize: 20,
          padding: "0 2px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────
const HOW_STEPS: Array<{
  num: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}> = [
    {
      num: "01",
      icon: <Link2 size={20} />,
      title: "Connect & Register",
      body: "Link your GitHub account to create your on-chain profile. A small gas fee registers your identity. No KYC, no separate account.",
      accent: C.purple,
    },
    {
      num: "02",
      icon: <ClipboardList size={20} />,
      title: "Browse & Apply",
      body: "Explore open tasks filtered by skills, stake size, and deadline. Any registered developer can apply — open registration by default.",
      accent: C.cyan,
    },
    {
      num: "03",
      icon: <Lock size={20} />,
      title: "Stake & Commit",
      body: "Lock ETH into escrow to signal commitment and protect the team from abandonment. Both creators and workers have skin in the game.",
      accent: C.amber,
    },
    {
      num: "04",
      icon: <Clock size={20} />,
      title: "Complete the Work",
      body: "Work through milestones and submit progress for creator review. Work is tracked on-chain with submission hashes.",
      accent: C.green,
    },
    {
      num: "05",
      icon: <CheckCircle2 size={20} />,
      title: "Review & Accept",
      body: "The task creator reviews the submission. If accepted, the smart contract releases payment automatically — no invoices, no chasing.",
      accent: C.cyan,
    },
    {
      num: "06",
      icon: <Trophy size={20} />,
      title: "Earn Rewards & Reputation",
      body: "Stake is returned plus your reward. Reputation score updates on-chain permanently — building a verifiable record for future work.",
      accent: C.purple,
    },
  ];

function HowItWorks() {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <SectionLabel icon={<Zap size={12} color={C.mutedHi} />}>Protocol</SectionLabel>
        <h2
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "clamp(26px, 3vw, 42px)",
            fontWeight: 800,
            color: C.text,
            margin: "16px 0 12px",
            letterSpacing: "-0.03em",
          }}
        >
          Six steps from zero to reward
        </h2>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
            color: C.muted,
            maxWidth: 500,
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          Every engagement on TeamChain follows the same accountable, on-chain flow — from first connection to final
          payout.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {HOW_STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 24,
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.borderHi;
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: `${step.accent}1A`,
                  border: `1px solid ${step.accent}35`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.accent,
                }}
              >
                {step.icon}
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted }}>
                {step.num}
              </span>
            </div>

            <h3
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: C.text,
                margin: "0 0 8px",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: C.muted,
                margin: "0 0 14px",
                lineHeight: 1.7,
              }}
            >
              {step.body}
            </p>

            <Link
              href="/howItWorks"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: step.accent,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                opacity: 0.85,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            >
              Learn more ↗
            </Link>

            {/* Corner glow */}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${step.accent}09`,
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────────────────
const FEATURES: Array<{
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}> = [
    {
      icon: <FaGithub size={18} />,
      title: "GitHub-Native Workflow",
      body: "No new tools to learn. Create tasks that map to your repos. Your GitHub history IS your reputation.",
      accent: C.purple,
    },
    {
      icon: <Lock size={18} />,
      title: "Trustless Escrow",
      body: "ETH is locked in smart contracts — not held by any company. Funds release only when work is accepted.",
      accent: C.cyan,
    },
    {
      icon: <Star size={18} />,
      title: "On-Chain Reputation",
      body: "Every task completion updates your score permanently on-chain. No fake reviews, no black-box ratings.",
      accent: C.amber,
    },
    {
      icon: <ShieldAlert size={18} />,
      title: "Penalty & Stake System",
      body: "Workers stake ETH before joining. Missed deadlines or abandoned work trigger penalties automatically.",
      accent: C.red,
    },
    {
      icon: <Globe size={18} />,
      title: "Open Task Registry",
      body: "All tasks are public and joinable. No gatekeeping, no approval queues. The blockchain is the arbiter.",
      accent: C.green,
    },
    {
      icon: <BarChart2 size={18} />,
      title: "Transparent Metrics",
      body: "Success rate, tasks completed, stake history — all public, all verifiable. On-chain by design.",
      accent: "#F472B6",
    },
  ];

function FeaturesGrid() {
  return (
    <section
      style={{
        padding: "80px 24px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel icon={<Lightbulb size={12} color={C.mutedHi} />}>Why TeamChain</SectionLabel>
          <h2
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(24px, 3vw, 38px)",
              fontWeight: 800,
              color: C.text,
              margin: "16px 0 10px",
              letterSpacing: "-0.03em",
            }}
          >
            Built for the trust gap in dev teams
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: C.muted, maxWidth: 440, margin: "0 auto" }}>
            Freelancers ghost. Scope creeps. Payments are delayed. TeamChain replaces handshakes with smart contracts.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 16 }}>
          {FEATURES.map(f => (
            <div
              key={f.title}
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "22px 20px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}55`)}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = C.border)}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: `${f.accent}18`,
                  border: `1px solid ${f.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.accent,
                  marginBottom: 14,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.text,
                  margin: "0 0 7px",
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Explore Preview ────────────────────────────────────────────────────────
const MOCK_TASKS = [
  {
    id: "#0041",
    title: "Build REST API for task metadata indexer",
    status: "OpenRegistration",
    statusColor: C.purple,
    reward: "0.08",
    deadline: "Jul 12, 2025",
    tags: ["Node.js", "REST", "MongoDB"],
  },
  {
    id: "#0038",
    title: "Implement frontend KanbanBoard component",
    status: "InProgress",
    statusColor: C.cyan,
    reward: "0.12",
    deadline: "Jul 8, 2025",
    tags: ["React", "TypeScript", "Tailwind"],
  },
  {
    id: "#0035",
    title: "Solidity audit: SubmissionLogic.sol edge cases",
    status: "Review",
    statusColor: C.amber,
    reward: "0.20",
    deadline: "Jul 5, 2025",
    tags: ["Solidity", "Security", "EVM"],
  },
];

function ExplorePreview() {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <SectionLabel icon={<Search size={12} color={C.mutedHi} />}>Explore</SectionLabel>
          <h2
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "clamp(22px, 3vw, 34px)",
              fontWeight: 800,
              color: C.text,
              margin: "14px 0 7px",
              letterSpacing: "-0.03em",
            }}
          >
            Open tasks right now
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted }}>
            Real work, real stakes — posted by developers on the testnet.
          </p>
        </div>
        <Link
          href="/explore"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: C.mutedHi,
            textDecoration: "none",
            padding: "8px 18px",
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.borderHi;
            e.currentTarget.style.color = C.text;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.mutedHi;
          }}
        >
          View all tasks →
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_TASKS.map(task => (
          <div
            key={task.id}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 11,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
              transition: "border-color 0.2s, background 0.2s",
              cursor: "pointer",
              borderLeft: `2px solid ${task.statusColor}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.borderHi;
              (e.currentTarget as HTMLDivElement).style.background = C.surfaceHi;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
              (e.currentTarget as HTMLDivElement).style.background = C.surface;
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: C.muted,
                flexShrink: 0,
                minWidth: 48,
              }}
            >
              {task.id}
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.text,
                  marginBottom: 6,
                }}
              >
                {task.title}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: C.muted,
                      background: C.surfaceHi,
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                      padding: "1px 6px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: task.statusColor,
                background: `${task.statusColor}18`,
                border: `1px solid ${task.statusColor}40`,
                borderRadius: 4,
                padding: "3px 9px",
                flexShrink: 0,
              }}
            >
              {task.status}
            </span>
            <div style={{ textAlign: "right", flexShrink: 0, minWidth: 70 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.green }}>
                {task.reward} ETH
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.muted, marginTop: 2 }}>
                {task.deadline}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Get Started CTA ────────────────────────────────────────────────────────
function GetStartedCTA() {
  return (
    <section
      style={{
        padding: "80px 24px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <GlowDot color={C.green} />
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.green, letterSpacing: "0.1em" }}
          >
            TESTNET LIVE
          </span>
        </div>

        <h2
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "clamp(24px, 4vw, 42px)",
            fontWeight: 800,
            color: C.text,
            margin: "0 0 14px",
            letterSpacing: "-0.03em",
            lineHeight: 1.18,
          }}
        >
          Ready to ship with real accountability?
        </h2>
        <p
          style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: C.muted, margin: "0 0 36px", lineHeight: 1.7 }}
        >
          Connect your GitHub, get testnet ETH from a Sepolia faucet, and start collaborating in minutes. No middlemen,
          no trust required.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/getStarted"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              padding: "13px 32px",
              borderRadius: 9,
              background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
              display: "inline-block",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Create Your Account →
          </Link>
          <Link
            href="/login"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              color: C.mutedHi,
              textDecoration: "none",
              padding: "13px 32px",
              borderRadius: 9,
              border: `1px solid ${C.border}`,
              display: "inline-block",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.borderHi;
              e.currentTarget.style.color = C.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.mutedHi;
            }}
          >
            Already have an account
          </Link>
        </div>

        {/* Footnote with inline icon */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: C.muted,
            marginTop: 20,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FlaskConical size={12} color={C.muted} />
          Sepolia testnet only · No real ETH required · Open source
        </div>
      </div>
    </section>
  );
}

// ── Developer Note ─────────────────────────────────────────────────────────
function DeveloperNote() {
  return (
    <section style={{ padding: "48px 24px 64px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          background: `${C.amberDim}25`,
          border: `1px solid ${C.amber}40`,
          borderRadius: 14,
          padding: "28px 32px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${C.amber}22`,
                border: `1px solid ${C.amber}45`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.amber,
              }}
            >
              <AlertTriangle size={16} />
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                color: C.amber,
              }}
            >
              Developer Note
            </span>
          </div>

          <h3
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: C.text,
              margin: "0 0 10px",
            }}
          >
            This is an early-stage experiment
          </h3>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: `${C.amber}CC`,
              margin: "0 0 10px",
              lineHeight: 1.75,
              maxWidth: 600,
            }}
          >
            TeamChain is a personal project exploring trustless microwork for Web3 developers. It's currently in early
            development — manual task input for now, no terminal integration yet, and the contracts are still maturing
            on Sepolia. The goal is a seamless, GitHub-native collaboration layer without the bureaucracy of traditional
            platforms.
          </p>

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: `${C.amber}99`,
              margin: 0,
              lineHeight: 1.75,
            }}
          >
            Feedback, ideas, and contributions are very welcome. If you're a developer curious about on-chain incentive
            systems or want to collaborate on the protocol itself, reach out on GitHub.
          </p>
        </div>

        {/* GitHub card */}
        <a
          href="https://github.com/nugi32"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: 8,
            padding: "18px 22px",
            background: `${C.amber}0F`,
            border: `1px solid ${C.amber}35`,
            borderRadius: 11,
            textDecoration: "none",
            minWidth: 130,
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${C.amber}65`;
            (e.currentTarget as HTMLAnchorElement).style.background = `${C.amber}18`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${C.amber}35`;
            (e.currentTarget as HTMLAnchorElement).style.background = `${C.amber}0F`;
          }}
        >
          <FaGithub size={26} color={C.amber} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: C.amber }}>
            @nugi32
          </span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: `${C.amber}88` }}>View on GitHub</span>
        </a>
      </div>
    </section>
  );
}

// ── Root page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <ScrollHandler />
      </Suspense>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
      />

      <div style={{ background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}>
        <FadeInSection>
          <HeroSection />
        </FadeInSection>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <FadeInSection>
            <TestnetWarning />
          </FadeInSection>
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />
        <FadeInSection>
          <HowItWorks />
        </FadeInSection>

        <FadeInSection>
          <FeaturesGrid />
        </FadeInSection>

        <FadeInSection>
          <ExplorePreview />
        </FadeInSection>

        <FadeInSection>
          <GetStartedCTA />
        </FadeInSection>

        <FadeInSection>
          <DeveloperNote />
        </FadeInSection>
      </div>
    </>
  );
}
