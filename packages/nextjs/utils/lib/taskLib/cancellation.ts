import { useState } from "react";
import { getTaskById } from "@/utils/lib/express/queries/tasks";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";

export function useTaskCancellation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { actions, task, user } = useTaskController();

  const cancelByMe = async (expressTaskId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }

      const taskData = await getTaskById(expressTaskId);
      task.setCancelTaskId(BigInt(taskData.smartContractId));
      user.setCancelUser(address);

      await actions.handleCancelByMe();

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const triggerDeadline = async (expressTaskId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }

      const taskData = await getTaskById(expressTaskId);
      task.setTriggerDeadlineTaskId(BigInt(taskData.smartContractId));

      await actions.handleTriggerDeadline();

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    cancelByMe,
    triggerDeadline,
    isLoading,
    error,
  };
}
