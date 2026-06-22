import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";
import { useRef, useCallback } from "react";

/**
 * Hook to fetch task data for a specific task ID.
 * Returns getter functions that properly fetch data using useTaskData with the correct taskId.
 *
 * IMPORTANT: These getters return data synchronously but may need time to load from contract.
 * For safe usage in async contexts (like mapTasksToKanban), check loading states.
 */
export const useGetTaskData = () => {
    const lastRequestedIdRef = useRef<number | null>(null);
    const { form, data, loading } = useTaskData();

    /**
     * Helper to ensure the correct taskId is loaded.
     * Returns the current data object.
     */
    const ensureTaskId = useCallback(
        (taskId: number) => {
            if (lastRequestedIdRef.current !== taskId) {
                lastRequestedIdRef.current = taskId;
                form.setId(BigInt(taskId));
            }
            return data;
        },
        [form, data]
    );

    /**
     * Helper to wait for a specific data field to load.
     * Returns a promise that resolves when the field is no longer loading.
     * 
     * IMPORTANT: Also checks that lastRequestedIdRef matches the requested taskId
     * to prevent race conditions when multiple tasks fetch in parallel.
     */
    const waitForDataField = useCallback(
        async (taskId: number, fieldName: keyof typeof loading): Promise<boolean> => {
            const startTime = Date.now();
            const timeout = 5000; // 5 second timeout per field

            ensureTaskId(taskId);

            // Poll the loading state, ensuring:
            // 1. The field is not loading
            // 2. We're still loading the correct taskId (prevents race conditions)
            while (Date.now() - startTime < timeout) {
                const isLoadingComplete = !loading[fieldName];
                const isCorrectTask = lastRequestedIdRef.current === taskId;

                if (isLoadingComplete && isCorrectTask) {
                    console.debug(
                        `[useGetTaskData] Data ready for Task #${taskId}.${fieldName}`
                    );
                    return true; // Data loaded for correct task
                }

                // If we're loading a different task now, that's bad - someone else interrupted us
                if (!isLoadingComplete && !isCorrectTask) {
                    console.warn(
                        `[useGetTaskData] Task #${taskId}.${fieldName} interrupted by Task #${lastRequestedIdRef.current}`
                    );
                }

                await new Promise((resolve) => setTimeout(resolve, 50)); // Wait 50ms before checking again
            }

            console.warn(
                `[useGetTaskData] Timeout waiting for Task #${taskId}.${fieldName} (current: #${lastRequestedIdRef.current})`
            );
            return false;
        },
        [ensureTaskId, loading, lastRequestedIdRef]
    );

    // Synchronous getters (immediate return, may be undefined if loading)
    const getTaskData = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.task;
        },
        [ensureTaskId]
    );

    const getTaskStatus = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.taskStatus;
        },
        [ensureTaskId]
    );

    const getTaskParticipants = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.taskParticipants;
        },
        [ensureTaskId]
    );

    const getTaskFinancials = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.taskFinancials;
        },
        [ensureTaskId]
    );

    const getTaskMetadata = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.taskMetadata;
        },
        [ensureTaskId]
    );

    const getTaskFlags = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.taskFlags;
        },
        [ensureTaskId]
    );

    const getTaskJoinRequest = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.joinRequests;
        },
        [ensureTaskId]
    );

    const getTaskJoinRequestsByIndex = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.joinRequestByIndex;
        },
        [ensureTaskId]
    );

    const getTaskJoinRequestCount = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.joinRequestCount;
        },
        [ensureTaskId]
    );

    const getTaskSubmit = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.taskSubmit;
        },
        [ensureTaskId]
    );

    const getTaskSubmitStatus = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.submitStatus;
        },
        [ensureTaskId]
    );

    const getTaskSubmitContent = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.submitContent;
        },
        [ensureTaskId]
    );

    const getTaskSubmitRevision = useCallback(
        (taskId: number) => {
            const currentData = ensureTaskId(taskId);
            return currentData.submitRevision;
        },
        [ensureTaskId]
    );

    // Async versions for safe parallel fetching
    const getTaskJoinRequestAsync = useCallback(
        async (taskId: number) => {
            await waitForDataField(taskId, "joinRequests");
            return getTaskJoinRequest(taskId);
        },
        [waitForDataField, getTaskJoinRequest]
    );

    const getTaskJoinRequestCountAsync = useCallback(
        async (taskId: number) => {
            await waitForDataField(taskId, "joinRequestCount");
            return getTaskJoinRequestCount(taskId);
        },
        [waitForDataField, getTaskJoinRequestCount]
    );

    const getTaskSubmitContentAsync = useCallback(
        async (taskId: number) => {
            await waitForDataField(taskId, "submitContent");
            return getTaskSubmitContent(taskId);
        },
        [waitForDataField, getTaskSubmitContent]
    );

    return {
        data: {
            // Synchronous getters (immediate return)
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

            // Async getters for safe parallel fetching (wait for data to load)
            getTaskJoinRequestAsync,
            getTaskJoinRequestCountAsync,
            getTaskSubmitContentAsync,
        },
        loading,
        lastRequestedTaskId: lastRequestedIdRef.current,
    };
};