"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  Star,
  Send,
  X,
  Plus,
  GitBranch,
  ExternalLink,
  Shield,
  TrendingUp,
  Info,
  CircleDot,
  BadgeCheck,
  Loader2,
  Eye,
  MessageSquare,
  Paperclip,
  Hash,
} from "lucide-react";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TASK = {
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

/* ─── HELPERS ───────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-400 mb-1.5">{children}</label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-gray-600 mt-1">{children}</p>;
}

/* ─── MILESTONE TRACKER ─────────────────────────────────────── */
function MilestoneTracker() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">Milestone Progress</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-800" />
        <div className="space-y-4">
          {TASK.milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 relative z-10">
                {m.done ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                ) : m.active ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <span className="text-[10px] text-gray-600 font-bold">{i + 1}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs leading-snug ${
                      m.done
                        ? "text-gray-500 line-through"
                        : m.active
                        ? "text-white font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {m.label}
                  </p>
                  <span
                    className={`text-[10px] font-semibold flex-shrink-0 ${
                      m.done ? "text-emerald-400" : m.active ? "text-indigo-400" : "text-gray-600"
                    }`}
                  >
                    {m.pct}%
                  </span>
                </div>
                {m.active && (
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-2 py-0.5">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall bar */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
          <span>Overall completion</span>
          <span className="font-semibold text-gray-300">{TASK.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${TASK.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── LINK INPUT ROW ────────────────────────────────────────── */
function LinkRow({
  value,
  onChange,
  placeholder,
  onRemove,
  showRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onRemove: () => void;
  showRemove: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 focus-within:border-indigo-500/60 transition-colors">
        <LinkIcon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
        />
      </div>
      {showRemove && (
        <button
          onClick={onRemove}
          className="w-9 h-9 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/* ─── SUCCESS OVERLAY ───────────────────────────────────────── */
function SuccessOverlay({ milestone, onClose }: { milestone: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm rounded-2xl border border-indigo-500/30 bg-gray-900 p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <Send className="w-7 h-7 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Submission Sent!</h2>
        <p className="text-sm text-gray-400 mb-2 leading-relaxed">
          Your progress on{" "}
          <span className="text-white font-medium">Milestone {milestone}</span> has been submitted
          for peer review.
        </p>
        <p className="text-[11px] text-gray-500 mb-6">
          Reviewers will evaluate and respond within 24–48h. You'll receive a notification once
          approved or if changes are requested.
        </p>
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
          >
            Back to Dashboard
          </button>
          <button className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-sm text-gray-300 transition-colors">
            View Submission Status
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function TaskSubmissionPage() {
  /* form state */
  const [activeMilestone, setActiveMilestone] = useState(1); // index
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [selfRating, setSelfRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [requestReview, setRequestReview] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped].slice(0, 5));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const picked = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...picked].slice(0, 5));
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  const currentMs = TASK.milestones[activeMilestone];
  const canSubmit = notes.trim().length > 20 && links[0].length > 4;

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
            { icon: Clock, label: "Active Milestone", value: `M${activeMilestone + 1}`, hi: false },
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
          {/* ─── Main form ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Milestone selector */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-200 mb-3">
                Which milestone are you submitting for?
              </h2>
              <div className="space-y-2">
                {TASK.milestones.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => !m.done && setActiveMilestone(i)}
                    disabled={m.done}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3.5 transition-colors text-left ${
                      m.done
                        ? "border-gray-800 opacity-40 cursor-not-allowed"
                        : activeMilestone === i
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                        m.done
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : activeMilestone === i
                          ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                          : "border-gray-600 text-gray-500"
                      }`}
                    >
                      {m.done ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={`flex-1 text-xs ${m.done ? "text-gray-600" : activeMilestone === i ? "text-white font-medium" : "text-gray-400"}`}>
                      {m.label}
                    </span>
                    <span
                      className={`text-[10px] font-semibold flex-shrink-0 ${
                        m.done ? "text-gray-600" : "text-gray-500"
                      }`}
                    >
                      {m.pct}%
                    </span>
                    {m.done && (
                      <span className="text-[9px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-1.5 py-0.5">
                        Done
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress notes */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <Label>Progress Notes *</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder={`Describe what you've built for Milestone ${activeMilestone + 1}.\n\nInclude: what was implemented, any blockers encountered, deviations from spec, and what's ready for review.`}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/60 transition-colors resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1">
                <FieldHint>Min 20 characters. Be specific — reviewers use this to evaluate.</FieldHint>
                <span
                  className={`text-[10px] ${
                    notes.length >= 20 ? "text-emerald-500" : "text-gray-600"
                  }`}
                >
                  {notes.length} chars
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <Label>Deliverable Links *</Label>
                {links.length < 4 && (
                  <button
                    onClick={() => setLinks((prev) => [...prev, ""])}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add link
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {links.map((l, i) => (
                  <LinkRow
                    key={i}
                    value={l}
                    onChange={(v) =>
                      setLinks((prev) => prev.map((x, idx) => (idx === i ? v : x)))
                    }
                    placeholder={
                      i === 0
                        ? "https://github.com/yourrepo/dao-portal"
                        : i === 1
                        ? "https://loom.com/share/screen-recording…"
                        : "https://…"
                    }
                    onRemove={() =>
                      setLinks((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    showRemove={links.length > 1}
                  />
                ))}
              </div>
              <FieldHint>GitHub, Loom, Figma, or any relevant URL. First link is primary.</FieldHint>
            </div>

            {/* File attachments */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <Label>Attachments (optional)</Label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-gray-700 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-6 h-6 text-gray-600 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                  Drag & drop files, or click to browse
                </p>
                <p className="text-[10px] text-gray-600 mt-1">
                  PDF, PNG, ZIP — max 5 files, 10MB each
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.zip,.md"
              />
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="flex-1 text-xs text-gray-300 truncate">{f.name}</span>
                      <span className="text-[10px] text-gray-500">
                        {(f.size / 1024).toFixed(0)}KB
                      </span>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Self assessment */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <Label>Self-Assessment</Label>
              <p className="text-[11px] text-gray-500 mb-3">
                How confident are you in this submission? This helps reviewers calibrate.
              </p>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setSelfRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || selfRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {selfRating > 0 && (
                <p className="text-[11px] text-gray-400">
                  {
                    ["", "Needs work", "Mostly done", "Good shape", "Solid", "Production ready"][
                      selfRating
                    ]
                  }
                </p>
              )}
            </div>

            {/* Review option */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setRequestReview(!requestReview)}
                  className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    requestReview
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-gray-600"
                  }`}
                >
                  {requestReview && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-200">Request peer review now</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Assigned reviewers will be notified immediately. If unchecked, you can trigger
                    review later from your dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              {!canSubmit && (
                <div className="flex items-center gap-2 mb-4 text-[11px] text-amber-400">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Fill in progress notes (20+ chars) and at least one link to enable submission.
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Milestone {activeMilestone + 1}
                    {requestReview && " & Request Review"}
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-600 text-center mt-2">
                This action is recorded on-chain and notifies reviewers.
              </p>
            </div>
          </div>

          {/* ─── Right sidebar ─── */}
          <div className="space-y-4">
            {/* Milestone tracker */}
            <MilestoneTracker />

            {/* Stake & reward */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Economic State
              </p>
              {[
                ["Stake locked", `${TASK.stakeAmount} USDC`, "text-white"],
                ["M1 reward earned", "+36 USDC", "text-emerald-400"],
                ["M2 reward (pending)", "+48 USDC", "text-gray-500"],
                ["Remaining reward", "+36 USDC", "text-gray-500"],
              ].map(([k, v, c]) => (
                <div key={k as string} className="flex justify-between text-xs">
                  <span className="text-gray-500">{k}</span>
                  <span className={`font-semibold ${c}`}>{v}</span>
                </div>
              ))}
              <div className="h-px bg-gray-800" />
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-medium">Net if all complete</span>
                <span className="text-emerald-400 font-bold">+80 USDC</span>
              </div>
            </div>

            {/* Reviewers */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Assigned Reviewers
              </p>
              <div className="space-y-3">
                {TASK.reviewers.map((r) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {r.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-200">{r.name}</p>
                      <p className="text-[10px] text-gray-500">{r.status}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] text-gray-400">{r.rep}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* On-chain transactions */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                On-chain History
              </p>
              <div className="space-y-3">
                {TASK.txHistory.map((tx, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-300">{tx.event}</p>
                        <span
                          className={`text-[10px] font-semibold flex-shrink-0 ${
                            tx.amount.startsWith("+") ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {tx.amount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-600">{tx.time}</span>
                        <span className="text-gray-700">·</span>
                        <button className="text-[10px] text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-0.5">
                          {tx.hash}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist reminder */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Submission Checklist
              </p>
              <div className="space-y-2">
                {TASK.requiredDocs.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <CircleDot className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <SuccessOverlay
            milestone={`${activeMilestone + 1}`}
            onClose={() => setSuccess(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}