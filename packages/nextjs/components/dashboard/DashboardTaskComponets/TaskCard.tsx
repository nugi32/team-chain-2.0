"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Clock, Layers, Eye, Send, MoreHorizontal,
  Rocket, Lock, Users, DoorOpen, Trash2, XCircle, RotateCcw,
  Crown, User, Loader2, X, CheckCircle2, ExternalLink,
} from "lucide-react";
import {
  KanbanTask,
  TaskRole,
  SubmitStatus,
  UserTask,
  useDashboardTaskActions,
  useDashboardTasksData,
} from "@/utils/lib/dashboard";
import type { CompleteTaskOutput } from "@/utils/lib/tasksHelper/useGetCompleteTasks";
// NOTE: adjust this import to wherever useGetTaskUtils actually lives in your project.
import useGetTaskUtils from "@/utils/lib/helper/useGetTaskUtils";
import { formatEther, parseEther } from "viem";

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

const REQUEST_STATUS_LABEL: Record<UserTask, string> = {
  [UserTask.None]: "None",
  [UserTask.Request]: "Pending",
  [UserTask.Accepted]: "Accepted",
  [UserTask.Rejected]: "Rejected",
  [UserTask.Cancelled]: "Cancelled",
};

const formatWeiSafe = (value: number | bigint) => {
  try {
    return formatEther(typeof value === "bigint" ? value : BigInt(Math.trunc(value)));
  } catch {
    return "0";
  }
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailsModal({
  task,
  full,
  onClose,
}: {
  task: KanbanTask;
  full?: CompleteTaskOutput;
  onClose: () => void;
}) {
  const submission = task.submitContent;
  return (
    <Modal title={task.projectTitle} onClose={onClose}>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-gray-600">Category</span><span className="text-gray-300">{task.category}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Role</span><span className="text-gray-300">{ROLE_LABEL[task.role]}</span></div>
        {task.counterpartyName && (
          <div className="flex justify-between"><span className="text-gray-600">Counterparty</span><span className="text-gray-300 truncate max-w-[60%]">{task.counterpartyName}</span></div>
        )}
        <div className="flex justify-between"><span className="text-gray-600">Deadline</span><span className="text-gray-300">{task.deadline}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Reward</span><span className="text-gray-300">{formatWeiSafe(task.reward)} ETH (${task.rewardUSD.toLocaleString()})</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Progress</span><span className="text-gray-300">{task.progress}%</span></div>
        {submission && submission.status !== SubmitStatus.NoneStatus && (
          <div className="flex justify-between"><span className="text-gray-600">Submission</span><span className="text-gray-300">{SUBMIT_STATUS_LABEL[submission.status]}</span></div>
        )}
        {!!task.joinRequestCount && (
          <div className="flex justify-between"><span className="text-gray-600">Join requests</span><span className="text-gray-300">{task.joinRequestCount}</span></div>
        )}
        {!!task.tags?.length && (
          <div className="flex flex-wrap gap-1 pt-1">
            {task.tags.map((tag) => (
              <span key={tag} className="text-[10px] rounded-full border border-gray-800 px-2 py-0.5 text-gray-400">{tag}</span>
            ))}
          </div>
        )}

        {full && (
          <div className="border-t border-gray-800 pt-2 space-y-2">
            {full.objective && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Objective</p>
                <p className="text-gray-300">{full.objective}</p>
              </div>
            )}
            {full.description && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Description</p>
                <p className="text-gray-300">{full.description}</p>
              </div>
            )}
            {!!full.skills?.length && (
              <div className="flex flex-wrap gap-1">
                {full.skills.map((skill) => (
                  <span key={skill} className="text-[10px] rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-indigo-300">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {full.effort && (
              <div className="flex justify-between"><span className="text-gray-600">Effort</span><span className="text-gray-300">{full.effort}</span></div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function JoinRequestsModal({ task, busy, onAccept, onReject, onClose }: {
  task: KanbanTask;
  busy: string | null;
  onAccept: (applicant: string) => void;
  onReject: (applicant: string) => void;
  onClose: () => void;
}) {
  const requests = task.joinRequest ?? [];
  return (
    <Modal title={`Join requests (${requests.length})`} onClose={onClose}>
      {requests.length === 0 ? (
        <p className="text-xs text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {requests.map((req) => (
            <div key={req.applicant} className="rounded-xl border border-gray-800 bg-gray-950 p-3 space-y-2">
              <p className="text-xs font-mono text-indigo-300 truncate">{req.applicant}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Stake: {formatWeiSafe(req.stakeAmount)} ETH</span>
                <span>{REQUEST_STATUS_LABEL[req.status]}</span>
              </div>
              {req.isPending && !req.hasWithdrawn && (
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={busy === req.applicant}
                    onClick={() => onAccept(req.applicant)}
                    className="flex-1 text-[10px] text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg py-1 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {busy === req.applicant ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                  </button>
                  <button
                    disabled={busy === req.applicant}
                    onClick={() => onReject(req.applicant)}
                    className="flex-1 text-[10px] text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg py-1 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {busy === req.applicant ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function SubmissionModal({ task, busy, onApprove, onRequestRevision, onClose }: {
  task: KanbanTask;
  busy: boolean;
  onApprove: () => void;
  onRequestRevision: () => void;
  onClose: () => void;
}) {
  const submission = task.submitContent;
  return (
    <Modal title="Submitted work" onClose={onClose}>
      {!submission || submission.status === SubmitStatus.NoneStatus ? (
        <p className="text-xs text-gray-500">No submission yet.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
              GitHub
            </p>

            <a
              href={submission.githubURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 break-all"
            >
              {submission.githubURL}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Note</p>
            <p className="text-xs text-gray-300">{submission.note || "—"}</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>{SUBMIT_STATUS_LABEL[submission.status]}</span>
            {submission.newDeadline > 0n && (
              <span>New deadline: {new Date(Number(submission.newDeadline) * 1000).toLocaleDateString()}</span>
            )}
          </div>
          {submission.status === SubmitStatus.Pending && (
            <div className="flex gap-2 pt-1">
              <button
                disabled={busy}
                onClick={onApprove}
                className="flex-1 text-[10px] text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg py-1.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Approve
              </button>
              <button
                disabled={busy}
                onClick={onRequestRevision}
                className="flex-1 text-[10px] text-amber-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg py-1.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                Request revision
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function SubmitFormModal({ isResubmit, busy, onSubmit, onClose }: {
  isResubmit: boolean;
  busy: boolean;
  onSubmit: (githubURL: string, note: string) => void;
  onClose: () => void;
}) {
  const [githubURL, setGithubURL] = useState("");
  const [note, setNote] = useState("");
  return (
    <Modal title={isResubmit ? "Resubmit work" : "Submit work"} onClose={onClose}>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="GitHub PR URL"
          value={githubURL}
          onChange={(e) => setGithubURL(e.target.value)}
          className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500 placeholder:text-gray-700"
        />
        <textarea
          placeholder="Note for the reviewer"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-indigo-500 placeholder:text-gray-700 resize-none"
        />
        <button
          disabled={busy || !githubURL}
          onClick={() => onSubmit(githubURL, note)}
          className="w-full text-xs text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          {isResubmit ? "Resubmit" : "Submit"}
        </button>
      </div>
    </Modal>
  );
}

function RevisionFormModal({ busy, onSubmit, onClose }: {
  busy: boolean;
  onSubmit: (note: string, additionalHours: number) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [hours, setHours] = useState("24");
  return (
    <Modal title="Request revision" onClose={onClose}>
      <div className="space-y-2">
        <textarea
          placeholder="What needs to change?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-500 placeholder:text-gray-700 resize-none"
        />
        <input
          type="number"
          min="1"
          placeholder="Additional hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-500 placeholder:text-gray-700"
        />
        <button
          disabled={busy || !note || !hours}
          onClick={() => onSubmit(note, Number(hours))}
          className="w-full text-xs text-amber-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
          Send
        </button>
      </div>
    </Modal>
  );
}

// Replaces the old manual-input ActivateFormModal. The required creator stake is read
// live from the contract via useGetTaskUtils().getCreatorStake() — the user only confirms,
// they never type an ETH amount themselves.
function ActivateConfirmModal({
  busy,
  amountWei,
  isLoading,
  onConfirm,
  onClose,
}: {
  busy: boolean;
  amountWei?: bigint;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Activate task" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          This is the stake required by the contract to activate this task. Confirm to send it.
        </p>

        <div className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">Required stake</span>
          {isLoading || amountWei === undefined ? (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading…
            </span>
          ) : (
            <span className="text-sm font-mono text-blue-300">{formatWeiSafe(amountWei)} ETH</span>
          )}
        </div>

        <button
          disabled={busy || isLoading || amountWei === undefined}
          onClick={onConfirm}
          className="w-full text-xs text-blue-300 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />}
          Confirm & Activate
        </button>
      </div>
    </Modal>
  );
}

type OverlayState = "requests" | "submission" | "submitForm" | "revisionForm" | "activateForm" | "details" | null;

interface TaskCardProps {
  id: string;
  task: KanbanTask;
}

export default function TaskCard({ id, task }: TaskCardProps) {
  const { address: connectedAddress } = useAccount();
  const { actions } = useDashboardTaskActions();
  const { getCreatorStake } = useGetTaskUtils();

  const { tasks: liveTasks } = useDashboardTasksData(connectedAddress);
  const liveTaskData = liveTasks?.find((t) => t.expressId === id);

  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const isOwner = task.role === TaskRole.creator;
  const submitStatus = task.submitContent?.status;
  const isBusy = busyKey !== null;
  const taskIdBig = BigInt(task.contractId);

  const [creatorStakeWei, setCreatorStakeWei] = useState<bigint | undefined>(undefined);

  useEffect(() => {
    if (overlay !== "activateForm") {
      setCreatorStakeWei(undefined);
      return;
    }
    const stake = getCreatorStake(taskIdBig);
    setCreatorStakeWei(stake);
  }, [overlay, taskIdBig, getCreatorStake]); // getCreatorStake included on purpose

  const isStakeLoading = overlay === "activateForm" && creatorStakeWei === undefined;


  const runAction = async (key: string, fn: () => Promise<unknown>, closeOverlayOnSuccess = false) => {
    setBusyKey(key);
    try {
      await fn();
      if (closeOverlayOnSuccess) setOverlay(null);
    } catch (err) {
      console.error(`Task action "${key}" failed`, err);
    } finally {
      setBusyKey(null);
    }
  };

  const handleOpenRegistration = () => runAction("openRegistration", () => actions.openRegistration(taskIdBig));
  const handleCloseRegistration = () => runAction("closeRegistration", () => actions.closeRegistration(taskIdBig));
  const handleDelete = () => runAction("delete", () => actions.deleteTask(taskIdBig));
  const handleCancel = () => runAction("cancel", () => actions.cancelByMe(taskIdBig));

  const handleAcceptRequest = (applicant: string) =>
    runAction(applicant, () => actions.approveJoinRequestAndRejectOthers(taskIdBig, applicant));

  const handleRejectRequest = (applicant: string) =>
    runAction(applicant, () => actions.rejectJoinRequest(taskIdBig, applicant));

  const handleApprove = () => runAction("approve", () => actions.approveTask(taskIdBig), true);

  const handleSubmitWork = (githubURL: string, note: string) => {
    const isResubmit = submitStatus === SubmitStatus.RevisionNeeded;
    runAction(
      "submit",
      () =>
        isResubmit
          ? actions.reSubmitTask(taskIdBig, note, githubURL)
          : actions.requestSubmitTask(taskIdBig, githubURL, note),
      true
    );
  };

  const handleRequestRevision = (note: string, additionalHours: number) =>
    runAction("revision", () => actions.requestRevision(taskIdBig, note, BigInt(additionalHours)), true);

  // No more manual ETH input — the amount comes straight from getCreatorStake().
  const handleActivate = () => {
    if (creatorStakeWei === undefined) return;
    runAction("activate", () => actions.activateTask(taskIdBig, creatorStakeWei), true);
  };

  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-3 hover:border-gray-700 transition-colors group">
      {overlay === "details" && <DetailsModal task={task} full={liveTaskData} onClose={() => setOverlay(null)} />}

      {overlay === "requests" && (
        <JoinRequestsModal
          task={task}
          busy={busyKey}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === "submission" && (
        <SubmissionModal
          task={task}
          busy={isBusy}
          onApprove={handleApprove}
          onRequestRevision={() => setOverlay("revisionForm")}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === "submitForm" && (
        <SubmitFormModal
          isResubmit={submitStatus === SubmitStatus.RevisionNeeded}
          busy={isBusy}
          onSubmit={handleSubmitWork}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === "revisionForm" && (
        <RevisionFormModal busy={isBusy} onSubmit={handleRequestRevision} onClose={() => setOverlay(null)} />
      )}

      {overlay === "activateForm" && (
        <ActivateConfirmModal
          busy={isBusy}
          amountWei={creatorStakeWei}
          isLoading={isStakeLoading}
          onConfirm={handleActivate}
          onClose={() => setOverlay(null)}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white leading-snug">{task.projectTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">{task.category}</p>
        </div>
        <button
          onClick={() => setOverlay("details")}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-400"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={["h-full rounded-full transition-all", isOwner ? "bg-indigo-500" : "bg-teal-500"].join(" ")}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600">
          {submitStatus !== undefined ? SUBMIT_STATUS_LABEL[submitStatus] : task.category}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div
          className={[
            "inline-flex items-center gap-1 text-[10px] font-medium rounded-full border px-2 py-0.5",
            ROLE_STYLES[task.role],
          ].join(" ")}
        >
          {ROLE_ICONS[task.role]}
          {ROLE_LABEL[task.role]}
          {task.counterpartyName && <span className="opacity-70">· {task.counterpartyName}</span>}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {task.deadline}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-mono text-indigo-300">{formatWeiSafe(task.reward)} ETH</span>
          <span className="text-[10px] text-gray-600">(${task.rewardUSD.toLocaleString()})</span>
        </div>

        <div className="flex gap-1.5 flex-wrap justify-end">
          <button
            onClick={() => setOverlay("details")}
            className="text-[10px] text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View
          </button>

          {task.tab === "Created" && isOwner && (
            <>
            <button
              onClick={() => setOverlay("activateForm")}
              className="text-[10px] text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-500/60 bg-blue-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
            >
              <Rocket className="w-3 h-3" /> Activate
            </button>

            <button
                disabled={isBusy}
                onClick={handleDelete}
                className="text-[10px] text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/60 bg-red-500/10 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {busyKey === "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </button>
              </>
          )}

        {task.tab === "Active" && isOwner && (
          <>
            <button
              disabled={isBusy}
              onClick={handleOpenRegistration}
              className="text-[10px] text-violet-300 hover:text-violet-200 border border-violet-500/30 hover:border-violet-500/60 bg-violet-500/10 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {busyKey === "openRegistration" ? <Loader2 className="w-3 h-3 animate-spin" /> : <DoorOpen className="w-3 h-3" />}
              Open Registration
            </button>
            <button
              disabled={isBusy}
              onClick={handleDelete}
              className="text-[10px] text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/60 bg-red-500/10 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {busyKey === "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Delete
            </button>
          </>
        )}

        {task.tab === "OpenRegistration" && isOwner && (
          <>
            <button
              onClick={() => setOverlay("requests")}
              className="text-[10px] text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3" /> Requests
              {!!task.joinRequestCount && (
                <span className="ml-0.5 rounded-full bg-indigo-500/30 px-1.5 text-[9px]">{task.joinRequestCount}</span>
              )}
            </button>
            <button
              disabled={isBusy}
              onClick={handleCloseRegistration}
              className="text-[10px] text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {busyKey === "closeRegistration" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
              Close
            </button>
            <button
              disabled={isBusy}
              onClick={handleDelete}
              className="text-[10px] text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/60 bg-red-500/10 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {busyKey === "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Delete
            </button>
          </>
        )}

        {task.tab === "InProgres" && (
          <>
            {!isOwner && (submitStatus === undefined || submitStatus === SubmitStatus.NoneStatus) && (
              <button
                onClick={() => setOverlay("submitForm")}
                className="text-[10px] text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Submit
              </button>
            )}
            <button
              disabled={isBusy}
              onClick={handleCancel}
              className="text-[10px] text-orange-300 hover:text-orange-200 border border-orange-500/30 hover:border-orange-500/60 bg-orange-500/10 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {busyKey === "cancel" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Cancel
            </button>
          </>
        )}

        {task.tab === "Review" && (
          <>
            {isOwner && (
              <button
                onClick={() => setOverlay("submission")}
                className={[
                  "text-[10px] border rounded-lg px-2 py-1 transition-colors flex items-center gap-1",
                  submitStatus === SubmitStatus.Pending
                    ? "text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                    : "text-gray-400 border-gray-700 hover:border-gray-600",
                ].join(" ")}
              >
                <RotateCcw className="w-3 h-3" /> Review Submission
              </button>
            )}
            {!isOwner && submitStatus === SubmitStatus.RevisionNeeded && (
              <button
                onClick={() => setOverlay("submitForm")}
                className="text-[10px] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Resubmit
              </button>
            )}
            <button
              disabled={isBusy}
              onClick={handleCancel}
              className="text-[10px] text-orange-300 hover:text-orange-200 border border-orange-500/30 hover:border-orange-500/60 bg-orange-500/10 rounded-lg px-2 py-1 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {busyKey === "cancel" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
    </div >
  );
}