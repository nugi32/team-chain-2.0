"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Lock, FileText, Clock, Ban, AlertCircle, Info,
} from "lucide-react";

import ApplicantCard from "@/components/task-owner/ApplicantCard";
import SubmissionCard from "@/components/task-owner/SubmissionCard";
import ConfirmModal from "@/components/task-owner/ConfirmModal";
import Tabs from "@/components/task-owner/Tabs";
import MilestoneOverview from "@/components/task-owner/MilestoneOverview";
import type { Applicant, Submission, ApplicantStatus, SubmissionStatus, TabKey } from "@/components/task-owner/types";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TASK = {
  id: "task-001",
  title: "Frontend Milestone for DAO Portal",
  project: "OpenDAO Collective",
  category: "Frontend Dev",
  stakePool: 120,
  deadline: "May 17, 2026",
  daysLeft: 5,
  slots: { filled: 1, total: 3 },
  milestones: [
    { id: 0, label: "Wallet connect modal + provider detection", pct: 30, status: "done" },
    { id: 1, label: "Transaction history feed with pagination", pct: 40, status: "active" },
    { id: 2, label: "Mobile responsive + accessibility pass", pct: 20, status: "locked" },
    { id: 3, label: "Unit tests + PR review", pct: 10, status: "locked" },
  ],
};

const INIT_APPLICANTS: Applicant[] = [
  {
    id: "a1", name: "0xmara.eth", avatar: "M", color: "indigo", rep: 91, successRate: 96, tasksCompleted: 34,
    skills: ["React", "Ethers.js", "TypeScript"],
    pitch: "I've built 3 wallet integration modules for production DAOs. I have a reusable provider detection utility I can adapt directly for this spec — estimated 18h including tests.",
    appliedAt: "2h ago", status: "accepted", walletShort: "0x4a2f…8e3c",
  },
  {
    id: "a2", name: "web3wolf.eth", avatar: "W", color: "violet", rep: 78, successRate: 88, tasksCompleted: 19,
    skills: ["React", "Wagmi", "Viem"],
    pitch: "Strong Wagmi/Viem background. Built the wallet flow for ZK Rollup SDK last month — happy to share that codebase as reference. Can deliver in 5 days.",
    appliedAt: "5h ago", status: "pending", walletShort: "0x9d1a…cc71",
  },
  {
    id: "a3", name: "solidity_sam", avatar: "S", color: "amber", rep: 65, successRate: 81, tasksCompleted: 11,
    skills: ["React", "Web3.js"],
    pitch: "Frontend dev with 2 years of Web3 experience. Comfortable with wallet integrations and enjoy building clean, accessible UIs.",
    appliedAt: "1d ago", status: "pending", walletShort: "0x7c3b…aa04",
  },
  {
    id: "a4", name: "nullbyte.eth", avatar: "N", color: "rose", rep: 42, successRate: 73, tasksCompleted: 6,
    skills: ["React", "Ethers.js"],
    pitch: "Junior dev eager to contribute. I'm familiar with MetaMask integration and would love the opportunity to work on a live DAO product.",
    appliedAt: "2d ago", status: "rejected", walletShort: "0x1f8e…dd22",
  },
];

