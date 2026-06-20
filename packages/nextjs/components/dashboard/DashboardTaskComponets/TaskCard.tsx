import React from "react";
import {
  CheckCircle2, Clock, Layers, Eye, Send, MoreHorizontal,
  Rocket, Lock, Users, UserPlus, RefreshCw, Crown, User,
} from "lucide-react";
import { KanbanTask, TaskRole, SubmitStatus } from "@/utils/lib/dashboard";
import { formatEther } from "viem";

const ROLE_STYLES: Record<TaskRole, string> = {
  [TaskRole.creator]: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  [TaskRole.member]: "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

const ROLE_ICONS: Record<TaskRole, React.ReactNode> = {
  [TaskRole.creator]: <Crown className="w-3 h-3" />,
  [TaskRole.member]: <User className="w-3 h-3" />,
};

const ROLE_LABEL: Record<TaskRole, string> = {
  [TaskRole.creator]: "Creator",
  [TaskRole.member]: "Member",
};

const SUBMIT_STATUS_LABEL: Record<SubmitStatus, string> = {
  [SubmitStatus.NoneStatus]: "Not submitted",
  [SubmitStatus.Pending]: "Pending review",
  [SubmitStatus.RevisionNeeded]: "Revision needed",
  [SubmitStatus.Accepted]: "Accepted",
};

interface TaskCardProps {
  task: KanbanTask;
  onView?: (task: KanbanTask) => void;
  onActivate?: (task: KanbanTask) => void;
  onCloseRegistration?: (task: KanbanTask) => void;
  onViewRequests?: (task: KanbanTask) => void;
  onJoinRequest?: (task: KanbanTask) => void;
  onSubmit?: (task: KanbanTask) => void;
  onApprove?: (task: KanbanTask) => void;
}

export default function TaskCard({
  task,
  onView,
  onActivate,
  onCloseRegistration,
  onViewRequests,
  onJoinRequest,
  onSubmit,
  onApprove,
}: TaskCardProps) {
  const isOwner = task.role === TaskRole.creator;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-3 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white leading-snug">
            {task.projectTitle}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{task.category}</p>
        </div>
        <button
          onClick={() => onView?.(task)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-400"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={[
              "h-full rounded-full transition-all",
              isOwner ? "bg-indigo-500" : "bg-teal-500",
            ].join(" ")}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600">
          {task.submitStatus !== undefined
            ? SUBMIT_STATUS_LABEL[task.submitStatus]
            : task.category}
        </p>
      </div>

      {/* Role badge */}
      <div className="flex items-center justify-between">
        <div
          className={[
            "inline-flex items-center gap-1 text-[10px] font-medium rounded-full border px-2 py-0.5",
            ROLE_STYLES[task.role],
          ].join(" ")}
        >
          {ROLE_ICONS[task.role]}
          {ROLE_LABEL[task.role]}
          {task.counterpartyName && (
            <span className="opacity-70">· {task.counterpartyName}</span>
          )}
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
            {formatEther(BigInt(task.reward))} ETH
          </span>
          <span className="text-[10px] text-gray-600">
            (${task.rewardUSD.toLocaleString()})
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap justify-end">
          <button
            onClick={() => onView?.(task)}
            className="text-[10px] text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View
          </button>

          {/* Created — owner can activate */}
          {task.tab === "Created" && isOwner && (
            <button
              onClick={() => onActivate?.(task)}
              className="text-[10px] text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-500/60 bg-blue-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
            >
              <Rocket className="w-3 h-3" /> Activate
            </button>
          )}

          {/* OpenRegistration — owner: close it, or check pending requests */}
          {task.tab === "OpenRegistration" && isOwner && (
            <>
              <button
                onClick={() => onViewRequests?.(task)}
                className="text-[10px] text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
              >
                <Users className="w-3 h-3" /> Requests
              </button>
              <button
                onClick={() => onCloseRegistration?.(task)}
                className="text-[10px] text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Close
              </button>
            </>
          )}

          {/* OpenRegistration — non-owner can request to join */}
          {task.tab === "OpenRegistration" && !isOwner && (
            <button
              onClick={() => onJoinRequest?.(task)}
              className="text-[10px] text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> Request to Join
            </button>
          )}

          {/* Active — member submits, or resubmits after revision request */}
          {task.tab === "Active" && !isOwner && (
            <>
              {task.submitStatus === SubmitStatus.RevisionNeeded ? (
                <button
                  onClick={() => onSubmit?.(task)}
                  className="text-[10px] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resubmit
                </button>
              ) : task.submitStatus === SubmitStatus.Pending ? (
                <span className="text-[10px] text-gray-500 border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Awaiting review
                </span>
              ) : (
                <button
                  onClick={() => onSubmit?.(task)}
                  className="text-[10px] text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Submit
                </button>
              )}
            </>
          )}

          {/* Review — owner approves the submitted work */}
          {task.tab === "Review" && isOwner && (
            <button
              onClick={() => onApprove?.(task)}
              className="text-[10px] text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}