import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";
import { useState, useCallback } from "react";

/*
const taskInfo: {
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
} | {
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
 ... 4 more ...;
 exists: boolean;
}
*/

export const useGetTaskUtils = (id?: bigint) => {
    const { task, data, form, user } = useTaskController();
    const {
        data: taskDataState,
        form: taskDataForm,
    } = useTaskData();

    const [taskId, setTaskId] = useState<bigint | undefined>(undefined);

    const resolveTaskId = (Pid?: bigint): bigint => {
        const resolvedId = taskId ?? id ?? Pid;

        if (resolvedId === undefined) {
            throw new Error("No task ID provided");
        }

        return resolvedId;
    };

    const getTaskData = useCallback((Pid?: bigint) => {
        const resolvedId = resolveTaskId(Pid);

        taskDataForm.setId(resolvedId);

        return taskDataState.task;
    }, [taskId, id, taskDataForm, taskDataState]);

    const getJoinRequestCount = useCallback((Pid?: bigint) => {
        const resolvedId = resolveTaskId(Pid);

        task.setDeleteTaskId(resolvedId);

        return data.joinRequestCount;
    }, [taskId, id, task, data]);

    const getMemberRequiredStake = useCallback((Pid?: bigint) => {
        const resolvedId = resolveTaskId(Pid);

        task.setDeleteTaskId(resolvedId);

        return data.memberRequiredStake;
    }, [taskId, id, task, data]);

    const getCreatorStake = useCallback((Pid?: bigint) => {
        const taskInfo = getTaskData(Pid);

        if (!taskInfo) {
            return undefined;
        }

        form.setDeadlineHours(taskInfo.deadlineHours);
        form.setMaxRevision(taskInfo.maxRevision);
        form.setRewardWei(taskInfo.reward.toString());
        user.setCreatorStakeCaller(taskInfo.creator);

        return data.creatorStake;
    }, [getTaskData, form, user, data]);

    const getProjectValue = useCallback((Pid?: bigint) => {
        const taskInfo = getTaskData(Pid);

        if (!taskInfo) {
            return undefined;
        }

        form.setDeadlineHours(taskInfo.deadlineHours);
        form.setMaxRevision(taskInfo.maxRevision);
        form.setRewardWei(taskInfo.reward.toString());

        user.setProjectValueCaller(
            taskInfo.creator ?? taskInfo.member
        );

        return data.projectValue;
    }, [getTaskData, form, user, data]);

    return {
        taskId,
        setTaskId,
        getTaskData,
        getJoinRequestCount,
        getMemberRequiredStake,
        getCreatorStake,
        getProjectValue,
    };
};

export default useGetTaskUtils;