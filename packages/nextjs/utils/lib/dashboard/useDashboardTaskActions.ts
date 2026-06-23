import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const useDashboardTaskActions = () => {
  const { address: connectedAddress } = useAccount();

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "TaskController",
  });

  const deleteTask = async (taskId: bigint, user?: string) => {
    return writeContractAsync({
      functionName: "deleteTask",
      args: [taskId, user || connectedAddress],
    });
  };

  const activateTask = async (taskId: bigint, value: bigint, user?: string) => {
    return writeContractAsync({
      functionName: "activateTask",
      args: [taskId, user || connectedAddress],
      value,
    });
  };

  const openRegistration = async (taskId: bigint) => {
    return writeContractAsync({
      functionName: "openRegistration",
      args: [taskId],
    });
  };

  const closeRegistration = async (taskId: bigint) => {
    return writeContractAsync({
      functionName: "closeRegistration",
      args: [taskId],
    });
  };

  const requestJoinTask = async (taskId: bigint, value: bigint, user?: string) => {
    return writeContractAsync({
      functionName: "requestJoinTask",
      args: [taskId, user || connectedAddress],
      value,
    });
  };

  const withdrawJoinRequest = async (taskId: bigint, user?: string) => {
    return writeContractAsync({
      functionName: "withdrawJoinRequest",
      args: [taskId, user || connectedAddress],
    });
  };

  const approveJoinRequest = async (taskId: bigint, applicant: string) => {
    return writeContractAsync({
      functionName: "approveJoinRequest",
      args: [taskId, applicant],
    });
  };

  const approveJoinRequestAndRejectOthers = async (taskId: bigint, applicant: string) => {
    return writeContractAsync({
      functionName: "approveJoinRequestAndRejectOthers",
      args: [taskId, applicant],
    });
  };

  const rejectJoinRequest = async (taskId: bigint, applicant: string) => {
    return writeContractAsync({
      functionName: "rejectJoinRequest",
      args: [taskId, applicant],
    });
  };

  const requestSubmitTask = async (taskId: bigint, pullRequestURL: string, note: string, user?: string) => {
    return writeContractAsync({
      functionName: "requestSubmitTask",
      args: [taskId, pullRequestURL, note, user || connectedAddress],
    });
  };

  const reSubmitTask = async (taskId: bigint, note: string, githubFixedURL: string, user?: string) => {
    return writeContractAsync({
      functionName: "reSubmitTask",
      args: [taskId, note, githubFixedURL, user || connectedAddress],
    });
  };

  const requestRevision = async (taskId: bigint, note: string, additionalDeadlineHours: bigint) => {
    return writeContractAsync({
      functionName: "requestRevision",
      args: [taskId, note, additionalDeadlineHours],
    });
  };

  const approveTask = async (taskId: bigint) => {
    return writeContractAsync({
      functionName: "approveTask",
      args: [taskId],
    });
  };

  const cancelByMe = async (taskId: bigint, user?: string) => {
    return writeContractAsync({
      functionName: "cancelByMe",
      args: [taskId, user || connectedAddress],
    });
  };

  const triggerDeadline = async (taskId: bigint) => {
    return writeContractAsync({
      functionName: "triggerDeadline",
      args: [taskId],
    });
  };

  return {
    actions: {
      deleteTask,
      activateTask,
      openRegistration,
      closeRegistration,
      requestJoinTask,
      withdrawJoinRequest,
      approveJoinRequest,
      approveJoinRequestAndRejectOthers,
      rejectJoinRequest,
      requestSubmitTask,
      reSubmitTask,
      requestRevision,
      approveTask,
      cancelByMe,
      triggerDeadline,
    },
  };
};
