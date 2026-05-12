"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Star,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Eye,
  RotateCcw,
  Ban,
  Gavel,
  Send,
  Lock,
  TrendingUp,
  CircleDot,
  BadgeCheck,
  Info,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Award,
  GitBranch,
  Settings,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Trash2,
  ChevronRight,
  Zap,
  Hash,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type ApplicantStatus = "pending" | "accepted" | "rejected";
type SubmissionStatus = "pending_review" | "approved" | "revision_requested" | "disputed";
type TabKey = "applicants" | "submissions" | "milestones" | "settings";

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  rep: number;
  successRate: number;
  tasksCompleted: number;
  skills: string[];
  pitch: string;
  appliedAt: string;
  status: ApplicantStatus;
  walletShort: string;
}

interface Submission {
  id: string;
  workerName: string;
  workerAvatar: string;
  workerColor: string;
  milestone: number;
  milestoneLabel: string;
  submittedAt: string;
  notes: string;
  links: string[];
  files: string[];
  selfRating: number;
  status: SubmissionStatus;
  revisionNote?: string;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
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
    id: "a1",
    name: "0xmara.eth",
    avatar: "M",
    color: "indigo",
    rep: 91,
    successRate: 96,
    tasksCompleted: 34,
    skills: ["React", "Ethers.js", "TypeScript"],
    pitch:
      "I've built 3 wallet integration modules for production DAOs. I have a reusable provider detection utility I can adapt directly for this spec — estimated 18h including tests.",
    appliedAt: "2h ago",
    status: "accepted",
    walletShort: "0x4a2f…8e3c",
  },
  {
    id: "a2",
    name: "web3wolf.eth",
    avatar: "W",
    color: "violet",
    rep: 78,
    successRate: 88,
    tasksCompleted: 19,
    skills: ["React", "Wagmi", "Viem"],
    pitch:
      "Strong Wagmi/Viem background. Built the wallet flow for ZK Rollup SDK last month — happy to share that codebase as reference. Can deliver in 5 days.",
    appliedAt: "5h ago",
    status: "pending",
    walletShort: "0x9d1a…cc71",
  },
  {
    id: "a3",
    name: "solidity_sam",
    avatar: "S",
    color: "amber",
    rep: 65,
    successRate: 81,
    tasksCompleted: 11,
    skills: ["React", "Web3.js"],
    pitch:
      "Frontend dev with 2 years of Web3 experience. Comfortable with wallet integrations and enjoy building clean, accessible UIs.",
    appliedAt: "1d ago",
    status: "pending",
    walletShort: "0x7c3b…aa04",
  },
  {
    id: "a4",
    name: "nullbyte.eth",
    avatar: "N",
    color: "rose",
    rep: 42,
    successRate: 73,
    tasksCompleted: 6,
    skills: ["React", "Ethers.js"],
    pitch:
      "Junior dev eager to contribute. I'm familiar with MetaMask integration and would love the opportunity to work on a live DAO product.",
    appliedAt: "2d ago",
    status: "rejected",
    walletShort: "0x1f8e…dd22",
  },
];

const INIT_SUBMISSIONS: Submission[] = [
  {
    id: "s1",
    workerName: "0xmara.eth",
    workerAvatar: "M",
    workerColor: "indigo",
    milestone: 0,
    milestoneLabel: "Wallet connect modal + provider detection",
    submittedAt: "May 10, 14:22",
    notes:
      "Implemented multi-provider detection (MetaMask, WalletConnect, Coinbase). Modal covers connect, disconnect, switch network, and error states. All 4 providers tested on mainnet. Added loading skeletons and mobile breakpoints per spec.",
    links: ["https://github.com/opendao/dao-portal/pull/42", "https://loom.com/share/wallet-demo"],
    files: ["wallet-test-report.pdf"],
    selfRating: 5,
    status: "approved",
  },
  {
    id: "s2",
    workerName: "0xmara.eth",
    workerAvatar: "M",
    workerColor: "indigo",
    milestone: 1,
    milestoneLabel: "Transaction history feed with pagination",
    submittedAt: "May 12, 09:14",
    notes:
      "Tx history panel complete. Pulls from the Alchemy indexer endpoint you provided. Pagination working at 20 items/page. Filters for send/receive/contract/stake implemented. One edge case open: stake events sometimes return duplicate entries from the indexer — flagged in the PR.",
    links: [
      "https://github.com/opendao/dao-portal/pull/51",
      "https://loom.com/share/tx-history-demo",
    ],
    files: ["coverage-report.pdf", "screen-recording.mp4"],
    selfRating: 4,
    status: "pending_review",
  },
];

