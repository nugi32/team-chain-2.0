"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lock, TrendingUp, CheckCircle2, Clock,
} from "lucide-react";
import SubmissionForm from "@/components/submission/SubmissionForm";
import Sidebar from "@/components/submission/Sidebar";
import SuccessOverlay from "@/components/submission/SuccessOverlay";
import type { TaskData } from "@/components/submission/types";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TASK: TaskData = {
  id: "task-001",
  title: "Frontend Milestone for DAO Portal",
  project: "OpenDAO Collective",
  stakeAmount: 40,
  rewardAmount: 120,
  deadline: "May 17, 2026",
  daysLeft: 5,
  progress: 65,
  currentMilestone: 2,
  milestones: [
    { label: "Wallet connect modal + provider detection", pct: 30, done: true },
    { label: "Transaction history feed with pagination", pct: 40, done: false, active: true },
    { label: "Mobile responsive + accessibility pass", pct: 20, done: false },
    { label: "Unit tests + PR review", pct: 10, done: false },
  ],
  requiredDocs: ["GitHub repo link", "Screen recording of wallet flow", "Test coverage report"],
  reviewers: [
    { name: "0xmara.eth", rep: 91, avatar: "M", status: "Pending" },
    { name: "devchain.eth", rep: 88, avatar: "D", status: "Approved M1" },
  ],
  txHistory: [
    { event: "Stake locked", amount: "−40 USDC", time: "May 12, 09:14", hash: "0x4a2f…8e3c" },
    { event: "M1 reward released", amount: "+36 USDC", time: "May 10, 14:22", hash: "0x9d1a…cc71" },
  ],
};

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function TaskSubmissionPage() {
  const [success, setSuccess] = useState(false);

  const handleSubmitSuccess = () => {
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Grid texture */}
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
          Back to Task
        </button>

        {/* Page header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-2.5 py-0.5">
              Submit Progress
            </span>
            <span
              className={`text-[10px] font-semibold border rounded-full px-2.5 py-0.5 ${
                TASK.daysLeft <= 2
                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }`}
            >
              {TASK.daysLeft}d left
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{TASK.title}</h1>
          <p className="text-sm text-gray-500">
            {TASK.project} • Deadline{" "}
            <span className="text-gray-300 font-medium">{TASK.deadline}</span>
          </p>
        </div>

        {/* Top stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Lock, label: "Stake Locked", value: `${TASK.stakeAmount} USDC`, hi: false },
            { icon: TrendingUp, label: "Potential Reward", value: `${TASK.rewardAmount} USDC`, hi: true },
            { icon: CheckCircle2, label: "M1 Completed", value: "Approved ✓", hi: false },
            { icon: Clock, label: "Active Milestone", value: `M${TASK.currentMilestone}`, hi: false },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${
                s.hi
                  ? "border-indigo-500/30 bg-indigo-500/10"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              <s.icon
                className={`w-4 h-4 flex-shrink-0 ${s.hi ? "text-indigo-400" : "text-gray-400"}`}
              />
              <div>
                <p className="text-[10px] text-gray-500 leading-none mb-0.5">{s.label}</p>
                <p className={`text-sm font-semibold ${s.hi ? "text-indigo-300" : "text-white"}`}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            <SubmissionForm
              milestones={TASK.milestones}
              requiredDocs={TASK.requiredDocs}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </div>

          {/* Sidebar */}
          <div>
            <Sidebar
              milestones={TASK.milestones}
              progress={TASK.progress}
              stakeAmount={TASK.stakeAmount}
              rewardAmount={TASK.rewardAmount}
              reviewers={TASK.reviewers}
              txHistory={TASK.txHistory}
              requiredDocs={TASK.requiredDocs}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <SuccessOverlay
            milestone={`${TASK.currentMilestone}`}
            onClose={() => setSuccess(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}