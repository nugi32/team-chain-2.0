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

export const mapTaskToKanbanTask = async (
  task: CompleteTaskOutput,
  getTaskDataHook: GetTaskDataHook,
  walletAddress?: string,
): Promise<KanbanTask> => {
  const isCreator =
    !!walletAddress &&
    task.creator.toLowerCase() === walletAddress.toLowerCase();

  const deadlineMs = task.deadlineAt * 1000;
  const daysLeft = Math.ceil(
    (deadlineMs - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const rewardUSD = await weiToUsd(BigInt(task.reward));

  const taskId = Number(task.smartContractId);

  // Safely get task data with error handling for data that may not be loaded yet
  let joinRequests;
  let joinRequestCount;
  let submitContent;

  try {
    joinRequests = getTaskDataHook.data.getTaskJoinRequest(taskId);
  } catch (err) {
    joinRequests = undefined;
  }

  try {
    joinRequestCount = getTaskDataHook.data.getTaskJoinRequestCount(taskId);
  } catch (err) {
    joinRequestCount = undefined;
  }

  try {
    submitContent = getTaskDataHook.data.getTaskSubmitContent(taskId);
  } catch (err) {
    submitContent = undefined;
  }

  return {
    id: String(task.smartContractId),
    contractId: task.smartContractId,

    tab: STATUS_TO_TAB[task.status] ?? "Created",
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
      ? joinRequests.map((jr) => ({
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
          status: SubmitStatus.NoneStatus,
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
): Promise<KanbanTask[]> =>
  Promise.all(
    tasks.map((task) =>
      mapTaskToKanbanTask(task, getTaskDataHook, walletAddress),
    ),
  );