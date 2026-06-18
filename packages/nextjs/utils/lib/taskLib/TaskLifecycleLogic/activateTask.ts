import { useState } from "react";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";
import { getTaskById } from "@/utils/lib/express/queries/tasks";
import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";

export function useActivateTask() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, task, user, form, data } = useTaskController();

    const deleteTask = async (
        expressTaskId: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            const { data: taskDataResult } = useTaskData(Number(taskData.smartContractId));
            const onchainData = taskDataResult?.task;

            if (!onchainData) {
                throw new Error("Task data is not available yet.");
            }

            form.setDeadlineHours(onchainData.deadlineHours.toString());
            form.setMaxRevision(onchainData.maxRevision.toString());
            form.setRewardWei(onchainData.reward.toString());
            user.setCreatorStakeCaller(address);
            const creatorRequiredStake = data.creatorStake();

            if (creatorRequiredStake === undefined) {
                throw new Error("Unable to calculate the required stake for this task.");
            }

            form.setValue(creatorRequiredStake.toString());
            user.setActivateUser(address);
            task.setActivateTaskId(BigInt(taskData.smartContractId));

            await actions.handleActivateTask();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    return {
        deleteTask,
        isLoading,
        error,
    };
}