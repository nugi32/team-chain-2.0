import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const useTaskData = (taskId?: number, options?: { user?: string; index?: number }) => {
  const { address: connectedAddress } = useAccount();
  const user = options?.user ?? connectedAddress;
  const index = options?.index;

  const { data: task, isLoading: isTaskLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTask",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: taskStatus, isLoading: isTaskStatusLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskStatus",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: taskParticipants, isLoading: isTaskParticipantsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskParticipants",
    args: [taskId !== undefined ? BigInt(taskId) : undefined],
  });

  const { data: taskFinancials, isLoading: isTaskFinancialsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskFinancials",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: taskMetadata, isLoading: isTaskMetadataLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskMetadata",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: taskFlags, isLoading: isTaskFlagsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskFlags",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: joinRequests, isLoading: isJoinRequestsLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequests",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: joinRequestByIndex, isLoading: isJoinRequestByIndexLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequestByIndex",
    args: [taskId !== undefined ? BigInt(taskId) : undefined, index !== undefined ? BigInt(index) : undefined]
  });

  const { data: joinRequestCount, isLoading: isJoinRequestCountLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequestCount",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: hasPendingRequest, isLoading: isHasPendingRequestLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__hasPendingRequest",
    args: [taskId !== undefined ? BigInt(taskId) : undefined, user]
  });

  const { data: joinRequestByUser, isLoading: isJoinRequestByUserLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getJoinRequestByUser",
    args: [taskId !== undefined ? BigInt(taskId) : undefined, user]
  });

  const { data: taskSubmit, isLoading: isTaskSubmitLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getTaskSubmit",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: submitStatus, isLoading: isSubmitStatusLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getSubmitStatus",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: submitContent, isLoading: isSubmitContentLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getSubmitContent",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: submitRevision, isLoading: isSubmitRevisionLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getSubmitRevision",
    args: [taskId !== undefined ? BigInt(taskId) : undefined]
  });

  const { data: globalState, isLoading: isGlobalStateLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "__getGlobalState"
  });

  const { data: addressRegistry, isLoading: isAddressRegistryLoading } = useScaffoldReadContract({
    contractName: "taskData",
    functionName: "addressRegistry"
  });

  return {
    data: {
      task,
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

    loading: {
      task: isTaskLoading,
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