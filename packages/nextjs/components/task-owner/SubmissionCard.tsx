import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp, RotateCcw, Gavel, ChevronUp, ChevronDown,
  Link as LinkIcon, ExternalLink, Paperclip, Star, AlertTriangle,
} from "lucide-react";
import SubmissionBadge from "./SubmissionBadge";
import type { Submission } from "./types";

const COL: Record<string, { bg: string; border: string; text: string }> = {
  indigo: { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-300" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-300" },
  amber: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-300" },
  rose: { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-300" },
  emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300" },
};

interface SubmissionCardProps {
  sub: Submission;
  onApprove: () => void;
  onRequestRevision: () => void;
  onDispute: () => void;
}

export default function SubmissionCard({ sub, onApprove, onRequestRevision, onDispute }: SubmissionCardProps) {
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

      <div className="p-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xs font-bold ${c.text} flex-shrink-0`}>
          {sub.workerAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-100">{sub.workerName}</span>
            <SubmissionBadge status={sub.status} />
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">M{sub.milestone + 1}: {sub.milestoneLabel}</p>
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
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Worker's Notes</p>
                <p className="text-xs text-gray-400 leading-relaxed">{sub.notes}</p>
              </div>

              {sub.links.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Deliverable Links</p>
                  <div className="space-y-1.5">
                    {sub.links.map((l, i) => (
                      <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        <LinkIcon className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{l}</span> <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {sub.files.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {sub.files.map((f, i) => (
                      <button key={i} className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-[11px] text-gray-300 hover:border-gray-600 transition-colors">
                        <Paperclip className="w-3 h-3 text-gray-500" /> {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <p className="text-[10px] text-gray-500">Worker self-rating:</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= sub.selfRating ? "text-amber-400 fill-amber-400" : "text-gray-700"}`} />
                  ))}
                </div>
              </div>

              {sub.revisionNote && (
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 flex gap-2.5">
                  <RotateCcw className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-orange-300 mb-0.5">Revision Requested</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{sub.revisionNote}</p>
                  </div>
                </div>
              )}

              {sub.status === "pending_review" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={onApprove} className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" /> Approve & Release
                  </button>
                  <button onClick={onRequestRevision} className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-300 text-sm font-semibold hover:bg-orange-600/30 transition-colors">
                    <RotateCcw className="w-4 h-4" /> Request Revision
                  </button>
                  <button onClick={onDispute} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-600/20 transition-colors">
                    <Gavel className="w-4 h-4" /> Dispute
                  </button>
                </div>
              )}
              {sub.status === "revision_requested" && (
                <div className="flex gap-2">
                  <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" /> Approve Revised
                  </button>
                  <button onClick={onDispute} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-600/20 transition-colors">
                    <Gavel className="w-4 h-4" /> Dispute
                  </button>
                </div>
              )}
              {sub.status === "disputed" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This submission is under arbitration. The protocol will resolve the dispute based on evidence. You'll be notified of the outcome.
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