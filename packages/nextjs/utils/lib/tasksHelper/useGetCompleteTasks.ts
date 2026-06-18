import { useEffect, useMemo, useState } from "react";

import { TaskStatus, useLoopTasks } from "@/utils/lib/tasksHelper/useLoopTasks";
import { getTaskBySmartContractId } from "@/utils/lib/express/queries/tasks";

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
    title: string;
    description: string;
    picture: string;
    owner: string;
}

export const useGetCompleteTasks = (address?: string) => {
    const { tasks, taskCounter, loading } = useLoopTasks(address);

    const [completeTasks, setCompleteTasks] = useState<
        CompleteTaskOutput[]
    >([]);

    const [isLoadingCompleteTasks, setIsLoadingCompleteTasks] =
        useState(false);

    useEffect(() => {
        const loadCompleteTasks = async () => {
            if (!tasks.length) {
                setCompleteTasks([]);
                return;
            }

            setIsLoadingCompleteTasks(true);

            try {
                const mergedTasks = await Promise.all(
                    tasks.map(async task => {
                        try {
                            const dbTask = await getTaskBySmartContractId(
                                String(task.taskId)
                            );

                            if (!dbTask) {
                                console.warn(
                                    `No database task found for smart contract task ${task.taskId}`
                                );

                                console.log(
                                    "SC ID:",
                                    String(task.taskId)
                                );

                                const dbTask =
                                    await getTaskBySmartContractId(
                                        String(task.taskId)
                                    );

                                console.log(
                                    "DB RESULT:",
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
                                title: dbTask.title,
                                description: dbTask.description,
                                picture: dbTask.picture,
                                owner: dbTask.owner,
                            };

                            return completeTask;
                        } catch (error) {
                            console.error(
                                `Failed to load task ${task.taskId}`,
                                error
                            );

                            return null;
                        }
                    })
                );

                const validTasks = mergedTasks.filter(
                    (
                        task
                    ): task is CompleteTaskOutput =>
                        task !== null
                );

                setCompleteTasks(validTasks);
            } finally {
                setIsLoadingCompleteTasks(false);
            }
        };

        loadCompleteTasks();
    }, [tasks]);

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
        if (!address) return [];

        return completeTasks.filter(
            task =>
                task.creator.toLowerCase() ===
                address.toLowerCase()
        );
    }, [completeTasks, address]);

    const latestCreatorTask = useMemo(() => {
        return creatorTasks.length > 0
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