const INIT_SUBMISSIONS: Submission[] = [
  {
    id: "s1", workerName: "0xmara.eth", workerAvatar: "M", workerColor: "indigo",
    milestone: 0, milestoneLabel: "Wallet connect modal + provider detection",
    submittedAt: "May 10, 14:22",
    notes: "Implemented multi-provider detection (MetaMask, WalletConnect, Coinbase). Modal covers connect, disconnect, switch network, and error states. All 4 providers tested on mainnet. Added loading skeletons and mobile breakpoints per spec.",
    links: ["https://github.com/opendao/dao-portal/pull/42", "https://loom.com/share/wallet-demo"],
    files: ["wallet-test-report.pdf"], selfRating: 5, status: "approved",
  },
  {
    id: "s2", workerName: "0xmara.eth", workerAvatar: "M", workerColor: "indigo",
    milestone: 1, milestoneLabel: "Transaction history feed with pagination",
    submittedAt: "May 12, 09:14",
    notes: "Tx history panel complete. Pulls from the Alchemy indexer endpoint you provided. Pagination working at 20 items/page. Filters for send/receive/contract/stake implemented. One edge case open: stake events sometimes return duplicate entries from the indexer — flagged in the PR.",
    links: ["https://github.com/opendao/dao-portal/pull/51", "https://loom.com/share/tx-history-demo"],
    files: ["coverage-report.pdf", "screen-recording.mp4"], selfRating: 4, status: "pending_review",
  },
];

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function TaskOwnerPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(INIT_APPLICANTS);
  const [submissions, setSubmissions] = useState<Submission[]>(INIT_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<TabKey>("applicants");

  type ModalType = "accept" | "reject" | "approve" | "revision" | "dispute" | "close" | null;
  const [modal, setModal] = useState<{ type: ModalType; id: string } | null>(null);

  const [appFilter, setAppFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const acceptedCount = applicants.filter(a => a.status === "accepted").length;
  const slotsLeft = TASK.slots.total - acceptedCount;
  const pendingSubmissions = submissions.filter(s => s.status === "pending_review").length;
  const filteredApplicants = applicants.filter(a => appFilter === "all" || a.status === appFilter);

  const confirm = (note?: string) => {
    if (!modal) return;
    const { type, id } = modal;
    if (type === "accept") {
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: "accepted" } : a));
    }
    if (type === "reject") {
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
    }
    if (type === "approve") {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: "approved" } : s));
    }
    if (type === "revision") {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: "revision_requested", revisionNote: note } : s));
    }
    if (type === "dispute") {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: "disputed" } : s));
    }
    setModal(null);
  };

  const TABS = [
    { key: "applicants" as TabKey, label: "Applicants", badge: applicants.filter(a => a.status === "pending").length },
    { key: "submissions" as TabKey, label: "Submissions", badge: pendingSubmissions },
    { key: "milestones" as TabKey, label: "Milestones" },
    { key: "settings" as TabKey, label: "Task Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-2.5 py-0.5">Owner Panel</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 bg-amber-500/10 rounded-full px-2.5 py-0.5">{TASK.daysLeft}d left</span>
              {pendingSubmissions > 0 && (
                <span className="text-[10px] font-semibold text-red-400 border border-red-500/20 bg-red-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {pendingSubmissions} needs review
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{TASK.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{TASK.project} · Deadline <span className="text-gray-300 font-medium">{TASK.deadline}</span></p>
          </div>
          <button onClick={() => setModal({ type: "close", id: "task" })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">
            <Ban className="w-4 h-4" /> Close Task
          </button>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Users, label: "Slots Filled", value: `${acceptedCount} / ${TASK.slots.total}`, hi: false },
            { icon: Lock, label: "Stake Pool", value: `${TASK.stakePool} USDC`, hi: true },
            { icon: FileText, label: "Total Submissions", value: `${submissions.length}`, hi: false },
            { icon: Clock, label: "Active Milestone", value: "M2 — In Progress", hi: false },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${s.hi ? "border-indigo-500/30 bg-indigo-500/10" : "border-gray-800 bg-gray-900"}`}>
              <s.icon className={`w-4 h-4 flex-shrink-0 ${s.hi ? "text-indigo-400" : "text-gray-400"}`} />
              <div>
                <p className="text-[10px] text-gray-500 leading-none mb-0.5">{s.label}</p>
                <p className={`text-sm font-semibold ${s.hi ? "text-indigo-300" : "text-white"}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="pt-6">
          {activeTab === "applicants" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{acceptedCount} of {TASK.slots.total} slots filled</p>
                    <p className="text-[11px] text-gray-500">{slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} remaining` : "Task is fully staffed"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                  {(["all", "pending", "accepted", "rejected"] as const).map(f => (
                    <button key={f} onClick={() => setAppFilter(f)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-colors ${appFilter === f ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                      {f} <span className="ml-1 text-[9px] text-gray-600">({f === "all" ? applicants.length : applicants.filter(a => a.status === f).length})</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: TASK.slots.total }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < acceptedCount ? "bg-indigo-500" : "bg-gray-800"}`} />
                ))}
              </div>
              <div className="space-y-3">
                {filteredApplicants.length === 0 && (
                  <div className="text-center py-12 text-gray-600 text-sm">No applicants in this filter.</div>
                )}
                {filteredApplicants.map(a => (
                  <ApplicantCard key={a.id} applicant={a} slotsLeft={slotsLeft} onAccept={() => setModal({ type: "accept", id: a.id })} onReject={() => setModal({ type: "reject", id: a.id })} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-4">
              {pendingSubmissions > 0 && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-400 leading-relaxed">
                    <span className="text-white font-semibold">{pendingSubmissions} submission{pendingSubmissions > 1 ? "s" : ""}</span> awaiting your review. Approving releases the milestone reward. Requesting revision sends it back to the worker. Disputing escalates to protocol arbitration.
                  </p>
                </div>
              )}
              {submissions.length === 0 && <div className="text-center py-12 text-gray-600 text-sm">No submissions yet.</div>}
              {submissions.map(s => (
                <SubmissionCard key={s.id} sub={s} onApprove={() => setModal({ type: "approve", id: s.id })} onRequestRevision={() => setModal({ type: "revision", id: s.id })} onDispute={() => setModal({ type: "dispute", id: s.id })} />
              ))}
            </div>
          )}

          {activeTab === "milestones" && <MilestoneOverview milestones={TASK.milestones} submissions={submissions} />}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-200">Task Configuration</h2>
                {[
                  { label: "Task Title", value: TASK.title, type: "text" },
                  { label: "Deadline", value: TASK.deadline, type: "date" },
                  { label: "Max Slots", value: String(TASK.slots.total), type: "number" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{f.label}</label>
                    <input defaultValue={f.value} type={f.type} className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-indigo-500/60 transition-colors" />
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">Save Changes</button>
              </div>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
                <p className="text-xs text-gray-500 leading-relaxed">Closing the task will end all active commitments. Workers currently assigned will have their stakes returned proportionally based on completed milestones. This action is recorded on-chain and cannot be undone.</p>
                <button onClick={() => setModal({ type: "close", id: "task" })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-colors">
                  <Ban className="w-4 h-4" /> Close Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === "accept" && (
          <ConfirmModal
            title="Accept Applicant"
            description={`Accept ${applicants.find(a => a.id === modal.id)?.name}? They will be notified and can begin working immediately. This occupies one slot.`}
            confirmLabel="Accept"
            confirmColor="bg-emerald-600 hover:bg-emerald-500"
            onConfirm={confirm}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "reject" && (
          <ConfirmModal
            title="Reject Applicant"
            description={`Reject ${applicants.find(a => a.id === modal.id)?.name}? They will be notified. This doesn't affect their reputation.`}
            confirmLabel="Reject"
            confirmColor="bg-gray-700 hover:bg-gray-600"
            onConfirm={confirm}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "approve" && (
          <ConfirmModal
            title="Approve Submission"
            description="Approving this milestone releases the proportional reward from escrow to the worker. This action is recorded on-chain."
            confirmLabel="Approve & Release"
            confirmColor="bg-emerald-600 hover:bg-emerald-500"
            onConfirm={confirm}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "revision" && (
          <ConfirmModal
            title="Request Revision"
            description="Describe what needs to be changed. The worker will be notified and can resubmit once done."
            confirmLabel="Send Revision Request"
            confirmColor="bg-orange-600 hover:bg-orange-500"
            onConfirm={confirm}
            onCancel={() => setModal(null)}
            withNote
          />
        )}
        {modal?.type === "dispute" && (
          <ConfirmModal
            title="Open Dispute"
            description="Escalating to protocol arbitration locks both stakes until resolved by the arbitration committee. Use this only when revision requests fail."
            confirmLabel="Open Dispute"
            confirmColor="bg-red-600 hover:bg-red-500"
            onConfirm={confirm}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "close" && (
          <ConfirmModal
            title="Close Task"
            description="This will end all active commitments and trigger proportional stake returns. This action is irreversible and recorded on-chain."
            confirmLabel="Close Task"
            confirmColor="bg-red-600 hover:bg-red-500"
            onConfirm={() => setModal(null)}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}