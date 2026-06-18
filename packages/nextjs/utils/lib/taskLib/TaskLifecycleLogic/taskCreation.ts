import { useState } from "react";
import { useTaskController, CreateTaskParams } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { handleCreateTask, type CreateTaskPayload } from "@/utils/lib/express/mutations/tasks";
import { useAccount } from "wagmi";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import { getTaskBySmartContractId } from "@/utils/lib/express/queries/tasks";
import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";

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
    contractId: string;
    expressId: string;
    transactionHash?: string;
}

export function useTaskCreation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { actions, form, user } = useTaskController();
    const { data } = useTaskData();

    /**
     * Create a task on-chain and store metadata off-chain
     * @param scPayload - Smart contract parameters (title, githubURL, deadline, revision, value in ETH)
     * @param backendPayload - Backend parameters (projectName, objective, category, skills, etc.)
     * @returns TaskCreationResult with contractId (from contract), expressId (from backend), and optional transactionHash
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
            form.setTitle(scPayload.title);
            form.setGithubUrl(scPayload.githubURL);
            form.setDeadlineHours(scPayload.deadlineHours);
            form.setMaxRevision(scPayload.maximumRevision);
            form.setValue(scPayload.value); // This will be parsed to wei

            // Execute on-chain transaction
            await actions.handleCreateTask();

            // After on-chain creation succeeds, get the taskId from contract data
            // The task counter represents the number of tasks, so the latest task ID = counter - 1
            let taskId: string | null = null;
            let retries = 0;
            const maxRetries = 30; // 30 attempts with 1s delay = 30 seconds max wait

            while (!taskId && retries < maxRetries) {
                if (data?.taskCounter !== undefined && data?.task !== undefined) {
                    const onchainTaskLength = data.taskCounter;

                    if (typeof onchainTaskLength === 'number' && onchainTaskLength > 0) {
                        const task = data.task;
                        if (task && task.creator === address && task.taskId !== undefined) {
                            taskId = task.taskId.toString();
                            break;
                        }
                    }
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries++;
            }

            if (!taskId) {
                throw new Error("Failed to retrieve task ID from contract. Please try again.");
            }

            // Get JWT token for backend authentication
            const jwt = await getValidJwt(address);

            // Pass contractId (on-chain taskId) to backend
            const backendPayloadWithContractId: typeof backendPayload = {
                ...backendPayload,
                contractId: taskId,
            };

            // Store metadata off-chain with the on-chain task ID
            const expressId = await handleCreateTask(backendPayloadWithContractId, jwt);

            setIsLoading(false);
            return { 
                contractId: taskId,
                expressId 
            };

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