/* ═══════════════════════════════════════════════════════════════
   COLOUR MAPS
═══════════════════════════════════════════════════════════════ */
const COL: Record<string, { bg: string; border: string; text: string }> = {
  indigo: { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-300" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-300" },
  amber: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-300" },
  rose: { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-300" },
  emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300" },
};

/* ═══════════════════════════════════════════════════════════════
   SUBCOMPONENTS
═══════════════════════════════════════════════════════════════ */

/* ── Status badges ── */
function ApplicantBadge({ status }: { status: ApplicantStatus }) {
  const map = {
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accepted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rejected: "text-gray-500 bg-gray-800 border-gray-700",
  };
  const labels = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function SubmissionBadge({ status }: { status: SubmissionStatus }) {
  const map: Record<SubmissionStatus, string> = {
    pending_review: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    revision_requested: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    disputed: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  const labels: Record<SubmissionStatus, string> = {
    pending_review: "Pending Review",
    approved: "Approved",
    revision_requested: "Revision Requested",
    disputed: "Disputed",
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

/* ── Confirm modal ── */
function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  withNote,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
  withNote?: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{description}</p>
        {withNote && (
            <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Leave a note for the worker (required)…"
            className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/60 resize-none mb-4"
          />
          <input
            type="number"
            placeholder="New Deadline for the worker (hours)..."
            className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/60 resize-none mb-4"
          />
          </>
        )}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={withNote && note.trim().length < 5}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Applicant Card ── */
function ApplicantCard({
  applicant,
  slotsLeft,
  onAccept,
  onReject,
}: {
  applicant: Applicant;
  slotsLeft: number;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const c = COL[applicant.color] ?? COL.indigo;

  return (
    <motion.div
      layout
      className={`rounded-2xl border bg-gray-900 overflow-hidden transition-colors ${
        applicant.status === "accepted"
          ? "border-emerald-500/30"
          : applicant.status === "rejected"
          ? "border-gray-800 opacity-60"
          : "border-gray-700"
      }`}
    >
      {/* Header row */}
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-sm font-bold ${c.text} flex-shrink-0`}>
          {applicant.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-100">{applicant.name}</span>
            <ApplicantBadge status={applicant.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Star className="w-3 h-3 text-amber-400" />
              {applicant.rep} rep
            </span>
            <span className="text-[11px] text-gray-500">{applicant.successRate}% success</span>
            <span className="text-[11px] text-gray-500">{applicant.tasksCompleted} tasks done</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {applicant.status === "pending" && (
            <>
              <button
                onClick={onAccept}
                disabled={slotsLeft <= 0}
                title={slotsLeft <= 0 ? "No slots left" : "Accept applicant"}
                className="h-8 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-600/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Accept
              </button>
              <button
                onClick={onReject}
                className="h-8 px-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-[11px] font-semibold hover:border-red-500/30 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          )}
          {applicant.status === "accepted" && (
            <span className="h-8 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              Working
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-4">
              {/* Pitch */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Application Pitch</p>
                <p className="text-xs text-gray-400 leading-relaxed">{applicant.pitch}</p>
              </div>

              {/* Skills */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Skills Listed</p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.skills.map((s) => (
                    <span key={s} className="text-[11px] text-gray-300 border border-gray-700 bg-gray-800 rounded-lg px-2.5 py-0.5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[10px] text-gray-600 pt-1">
                <span>Applied {applicant.appliedAt}</span>
                <span className="font-mono">{applicant.walletShort}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Submission Card ── */
function SubmissionCard({
  sub,
  onApprove,
  onRequestRevision,
  onDispute,
}: {
  sub: Submission;
  onApprove: () => void;
  onRequestRevision: () => void;
  onDispute: () => void;
}) {
  const [expanded, setExpanded] = useState(sub.status === "pending_review");
  const c = COL[sub.workerColor] ?? COL.indigo;

  return (
    <motion.div
      layout
      className={`rounded-2xl border bg-gray-900 overflow-hidden ${
        sub.status === "approved"
          ? "border-emerald-500/20"
          : sub.status === "revision_requested"
          ? "border-orange-500/20"
          : sub.status === "disputed"
          ? "border-red-500/20"
          : "border-indigo-500/20"
      }`}
    >
      {/* Accent strip */}
      <div
        className={`h-0.5 w-full ${
          sub.status === "approved"
            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
            : sub.status === "revision_requested"
            ? "bg-gradient-to-r from-orange-500 to-amber-500"
            : sub.status === "disputed"
            ? "bg-gradient-to-r from-red-500 to-rose-500"
            : "bg-gradient-to-r from-indigo-500 to-violet-500"
        }`}
      />

      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xs font-bold ${c.text} flex-shrink-0`}>
          {sub.workerAvatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-100">{sub.workerName}</span>
            <SubmissionBadge status={sub.status} />
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            M{sub.milestone + 1}: {sub.milestoneLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-600">{sub.submittedAt}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
              {/* Notes */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Worker's Notes
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">{sub.notes}</p>
              </div>

              {/* Links */}
              {sub.links.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Deliverable Links
                  </p>
                  <div className="space-y-1.5">
                    {sub.links.map((l, i) => (
                      <a
                        key={i}
                        href={l}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{l}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {sub.files.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Attachments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sub.files.map((f, i) => (
                      <button
                        key={i}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-[11px] text-gray-300 hover:border-gray-600 transition-colors"
                      >
                        <Paperclip className="w-3 h-3 text-gray-500" />
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Self rating */}
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-gray-500">Worker self-rating:</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= sub.selfRating ? "text-amber-400 fill-amber-400" : "text-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Revision note if any */}
              {sub.revisionNote && (
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 flex gap-2.5">
                  <RotateCcw className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-orange-300 mb-0.5">
                      Revision Requested
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">{sub.revisionNote}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {sub.status === "pending_review" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={onApprove}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve & Release
                  </button>
                  <button
                    onClick={onRequestRevision}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-300 text-sm font-semibold hover:bg-orange-600/30 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Revision
                  </button>
                  <button
                    onClick={onDispute}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-600/20 transition-colors"
                  >
                    <Gavel className="w-4 h-4" />
                    Dispute
                  </button>
                </div>
              )}
              {sub.status === "revision_requested" && (
                <div className="flex gap-2">
                  <button
                    onClick={onApprove}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve Revised
                  </button>
                  <button
                    onClick={onDispute}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-600/20 transition-colors"
                  >
                    <Gavel className="w-4 h-4" />
                    Dispute
                  </button>
                </div>
              )}
              {sub.status === "disputed" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This submission is under arbitration. The protocol will resolve the dispute
                    based on evidence. You'll be notified of the outcome.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function TaskOwnerPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(INIT_APPLICANTS);
  const [submissions, setSubmissions] = useState<Submission[]>(INIT_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<TabKey>("applicants");

  /* modal state */
  type ModalType = "accept" | "reject" | "approve" | "revision" | "dispute" | "close" | null;
  const [modal, setModal] = useState<{ type: ModalType; id: string } | null>(null);

  /* filter */
  const [appFilter, setAppFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  /* derived */
  const acceptedCount = applicants.filter((a) => a.status === "accepted").length;
  const slotsLeft = TASK.slots.total - acceptedCount;
  const pendingSubmissions = submissions.filter((s) => s.status === "pending_review").length;
  const filteredApplicants = applicants.filter(
    (a) => appFilter === "all" || a.status === appFilter,
  );

  /* handlers */
  const handleAccept = (id: string) => setModal({ type: "accept", id });
  const handleReject = (id: string) => setModal({ type: "reject", id });
  const handleApprove = (id: string) => setModal({ type: "approve", id });
  const handleRevision = (id: string) => setModal({ type: "revision", id });
  const handleDispute = (id: string) => setModal({ type: "dispute", id });

  const confirm = (note?: string) => {
    if (!modal) return;
    const { type, id } = modal;

    if (type === "accept") {
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a)),
      );
    }
    if (type === "reject") {
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)),
      );
    }
    if (type === "approve") {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s)),
      );
    }
    if (type === "revision") {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "revision_requested", revisionNote: note } : s,
        ),
      );
    }
    if (type === "dispute") {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "disputed" } : s)),
      );
    }

    setModal(null);
  };

  /* tabs */
  const TABS: { key: TabKey; label: string; badge?: number }[] = [
    { key: "applicants", label: "Applicants", badge: applicants.filter((a) => a.status === "pending").length },
    { key: "submissions", label: "Submissions", badge: pendingSubmissions },
    { key: "milestones", label: "Milestones" },
    { key: "settings", label: "Task Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Grid bg */}
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
          Back to Dashboard
        </button>

        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-2.5 py-0.5">
                Owner Panel
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 bg-amber-500/10 rounded-full px-2.5 py-0.5">
                {TASK.daysLeft}d left
              </span>
              {pendingSubmissions > 0 && (
                <span className="text-[10px] font-semibold text-red-400 border border-red-500/20 bg-red-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {pendingSubmissions} needs review
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{TASK.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {TASK.project} · Deadline{" "}
              <span className="text-gray-300 font-medium">{TASK.deadline}</span>
            </p>
          </div>

          <button
            onClick={() => setModal({ type: "close", id: "task" })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
          >
            <Ban className="w-4 h-4" />
            Close Task
          </button>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Users, label: "Slots Filled", value: `${acceptedCount} / ${TASK.slots.total}`, hi: false },
            { icon: Lock, label: "Stake Pool", value: `${TASK.stakePool} USDC`, hi: true },
            { icon: FileText, label: "Total Submissions", value: `${submissions.length}`, hi: false },
            { icon: Clock, label: "Active Milestone", value: "M2 — In Progress", hi: false },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${
                s.hi
                  ? "border-indigo-500/30 bg-indigo-500/10"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              <s.icon className={`w-4 h-4 flex-shrink-0 ${s.hi ? "text-indigo-400" : "text-gray-400"}`} />
              <div>
                <p className="text-[10px] text-gray-500 leading-none mb-0.5">{s.label}</p>
                <p className={`text-sm font-semibold ${s.hi ? "text-indigo-300" : "text-white"}`}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-800 mb-6 overflow-x-auto pb-px">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {t.badge}
                </span>
              )}
              {activeTab === t.key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: Applicants ── */}
        {activeTab === "applicants" && (
          <div className="space-y-5">
            {/* Slot summary */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    {acceptedCount} of {TASK.slots.total} slots filled
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} remaining` : "Task is fully staffed"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setAppFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                      appFilter === f
                        ? "bg-gray-700 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {f}
                    <span className="ml-1 text-[9px] text-gray-600">
                      ({f === "all" ? applicants.length : applicants.filter((a) => a.status === f).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slot bars */}
            <div className="flex gap-2">
              {Array.from({ length: TASK.slots.total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < acceptedCount ? "bg-indigo-500" : "bg-gray-800"
                  }`}
                />
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {filteredApplicants.length === 0 && (
                <div className="text-center py-12 text-gray-600 text-sm">
                  No applicants in this filter.
                </div>
              )}
              {filteredApplicants.map((a) => (
                <ApplicantCard
                  key={a.id}
                  applicant={a}
                  slotsLeft={slotsLeft}
                  onAccept={() => handleAccept(a.id)}
                  onReject={() => handleReject(a.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Submissions ── */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            {/* Info bar */}
            {pendingSubmissions > 0 && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400 leading-relaxed">
                  <span className="text-white font-semibold">{pendingSubmissions} submission{pendingSubmissions > 1 ? "s" : ""}</span> awaiting your review.
                  Approving releases the milestone reward. Requesting revision sends it back to the worker.
                  Disputing escalates to protocol arbitration.
                </p>
              </div>
            )}

            {submissions.length === 0 && (
              <div className="text-center py-12 text-gray-600 text-sm">
                No submissions yet.
              </div>
            )}

            {submissions.map((s) => (
              <SubmissionCard
                key={s.id}
                sub={s}
                onApprove={() => handleApprove(s.id)}
                onRequestRevision={() => handleRevision(s.id)}
                onDispute={() => handleDispute(s.id)}
              />
            ))}
          </div>
        )}

        {/* ── TAB: Milestones ── */}
        {activeTab === "milestones" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Milestone Overview</h2>
              <div className="relative">
                <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-800" />
                <div className="space-y-4">
                  {TASK.milestones.map((m, i) => {
                    const isDone = m.status === "done";
                    const isActive = m.status === "active";
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className="relative z-10 flex-shrink-0">
                          {isDone ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                          ) : isActive ? (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-indigo-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                              <span className="text-[10px] text-gray-600 font-bold">{i + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 pt-1.5 border-b border-gray-800/50 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className={`text-sm font-medium ${isDone ? "text-gray-500" : isActive ? "text-white" : "text-gray-500"}`}>
                              M{i + 1}: {m.label}
                            </p>
                            <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${
                              isDone ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                              isActive ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" :
                              "text-gray-600 border-gray-700 bg-gray-800"
                            }`}>
                              {isDone ? "Completed" : isActive ? "Active" : "Locked"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] text-gray-600">{m.pct}% of total reward</span>
                            {isActive && (
                              <span className="text-[10px] text-indigo-400">
                                {submissions.filter(s => s.milestone === i).length} submission(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reward breakdown */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-4">Reward Breakdown</h2>
              <div className="space-y-2">
                {TASK.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">M{i + 1}</span>
                        <span className="text-gray-400">{(TASK.stakePool * m.pct) / 100} USDC</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.status === "done" ? "bg-emerald-500" : m.status === "active" ? "bg-indigo-500" : "bg-gray-700"}`}
                          style={{ width: `${m.pct}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold w-16 text-right ${m.status === "done" ? "text-emerald-400" : m.status === "active" ? "text-indigo-400" : "text-gray-600"}`}>
                      {m.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Settings ── */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-200">Task Configuration</h2>

              {[
                { label: "Task Title", value: TASK.title, type: "text" },
                { label: "Deadline", value: TASK.deadline, type: "date" },
                { label: "Max Slots", value: String(TASK.slots.total), type: "number" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    defaultValue={f.value}
                    type={f.type}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-indigo-500/60 transition-colors"
                  />
                </div>
              ))}

              <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
                Save Changes
              </button>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Closing the task will end all active commitments. Workers currently assigned will
                have their stakes returned proportionally based on completed milestones. This action
                is recorded on-chain and cannot be undone.
              </p>
              <button
                onClick={() => setModal({ type: "close", id: "task" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-colors"
              >
                <Ban className="w-4 h-4" />
                Close Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "accept" && (
          <ConfirmModal
            title="Accept Applicant"
            description={`Accept ${applicants.find((a) => a.id === modal.id)?.name}? They will be notified and can begin working immediately. This occupies one slot.`}
            confirmLabel="Accept"
            confirmColor="bg-emerald-600 hover:bg-emerald-500"
            onConfirm={confirm}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === "reject" && (
          <ConfirmModal
            title="Reject Applicant"
            description={`Reject ${applicants.find((a) => a.id === modal.id)?.name}? They will be notified. This doesn't affect their reputation.`}
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