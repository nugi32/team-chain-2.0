import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BadgeCheck, ChevronUp, ChevronDown, Star } from "lucide-react";
import ApplicantBadge from "./ApplicantBadge";
import type { Applicant } from "./types";

const COL: Record<string, { bg: string; border: string; text: string }> = {
  indigo: { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-300" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-300" },
  amber: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-300" },
  rose: { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-300" },
  emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300" },
};

interface ApplicantCardProps {
  applicant: Applicant;
  slotsLeft: number;
  onAccept: () => void;
  onReject: () => void;
}

export default function ApplicantCard({ applicant, slotsLeft, onAccept, onReject }: ApplicantCardProps) {
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
              <Star className="w-3 h-3 text-amber-400" /> {applicant.rep} rep
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
                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                onClick={onReject}
                className="h-8 px-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-[11px] font-semibold hover:border-red-500/30 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          {applicant.status === "accepted" && (
            <span className="h-8 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> Working
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
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Application Pitch</p>
                <p className="text-xs text-gray-400 leading-relaxed">{applicant.pitch}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Skills Listed</p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.skills.map(s => (
                    <span key={s} className="text-[11px] text-gray-300 border border-gray-700 bg-gray-800 rounded-lg px-2.5 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
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