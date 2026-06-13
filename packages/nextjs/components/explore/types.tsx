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

/**
 * Raw shape returned by __getTask on-chain.
 * The contract returns ALL numeric fields as bigint; we map the small
 * ones (taskId, maxRevision, deadlineHours) to number in OnchainTask.
 */
export type RawContractTask = {
    status: number;
    taskId: bigint;
    value: bigint;
    reward: bigint;
    deadlineAt: bigint;
    createdAt: bigint;
    creatorStake: bigint;
    memberStake: bigint;
    maxRevision: bigint;
    deadlineHours: bigint;
    creator: string;
    member: string;
    title: string;
    githubURL: string;
    isMemberStakeLocked: boolean;
    isCreatorStakeLocked: boolean;
    isRewardClaimed: boolean;
    exists: boolean;
};

/**
 * Converts the raw ABI-decoded contract struct into the typed OnchainTask.
 * Scaffold-eth / wagmi infers ALL uint fields as bigint, so we cast the
 * small integer fields (taskId, maxRevision, deadlineHours) to number here.
 */
export function mapContractTask(raw: RawContractTask): OnchainTask {
    return {
        status: raw.status as TaskStatus,
        taskId: Number(raw.taskId),
        value: raw.value,
        reward: raw.reward,
        deadlineAt: raw.deadlineAt,
        createdAt: raw.createdAt,
        creatorStake: raw.creatorStake,
        memberStake: raw.memberStake,
        maxRevision: Number(raw.maxRevision),
        deadlineHours: Number(raw.deadlineHours),
        creator: raw.creator,
        member: raw.member,
        title: raw.title,
        githubURL: raw.githubURL,
        isMemberStakeLocked: raw.isMemberStakeLocked,
        isCreatorStakeLocked: raw.isCreatorStakeLocked,
        isRewardClaimed: raw.isRewardClaimed,
        exists: raw.exists,
    };
}

export type Task = OffchainTask & Partial<OnchainTask>;