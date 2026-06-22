// utils/lib/dashboard/mapTasksToKanban.ts

import { CompleteTaskOutput } from "@/utils/lib/tasksHelper/useGetCompleteTasks";
import { TaskStatus } from "@/utils/lib/tasksHelper/useLoopTasks";
import {
  KanbanTask,
  TabType,
  TaskRole,
  UserTask,
  SubmitStatus,
} from "@/utils/lib/dashboard";
import { weiToUsd } from "@/utils/globalLib/weiToUsd";
import { useGetTaskData } from "./useGetTaskData";

// NOTE: There is no `Review` value in the on-chain TaskStatus enum.
// The contract keeps a task at `InProgres` both while the member is working
// AND while a submission is sitting pending/needs-revision. "Review" is a
// frontend-only concept: InProgres + (submission Pending OR RevisionNeeded).
// Because of that, STATUS_TO_TAB on its own can never produce "Review" —
// it is derived afterwards in mapTaskToKanbanTask using the live submitStatus.
const STATUS_TO_TAB: Partial<Record<TaskStatus, TabType>> = {
  [TaskStatus.Created]: "Created",
  [TaskStatus.OpenRegistration]: "OpenRegistration",
  [TaskStatus.Active]: "Active",
  [TaskStatus.InProgres]: "InProgres",
  [TaskStatus.Completed]: "Completed",
  [TaskStatus.Cancelled]: "Cancelled",
};

const STATUS_PROGRESS: Partial<Record<TaskStatus, number>> = {
  [TaskStatus.Created]: 10,
  [TaskStatus.OpenRegistration]: 25,
  [TaskStatus.Active]: 50,
  [TaskStatus.InProgres]: 75,
  [TaskStatus.Completed]: 100,
  [TaskStatus.Cancelled]: 0,
};

