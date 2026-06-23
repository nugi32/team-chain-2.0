import { useState } from "react";
import { getTaskById } from "@/utils/lib/express/queries/tasks";
import { useTaskController } from "@/utils/lib/smartContractWrapper/user/TaskController";
import { useAccount } from "wagmi";

export function useTaskSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { actions, task, user, form, notes } = useTaskController();

  const submitTask = async (expressTaskId: string, pullRequestUrl: string, submitNote: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }

      const taskData = await getTaskById(expressTaskId);
      task.setSubmitTaskId(BigInt(taskData.smartContractId));
      form.setPullRequestUrl(pullRequestUrl);
      notes.setSubmitNote(submitNote);
      user.setSubmitUser(address);

      await actions.handleRequestSubmitTask();

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const reSubmitTask = async (expressTaskId: string, pullRequestUrl: string, submitNote: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first.");
      }

      const taskData = await getTaskById(expressTaskId);
      task.setRejectTaskId(BigInt(taskData.smartContractId));
      form.setGithubFixedUrl(pullRequestUrl);
      notes.setResubmitNote(submitNote);
      user.setResubmitUser(address);

      await actions.handleReSubmitTask();

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
