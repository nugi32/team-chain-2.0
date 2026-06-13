import React from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Layers,
  Eye, Send, MoreHorizontal,
} from "lucide-react";

const RISK_STYLES: Record<string, string> = {
  "on-track": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "at-risk": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "overdue": "text-red-400 bg-red-500/10 border-red-500/20",
};
const RISK_ICONS: Record<string, React.ReactNode> = {
  "on-track": <CheckCircle2 className="w-3 h-3" />,
  "at-risk": <AlertTriangle className="w-3 h-3" />,
  "overdue": <XCircle className="w-3 h-3" />,
};
const RISK_LABEL: Record<string, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  "overdue": "Overdue",
};

interface Task {
  id: string;
  project: string;
  role: string;
  stake: number;
  stakeUSD: number;
  deadline: string;
  milestone: string;
  risk: string;
  progress: number;
  tab: string;
  tags?: string[];
}

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-3 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white leading-snug">
            {task.project}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{task.role}</p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-400">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={[
              "h-full rounded-full transition-all",
              task.risk === "overdue"
                ? "bg-red-500"
                : task.risk === "at-risk"
                ? "bg-amber-500"
                : "bg-indigo-500",
            ].join(" ")}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600">{task.milestone}</p>
      </div>

      <div className="flex items-center justify-between">
        <div
          className={[
            "inline-flex items-center gap-1 text-[10px] font-medium rounded-full border px-2 py-0.5",
            RISK_STYLES[task.risk],
          ].join(" ")}
        >
          {RISK_ICONS[task.risk]}
          {RISK_LABEL[task.risk]}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {task.deadline}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-mono text-indigo-300">
            {task.stake} ETH
          </span>
          <span className="text-[10px] text-gray-600">
            (${task.stakeUSD.toLocaleString()})
          </span>
        </div>
        <div className="flex gap-1.5">
          <button className="text-[10px] text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg px-2 py-1 transition-colors flex items-center gap-1">
            <Eye className="w-3 h-3" /> View
          </button>
          {task.tab === "Active" && (
            <button className="text-[10px] text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1">
              <Send className="w-3 h-3" /> Submit
            </button>
          )}
          {task.tab === "Review" && (
            <button className="text-[10px] text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}