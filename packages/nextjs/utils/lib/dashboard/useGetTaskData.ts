import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";
import { useMemo } from "react";

export const useGetTaskData = () => {
    const { form, data } = useTaskData();

    // Return stable getter functions that capture form and data by closure.
    // We don't track form/data as dependencies because they're objects that get called
    // with form.setId() frequently, which would cause unnecessary re-renders.
    // The getters themselves are idempotent and just read current state.
    return useMemo(() => {
        const getTaskData = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.task;
        };

        const getTaskStatus = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.taskStatus;
        };

        const getTaskParticipants = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.taskParticipants;
        };

        const getTaskFinancials = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.taskFinancials;
        };

        const getTaskMetadata = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.taskMetadata;
        };

        const getTaskFlags = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.taskFlags;
        };

        const getTaskJoinRequest = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.joinRequests;
        };

        const getTaskJoinRequestsByIndex = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.joinRequestByIndex;
        };

        const getTaskJoinRequestCount = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.joinRequestCount;
        };

        const getTaskSubmit = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.taskSubmit;
        };

        const getTaskSubmitStatus = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.submitStatus;
        };

        const getTaskSubmitContent = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.submitContent;
        };

        const getTaskSubmitRevision = (taskId: number) => {
            form.setId(BigInt(taskId));
            return data.submitRevision;
        };

        return {
            data: {
                getTaskData,
                getTaskStatus,
                getTaskParticipants,
                getTaskFinancials,
                getTaskMetadata,
                getTaskFlags,
                getTaskJoinRequest,
                getTaskJoinRequestsByIndex,
                getTaskJoinRequestCount,
                getTaskSubmit,
                getTaskSubmitStatus,
                getTaskSubmitContent,
                getTaskSubmitRevision,
            },
        };
    }, []);
};