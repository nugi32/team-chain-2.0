import { getAllTasks } from "@/utils/lib/express/queries/tasks";
import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";

// ======================================================
// ENUMS (match Solidity)
// ======================================================

export enum TaskStatus {
    NonExistent = 0,
    Created = 1,
    Active = 2,
    OpenRegistration = 3,
    InProgres = 4,
    Completed = 5,
    Cancelled = 6,
}

export enum UserTask {
    None = 0,
    Request = 1,
    Accepted = 2,
    Rejected = 3,
    Cancelled = 4,
}

export enum SubmitStatus {
    NoneStatus = 0,
    Pending = 1,
    RevisionNeeded = 2,
    Accepted = 3,
}

// ======================================================
// OFFCHAIN TYPES
// ======================================================

export type TaskDescription = {
    header: string;
    summary: string;
    points: string[];
    footer: string;
};

export type OffchainTask = {
    id: string; // UUID
    smartContractId: number;

    title: string;
    description: TaskDescription;
    picture: string;
    skills: string[];
    owner: string;

    _id?: string;
};

// ======================================================
// ONCHAIN TYPES
// ======================================================

export type OnchainTask = {
    status: TaskStatus;

    taskId: number;
    value: bigint;
    reward: bigint;

    deadlineAt: bigint;
    createdAt: bigint;

    creatorStake: bigint;
    memberStake: bigint;

    maxRevision: number;
    deadlineHours: number;

    creator: string;
    member: string;

    title: string;
    githubURL: string;

    isMemberStakeLocked: boolean;
    isCreatorStakeLocked: boolean;
    isRewardClaimed: boolean;
    exists: boolean;
};

// ======================================================
// MERGED TYPE
// ======================================================

export type Task = OffchainTask &
    Partial<OnchainTask>;

// ======================================================
// HOOK
// ======================================================

export function useExplore() {
    // NOTE: The blockchain hooks (useTaskData) can only be called at component level
    // This utility function returns offchain tasks only. For onchain data, use
    // useTaskData hook directly in components.

    const getOnchainTasks = async (): Promise<OnchainTask[]> => {
        try {
            // TODO: Implement onchain task fetching using viem publicClient
            // or refactor calling code to use useTaskData hook at component level
            return [];
        } catch (error) {
            console.error("Error fetching onchain tasks:", error);
            return [];
        }
    };

    const getOffchainTasks = async (): Promise<OffchainTask[]> => {
        try {
            const tasks = await getAllTasks();
            return tasks as OffchainTask[];
        } catch (error) {
            console.error("Error fetching offchain tasks:", error);
            return [];
        }
    };

    const getTasks = async (): Promise<Task[]> => {
        try {
            const [onchainTasks, offchainTasks] = await Promise.all([
                getOnchainTasks(),
                getOffchainTasks(),
            ]);

            const onchainMap = new Map(
                onchainTasks.map((task) => [task.taskId, task])
            );

            const mergedTasks: Task[] = offchainTasks.map((offchainTask) => ({
                ...offchainTask,
                ...(onchainMap.get(offchainTask.smartContractId) ?? {}),
            }));

            return mergedTasks;
        } catch (error) {
            console.error("Error merging tasks:", error);
            return [];
        }
    };

    return {
        getTasks,
        getOnchainTasks,
        getOffchainTasks,
    };
}