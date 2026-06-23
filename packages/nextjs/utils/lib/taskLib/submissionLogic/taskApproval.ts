import { useState } from "react";
import { getTaskById } from "@/utils/lib/express/queries/tasks";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";

export function useTaskApproval() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { actions, task, notes, config } = useTaskController();

  const submitTask = async (
    expressTaskId: string,
    revisionNote: string,
    additionalDeadlineHours: number,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }

      const taskData = await getTaskById(expressTaskId);
      task.setRevisionTaskId(BigInt(taskData.smartContractId));
      notes.setRevisionNote(revisionNote);
      config.setAdditionalDeadlineHours(BigInt(additionalDeadlineHours));

      await actions.handleRequestRevision();

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const reSubmitTask = async (expressTaskId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }

      const taskData = await getTaskById(expressTaskId);
      task.setApproveTaskIdForCompletion(BigInt(taskData.smartContractId));

      await actions.handleApproveTask();

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    submitTask,
    reSubmitTask,
    isLoading,
    error,
  };
}
