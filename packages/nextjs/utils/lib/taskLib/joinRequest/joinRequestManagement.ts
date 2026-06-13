import { useState } from "react";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";
import { getTaskById } from "@/utils/lib/express/queries/tasks";

export function useJoinRequestManagement() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, task, user } = useTaskController();

    const acceptRequest = async (
        expressTaskId: string,
        applicantAddress: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setApproveTaskId(BigInt(taskData.smartContractId))
            user.setApproveApplicant(applicantAddress);

            await actions.handleApproveJoinRequest();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    const acceptRequestAndRejectOther = async (
        expressTaskId: string,
        applicantAddress: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setHandleApproveJoinRequestAndRejectOthersId(BigInt(taskData.smartContractId))
            user.setHandleApproveJoinRequestAndRejectOthersApplicant(applicantAddress);

            await actions.handleApproveJoinRequestAndRejectOthers();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    const rejectRequest = async (
        expressTaskId: string,
        applicantAddress: string
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            const taskData = await getTaskById(expressTaskId);
            task.setRejectTaskId(BigInt(taskData.smartContractId))
            user.setRejectApplicant(applicantAddress);

            await actions.handleRejectJoinRequest();

            setIsLoading(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    return {
        acceptRequest,
        acceptRequestAndRejectOther,
        rejectRequest,
        isLoading,
        error,
    };
}