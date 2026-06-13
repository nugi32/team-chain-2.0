import { useState } from "react";
import { useTaskController, DeleteTaskParams } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { handleDeleteTask } from "@/utils/lib/express/mutations/tasks";
import { useAccount } from "wagmi";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import { getTaskById } from "@/utils/lib/express/queries/tasks";

export function useTaskDelete() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, task, user } = useTaskController();

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

            user.setDeleteUser(address);

            task.setDeleteTaskId(BigInt(taskData.smartContractId));

            await actions.handleDeleteTask();
    
            const jwt = await getValidJwt(address);

            await handleDeleteTask(expressTaskId, jwt);
 
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