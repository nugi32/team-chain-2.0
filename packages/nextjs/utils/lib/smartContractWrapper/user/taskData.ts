import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const useTaskData = (taskId?: number, options?: { user?: string; index?: number }) => {
  const { address: connectedAddress } = useAccount();

  const user = options?.user ?? connectedAddress;
  const index = options?.index;

  const [id, setId] = useState<bigint | undefined>(taskId !== undefined ? BigInt(taskId) : undefined);

  const taskArg = taskId !== undefined ? BigInt(taskId) : (id ?? 0n);

  const { data: task, isLoading: isTaskLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTask",
    args: [taskArg],
  });

  const { data: taskCounter, isLoading: isTaskCounterLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "taskCounter",
  });

  const { data: feeCollected, isLoading: isFeeCollectedLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "feeCollected",
  });

  const { data: taskStatus, isLoading: isTaskStatusLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskStatus",
    args: [taskArg],
  });

  const { data: taskParticipants, isLoading: isTaskParticipantsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskParticipants",
    args: [taskArg],
  });

  const { data: taskFinancials, isLoading: isTaskFinancialsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskFinancials",
    args: [taskArg],
  });

  const { data: taskMetadata, isLoading: isTaskMetadataLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskMetadata",
    args: [taskArg],
  });

  const { data: taskFlags, isLoading: isTaskFlagsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskFlags",
    args: [taskArg],
  });

  const { data: joinRequests, isLoading: isJoinRequestsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequests",
    args: [taskArg],
  });

  const { data: joinRequestByIndex, isLoading: isJoinRequestByIndexLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequestByIndex",
    args: [taskArg, index !== undefined ? BigInt(index) : undefined],
  });

  const { data: joinRequestCount, isLoading: isJoinRequestCountLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequestCount",
    args: [taskArg],
  });

  const { data: hasPendingRequest, isLoading: isHasPendingRequestLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__hasPendingRequest",
    args: [taskArg, user],
  });

  const { data: joinRequestByUser, isLoading: isJoinRequestByUserLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequestByUser",
    args: [taskArg, user],
  });

  const { data: taskSubmit, isLoading: isTaskSubmitLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskSubmit",
    args: [taskArg],
  });

  const { data: submitStatus, isLoading: isSubmitStatusLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getSubmitStatus",
    args: [taskArg],
  });

  const { data: submitContent, isLoading: isSubmitContentLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getSubmitContent",
    args: [taskArg],
  });

  const { data: submitRevision, isLoading: isSubmitRevisionLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getSubmitRevision",
    args: [taskArg],
  });

  const { data: globalState, isLoading: isGlobalStateLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getGlobalState",
  });

  const { data: addressRegistry, isLoading: isAddressRegistryLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "addressRegistry",
  });

  return {
    data: {
      task,
      taskCounter,
      feeCollected,
      taskStatus,
      taskParticipants,
      taskFinancials,
      taskMetadata,
      taskFlags,
      joinRequests,
      joinRequestByIndex,
      joinRequestCount,
      hasPendingRequest,
      joinRequestByUser,
      taskSubmit,
      submitStatus,
      submitContent,
      submitRevision,
      globalState,
      addressRegistry,
    },

    form: {
      setId,
    },

    loading: {
      task: isTaskLoading,
      taskCounter: isTaskCounterLoading,
      feeCollected: isFeeCollectedLoading,
      taskStatus: isTaskStatusLoading,
      taskParticipants: isTaskParticipantsLoading,
      taskFinancials: isTaskFinancialsLoading,
      taskMetadata: isTaskMetadataLoading,
      taskFlags: isTaskFlagsLoading,
      joinRequests: isJoinRequestsLoading,
      joinRequestByIndex: isJoinRequestByIndexLoading,
      joinRequestCount: isJoinRequestCountLoading,
      hasPendingRequest: isHasPendingRequestLoading,
      joinRequestByUser: isJoinRequestByUserLoading,
      taskSubmit: isTaskSubmitLoading,
      submitStatus: isSubmitStatusLoading,
      submitContent: isSubmitContentLoading,
      submitRevision: isSubmitRevisionLoading,
      globalState: isGlobalStateLoading,
      addressRegistry: isAddressRegistryLoading,
    },
  };
};
