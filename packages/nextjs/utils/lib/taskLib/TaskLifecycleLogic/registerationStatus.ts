import { useState } from "react";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";
import { getTaskById } from "@/utils/lib/express/queries/tasks";

export function useTaskRegisteration() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, task } = useTaskController();

    const openTask = async (
        expressTaskId: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setOpenRegTaskId(BigInt(taskData.smartContractId))

            await actions.handleOpenRegistration();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    const closeTask = async (
        expressTaskId: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setCloseRegTaskId(BigInt(taskData.smartContractId))

            await actions.handleCloseRegistration();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    return {
        openTask,
        closeTask,
        isLoading,
        error,
    };
}