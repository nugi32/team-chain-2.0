import { useState } from "react";
import { useTaskController, CreateTaskParams } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { handleCreateTask, type CreateTaskPayload } from "@/utils/lib/express/mutations/tasks";
import { useAccount } from "wagmi";
import { getValidJwt } from "@/utils/globalLib/walletAuth";

/**
 * Smart contract payload for on-chain task creation
 * Includes msg.value as a string to be converted to wei via parseEther()
 */
export interface SmartContractTaskPayload extends CreateTaskParams {
    value: string; // Amount in ETH as string, will be parsed to wei
}

/**
 * Express backend payload for off-chain task metadata storage
 */
export interface BackendTaskPayload extends CreateTaskPayload {}

/**
 * Combined result from both on-chain and off-chain creation
 */
export interface TaskCreationResult {
    expressId: string;
    transactionHash?: string;
}

export function useTaskCreation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, form, user } = useTaskController();

    /**
     * Create a task on-chain and store metadata off-chain
     * @param scPayload - Smart contract parameters (title, githubURL, deadline, revision, value in ETH)
     * @param backendPayload - Backend parameters (projectName, objective, category, skills, etc.)
     * @returns TaskCreationResult with expressId and optional transactionHash
     */
    const createTask = async (
        scPayload: SmartContractTaskPayload,
        backendPayload: BackendTaskPayload
    ): Promise<TaskCreationResult> => {
        setIsLoading(true);
        setError(null);

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            // Validate both payloads
            if (!scPayload || !backendPayload) {
                throw new Error("Both smart contract and backend payloads are required.");
            }

            // Set up smart contract parameters
            user.setCreateUser(address);
            form.setTitle(scPayload.title);
            form.setGithubUrl(scPayload.githubURL);
            form.setDeadlineHours(scPayload.deadlineHours);
            form.setMaxRevision(scPayload.maximumRevision);
            form.setValue(scPayload.value); // This will be parsed to wei in handleCreateTask

            // Execute on-chain transaction
            await actions.handleCreateTask();

            // Get JWT token for backend authentication
            const jwt = await getValidJwt(address);

            // Store metadata off-chain
            const expressId = await handleCreateTask(backendPayload, jwt, address);

            setIsLoading(false);
            return { expressId };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create task";
            setError(errorMessage);
            setIsLoading(false);
            throw err;
        }
    };

    return {
        createTask,
        isLoading,
        error,
    };
}