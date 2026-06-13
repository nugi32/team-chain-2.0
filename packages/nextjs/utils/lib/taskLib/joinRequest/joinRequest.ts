import { useState } from "react";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";
import { getTaskById } from "@/utils/lib/express/queries/tasks";

export function useJoinRequest() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, task, user } = useTaskController();

    const joinRequest = async (
        expressTaskId: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setJoinTaskId(BigInt(taskData.smartContractId))
            user.setJoinUser(address);

            await actions.handleRequestJoinTask();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    const withdrawRequest = async (
        expressTaskId: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setWithdrawTaskId(BigInt(taskData.smartContractId))
            user.setWithdrawUser(address);

            await actions.handleWithdrawJoinRequest();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    return {
        joinRequest,
        withdrawRequest,
        isLoading,
        error,
    };
}