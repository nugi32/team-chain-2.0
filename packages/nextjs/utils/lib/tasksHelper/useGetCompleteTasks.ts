import { useEffect, useMemo, useState } from "react";

import { TaskStatus, useLoopTasks } from "@/utils/lib/tasksHelper/useLoopTasks";
import { getTaskBySmartContractId } from "@/utils/lib/express/queries/tasks";
import { useAccount } from "wagmi";

//packages/nextjs/utils/lib/tasksHelper/useGetCompleteTasks.ts
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

export const useGetCompleteTasks = (address?: string) => {
    const { validTasks, taskCounter, loading } = useLoopTasks();
      const { address: connectedAddress } = useAccount();

    const creator = address ?? connectedAddress;
    const member = address ?? connectedAddress;

    const [completeTasks, setCompleteTasks] = useState<
        CompleteTaskOutput[]
    >([]);

    const [isLoadingCompleteTasks, setIsLoadingCompleteTasks] =
        useState(false);

    useEffect(() => {
        const loadCompleteTasks = async () => {
            if (!validTasks.length) {
                setCompleteTasks([]);
                return;
            }

            setIsLoadingCompleteTasks(true);

            try {
                console.log(
                    `[useGetCompleteTasks] Valid tasks to process: ${validTasks.length} tasks`,
                    validTasks.map((t) => `Task #${t.taskId}`)
                );
                const mergedTasks = await Promise.all(
                    validTasks.map(async (task) => {
                        try {
                            console.log(
                                `[useGetCompleteTasks] Processing Task #${task.taskId}:`,
                                task
                            );
                            const dbTask = await getTaskBySmartContractId(
                                (task.taskId).toString()
                            );

                            if (!dbTask) {
                                console.warn(
                                    `[useGetCompleteTasks] No database task found for smart contract task #${task.taskId}`
                                );

                                console.log(
                                    `[useGetCompleteTasks] SC Task ID: #${String(task.taskId)}`
                                );

                                const dbTask =
                                    await getTaskBySmartContractId(
                                        (task.taskId).toString()
                                    );

                                console.log(
                                    `[useGetCompleteTasks] DB RESULT for Task #${task.taskId}:`,
                                    dbTask
                                );
                                return null;
                            }

                            const completeTask: CompleteTaskOutput = {
                                // Smart Contract
                                smartContractId: Number(task.taskId),
                                status: Number(task.status) as TaskStatus,
                                value: Number(task.value),
                                reward: Number(task.reward),
                                deadlineAt: Number(task.deadlineAt),
                                createdAt: Number(task.createdAt),
                                creatorStake: Number(task.creatorStake),
                                memberStake: Number(task.memberStake),
                                maxRevision: Number(task.maxRevision),
                                deadlineHours: Number(task.deadlineHours),
                                creator: task.creator,
                                member: task.member,
                                githubURL: task.githubURL,
                                isMemberStakeLocked:
                                    task.isMemberStakeLocked,
                                isCreatorStakeLocked:
                                    task.isCreatorStakeLocked,
                                isRewardClaimed: task.isRewardClaimed,
                                exists: task.exists,

                                // Express
                                expressId: dbTask.id,
                                projectName: dbTask.projectName,
                                objective: dbTask.objective,
                                category: dbTask.category,
                                effort: dbTask.effort,
                                minReputation: dbTask.minReputation,
                                roles: dbTask.roles,
                                skills: dbTask.skills,
                                description: dbTask.description,
                                badges: dbTask.badges,
                                milestones: dbTask.milestones,
                                stakeRequired: dbTask.stakeRequired,
                                owner: dbTask.owner,
                            };

                            return completeTask;
                        } catch (error) {
                            console.error(
                                `[useGetCompleteTasks] Failed to load Task #${task.taskId}:`,
                                error
                            );

                            return null;
                        }
                    })
                );

                const validTasksCheck = mergedTasks.filter(
                    (
                        task
                    ): task is CompleteTaskOutput =>
                        task !== null
                );

                setCompleteTasks(validTasksCheck);
            } finally {
                setIsLoadingCompleteTasks(false);
            }
        };

        loadCompleteTasks();
    }, [validTasks]);

    const getTasksByStatus = (status: TaskStatus) => {
        return completeTasks.filter(
            task => task.status === status
        );
    };

    const createdTasks = useMemo(
        () => getTasksByStatus(TaskStatus.Created),
        [completeTasks]
    );

    const activeTasks = useMemo(
        () => getTasksByStatus(TaskStatus.Active),
        [completeTasks]
    );

    const openRegistrationTasks = useMemo(
        () => getTasksByStatus(TaskStatus.OpenRegistration),
        [completeTasks]
    );

    const inProgressTasks = useMemo(
        () => getTasksByStatus(TaskStatus.InProgres),
        [completeTasks]
    );

    const completedTasks = useMemo(
        () => getTasksByStatus(TaskStatus.Completed),
        [completeTasks]
    );

    const cancelledTasks = useMemo(
        () => getTasksByStatus(TaskStatus.Cancelled),
        [completeTasks]
    );

    const creatorTasks = useMemo(() => {
        if (!creator) return [];

        return validTasks.filter(
            task =>
                task.creator?.toLowerCase() === creator.toLowerCase()
        );
    }, [validTasks, creator]);

    const memberTasks = useMemo(() => {
        if (!member) return [];

        return validTasks.filter(
            task =>
                task.member?.toLowerCase() === member.toLowerCase()
        );
    }, [validTasks, member]);

    const latestMemberTask = useMemo(() => {
        return memberTasks.length
            ? memberTasks[memberTasks.length - 1]
            : null;
    }, [memberTasks]);

    const latestCreatorTask = useMemo(() => {
        return creatorTasks.length
            ? creatorTasks[creatorTasks.length - 1]
            : null;
    }, [creatorTasks]);

    return {
        taskCounter,

        tasks: completeTasks,

        creatorTasks,
        latestCreatorTask,

        createdTasks,
        activeTasks,
        openRegistrationTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,

        getTasksByStatus,

        loading: {
            ...loading,
            completeTasks: isLoadingCompleteTasks,
            isLoading:
                loading.isLoading || isLoadingCompleteTasks,
        },
    };
};