const shortAddr = (addr?: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Unknown";

type GetTaskDataHook = ReturnType<typeof useGetTaskData>;

/**
 * Decides the final Kanban tab for a task.
 *
 * Base tab comes from the on-chain TaskStatus. Then, if the task is
 * InProgres AND there's an active submission (Pending or RevisionNeeded),
 * we bump it into the "Review" column. Accepted/NoneStatus submissions
 * do not trigger Review — Accepted means the contract has already moved
 * on (e.g. to Completed), and NoneStatus means nothing was submitted yet.
 */
const deriveTab = (
  contractStatus: TaskStatus,
  submitStatus: SubmitStatus | undefined,
): TabType => {
  const baseTab = STATUS_TO_TAB[contractStatus] ?? "Created";

  const hasActiveSubmission =
    submitStatus === SubmitStatus.Pending ||
    submitStatus === SubmitStatus.RevisionNeeded;

  if (baseTab === "InProgres" && hasActiveSubmission) {
    return "InProgres";
  }

  return baseTab;
};

export const mapTaskToKanbanTask = async (
  task: CompleteTaskOutput,
  getTaskDataHook: GetTaskDataHook,
  walletAddress?: string,
): Promise<KanbanTask> => {
  const taskId = Number(task.smartContractId);
  console.debug(`[Kanban] Starting to map Task #${taskId} (${task.projectName})`);

  const isCreator =
    !!walletAddress &&
    task.creator.toLowerCase() === walletAddress.toLowerCase();

  const deadlineMs = task.deadlineAt * 1000;
  const daysLeft = Math.ceil(
    (deadlineMs - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const rewardUSD = await weiToUsd(BigInt(task.reward));

  // Use async getters to safely fetch data in parallel contexts
  // These wait for the contract data to load before returning
  let joinRequests: any = undefined;
  let joinRequestCount: any = undefined;
  let submitContent: any = undefined;

  try {
    console.debug(`[Kanban] Fetching join requests for Task #${taskId}...`);
    joinRequests = await getTaskDataHook.data.getTaskJoinRequestAsync(taskId);
    console.debug(`[Kanban] Got join requests for Task #${taskId}:`, joinRequests?.length || 0);
  } catch (err) {
    console.error(`[Kanban] Error fetching join requests for Task #${taskId}:`, err);
    joinRequests = undefined;
  }

  try {
    console.debug(`[Kanban] Fetching join request count for Task #${taskId}...`);
    joinRequestCount = await getTaskDataHook.data.getTaskJoinRequestCountAsync(taskId);
    console.debug(`[Kanban] Got join request count for Task #${taskId}:`, joinRequestCount);
  } catch (err) {
    console.error(`[Kanban] Error fetching join request count for Task #${taskId}:`, err);
    joinRequestCount = undefined;
  }

  try {
    console.debug(`[Kanban] Fetching submit content for Task #${taskId}...`);
    // getTaskSubmitContentAsync internally calls ensureTaskId(taskId) and polls
    // loading.submitContent until it settles. That guarantees lastRequestedIdRef
    // === taskId by the time this resolves — which is exactly what makes it safe
    // to read getTaskSubmitStatus(taskId) synchronously right after, even though
    // tasks are processed sequentially and the hook instance is shared across
    // the whole batch.
    submitContent = await getTaskDataHook.data.getTaskSubmitContentAsync(taskId);
    console.debug(`[Kanban] Got submit content for Task #${taskId}`);
  } catch (err) {
    console.error(`[Kanban] Error fetching submit content for Task #${taskId}:`, err);
    submitContent = undefined;
  }

  // Resolve the real SubmitStatus directly from the shared hook.
  // BUG FIX: this used to be hardcoded to SubmitStatus.NoneStatus, which made
  // it impossible to ever derive the "Review" tab. getTaskSubmitStatus is a
  // synchronous getter, but since getTaskSubmitContentAsync above already
  // ensured taskId is loaded for this exact task, this read reflects the live
  // contract value rather than a stale/wrong task's status.
  const rawSubmitStatus = getTaskDataHook.data.getTaskSubmitStatus(taskId);

  const resolvedSubmitStatus: SubmitStatus =
    rawSubmitStatus !== undefined && Number(rawSubmitStatus) in SubmitStatus
      ? (Number(rawSubmitStatus) as SubmitStatus)
      : SubmitStatus.NoneStatus;

  console.debug(`[Kanban] Task #${taskId} resolved submitStatus:`, resolvedSubmitStatus);

  return {
    id: String(task.smartContractId),
    contractId: task.smartContractId,

    // BUG FIX: tab is no longer a direct lookup. It's derived from contract
    // status + the live submit status, so InProgres + Pending/RevisionNeeded
    // submission correctly lands the card on "Review" instead of staying
    // stuck on "InProgres".
    tab: deriveTab(task.status, resolvedSubmitStatus),
    role: isCreator ? TaskRole.creator : TaskRole.member,

    projectTitle: task.projectName,
    category: task.category,

    reward: task.reward,
    rewardUSD,

    deadline: new Date(deadlineMs).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),

    daysLeft,
    isOverdue: daysLeft < 0,

    progress: STATUS_PROGRESS[task.status] ?? 0,

    counterpartyName: isCreator
      ? shortAddr(task.member)
      : shortAddr(task.creator),

    tags: task.skills ?? [],

    joinRequest: joinRequests
      ? joinRequests.map((jr: any) => ({
          applicant: jr.applicant,
          stakeAmount: jr.stakeAmount,
          status: jr.status as UserTask,
          isPending: jr.isPending,
          hasWithdrawn: jr.hasWithdrawn,
        }))
      : undefined,

    joinRequestCount: joinRequestCount
      ? Number(joinRequestCount)
      : 0,

    submitContent: submitContent
      ? {
          githubURL: submitContent[0],
          note: submitContent[1],
          address: "",
          // BUG FIX: was hardcoded to SubmitStatus.NoneStatus before, so the
          // UI (SubmissionModal, the Review-tab buttons in TaskCard) always
          // showed "Not submitted" no matter what. Now reflects the same
          // resolved status used for tab derivation above.
          status: resolvedSubmitStatus,
          revisionTime: 0n,
          newDeadline: 0n,
        }
      : undefined,
  };
};

export const mapTasksToKanbanTasks = async (
  tasks: CompleteTaskOutput[],
  getTaskDataHook: GetTaskDataHook,
  walletAddress?: string,
): Promise<KanbanTask[]> => {
  const kanbanTasks: KanbanTask[] = [];

  console.debug(`[Kanban] Processing ${tasks.length} tasks sequentially...`);

  // Process tasks SEQUENTIALLY to avoid race conditions with shared hook
  // (Parallel processing causes taskId conflicts when multiple tasks fetch simultaneously)
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      console.debug(
        `[Kanban] Processing task ${i + 1}/${tasks.length}: Task #${Number(task.smartContractId)}`
      );

      const kanbanTask = await mapTaskToKanbanTask(
        task,
        getTaskDataHook,
        walletAddress,
      );
      kanbanTasks.push(kanbanTask);
    } catch (err) {
      console.error(
        `[Kanban] Failed to map Task #${Number(task.smartContractId)}:`,
        err
      );
      // Continue processing other tasks
    }
  }

  console.debug(`[Kanban] Successfully mapped ${kanbanTasks.length}/${tasks.length} tasks`);
  return kanbanTasks;
};