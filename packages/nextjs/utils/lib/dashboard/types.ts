//utils/lib/dashboard/types.ts
import { CompleteTaskOutput } from "@/utils/lib/tasksHelper/useGetCompleteTasks";
import { TaskStatus } from "@/utils/lib/tasksHelper/useLoopTasks";

//========================================================
// Task Section
//========================================================

/*
export enum TaskStatus {
    NonExistent = 0,
    Created = 1,
    Active = 2,
    OpenRegistration = 3,
    InProgres = 4,
    Completed = 5,
    Cancelled = 6,
}

export interface CompleteTaskOutput {
    // Smart contract data
    smartContractId: number;
    status: TaskStatus;
    value: number;
    reward: number;
    deadlineAt: number;
    createdAt: number;
    creatorStake: number;
    memberStake: number;
    maxRevision: number;
    deadlineHours: number;
    creator: string;
    member: string;
    githubURL: string;
    isMemberStakeLocked: boolean;
    isCreatorStakeLocked: boolean;
    isRewardClaimed: boolean;
    exists: boolean;

    // Express data
    expressId: string;
    projectName: string;
    objective: string;
    category: string;
    effort: string;
    minReputation: string;
    roles: string[];
    skills: string[];
    description: string;
    badges: string[];
    milestones: unknown | null;
    stakeRequired: string;
    owner: string;
}
*/

export enum SubmitStatus {
    NoneStatus = 0,
    Pending = 1,
    RevisionNeeded = 2,
    Accepted = 3,
}

export enum TaskRole {
    creator = 0,
    member = 1,
}

export enum UserTask {
    None,
    Request,
    Accepted,
    Rejected,
    Cancelled
}

export type JoinRequestData = {
    applicant: string;
    stakeAmount: bigint;
    status: UserTask;
    isPending: boolean;
    hasWithdrawn: boolean;
}

export type TaskSubmitData = {
    githubURL: string;
    note: string;
    address: string;
    status: SubmitStatus;
    revisionTime: bigint;
    newDeadline: bigint;
}
//========================================================
// User Section
//========================================================

export interface offchainUserDataOutput {
    _id: string,
    walletAddress: string,
    name: string,
    email: string,
    github: string,
    linkedin: string,
    role: string,
    profilePicture: string,
    description: {
        header: string,
        summary: string,
        points: string[],
        footer: string,
    },
    owner: string,
    skills: string[],
}

export type onchainUserDataOutput = {
    totalTasksCreated: bigint;
    totalTasksCompleted: bigint;
    totalTasksFailed: bigint;
    reputation: bigint;
    balance: bigint;
    isRegistered: boolean;
    exists: boolean;
    GitProfile: string;
};

export type completeUserOutput =
    offchainUserDataOutput &
    onchainUserDataOutput;

//========================================================
// Kanban Section
//========================================================

export type TabType =
    | "Created"
    | "Active"
    | "OpenRegistration"
    | "InProgres"
    | "Review"
    | "Completed"
    | "Cancelled";

export const KANBAN_TABS: readonly TabType[] = [
    "Created",
    "Active",
    "OpenRegistration",
    "InProgres",
    "Review",
    "Completed",
    "Cancelled",
];

export const ALL_TABS = KANBAN_TABS;

export type KanbanTask = {
    id: string;
    contractId: number;

    tab: TabType;
    role: TaskRole;

    projectTitle: string;
    category: string;

    reward: number;
    rewardUSD: number;

    deadline: string;
    daysLeft: number;
    isOverdue: boolean;

    progress: number;

    counterpartyName?: string;

    tags: string[];

    // SC Data
    joinRequest?: JoinRequestData[];
    joinRequestCount?: number;

    submitContent?: TaskSubmitData;
};

export interface KanbanBoardProps {
    tabs: readonly TabType[];
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    tasks: KanbanTask[];
    onView?: (task: KanbanTask) => void;
    onActivate?: (task: KanbanTask) => void;
    onCloseRegistration?: (task: KanbanTask) => void;
    onViewRequests?: (task: KanbanTask) => void;
    onJoinRequest?: (task: KanbanTask) => void;
    onSubmit?: (task: KanbanTask) => void;
    onApprove?: (task: KanbanTask) => void;
}

export interface TabSelectorProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    tasks: KanbanTask[];
    showAllTabs?: boolean;
}

//========================================================
// Top Stats Section
//========================================================

export interface UserStats {
    // offchain
    name: string;
    walletAddress: string;
    role: string;
    skills: string[];
    github: string;
    profilePicture: string;
    // onchain
    reputation: bigint;
    totalTasksCreated: bigint;
    totalTasksCompleted: bigint;
    totalTasksFailed: bigint;
    balance: bigint;
    isRegistered: boolean;
    exists: boolean;
    GitProfile: string;
    // computed
    successRate: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    formattedBalance: string;
}
