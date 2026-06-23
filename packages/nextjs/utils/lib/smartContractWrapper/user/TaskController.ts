import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface CreateTaskParams {
  title: string;
  githubURL: string;
  deadlineHours: bigint;
  maximumRevision: bigint;
  user: `0x${string}`;
}

export interface DeleteTaskParams {
  taskId: bigint;
  user: `0x${string}`;
}

export interface ActivateTaskParams {
  taskId: bigint;
  user: `0x${string}`;
  value: bigint;
}

export interface OpenRegistrationParams {
  taskId: bigint;
}

export interface CloseRegistrationParams {
  taskId: bigint;
}

export interface RequestJoinTaskParams {
  taskId: bigint;
  user: `0x${string}`;
  value: bigint;
}

export interface WithdrawJoinRequestParams {
  taskId: bigint;
  user: `0x${string}`;
}

export interface ApproveJoinRequestParams {
  taskId: bigint;
  applicant: `0x${string}`;
}

export interface RejectJoinRequestParams {
  taskId: bigint;
  applicant: `0x${string}`;
}

export interface RequestSubmitTaskParams {
  taskId: bigint;
  pullRequestURL: string;
  note: string;
  user: `0x${string}`;
}

export interface ReSubmitTaskParams {
  taskId: bigint;
  note: string;
  githubFixedURL: string;
  user: `0x${string}`;
}

export interface RequestRevisionParams {
  taskId: bigint;
  note: string;
  additionalDeadlineHours: bigint;
}

export interface ApproveTaskParams {
  taskId: bigint;
}

export interface CancelByMeParams {
  taskId: bigint;
  user: `0x${string}`;
}

export interface TriggerDeadlineParams {
  taskId: bigint;
}

export interface GetJoinRequestCountParams {
  taskId: bigint;
}

export interface GetMemberRequiredStakeParams {
  taskId: bigint;
}

export interface GetCreatorStakeParams {
  deadlineHours: bigint;
  maximumRevision: bigint;
  rewardWei: bigint;
  caller: `0x${string}`;
}

export interface GetProjectValueParams {
  deadlineHours: bigint;
  maximumRevision: bigint;
  rewardWei: bigint;
  caller: `0x${string}`;
}

export interface ChangeAddressRegistryParams {
  newAddress: `0x${string}`;
}

export interface PauseParams {
  caller: `0x${string}`;
}

export interface UnpauseParams {
  caller: `0x${string}`;
}

export const useTaskController = () => {
  const { address: connectedAddress } = useAccount();

  const [title, setTitle] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [deadlineHours, setDeadlineHours] = useState<bigint>(0n);
  const [maxRevision, setMaxRevision] = useState<bigint>(0n);
  const [createUser, setCreateUser] = useState(connectedAddress || "");

  const [deleteTaskId, setDeleteTaskId] = useState<bigint | undefined>(undefined);
  const [deleteUser, setDeleteUser] = useState(connectedAddress || "");

  const [activateTaskId, setActivateTaskId] = useState<bigint | undefined>(undefined);
  const [activateUser, setActivateUser] = useState(connectedAddress || "");

  const [openRegTaskId, setOpenRegTaskId] = useState<bigint | undefined>(undefined);

  const [closeRegTaskId, setCloseRegTaskId] = useState<bigint | undefined>(undefined);

  const [joinTaskId, setJoinTaskId] = useState<bigint | undefined>(undefined);
  const [joinUser, setJoinUser] = useState(connectedAddress || "");

  const [withdrawTaskId, setWithdrawTaskId] = useState<bigint | undefined>(undefined);
  const [withdrawUser, setWithdrawUser] = useState(connectedAddress || "");

  const [approveTaskId, setApproveTaskId] = useState<bigint | undefined>(undefined);
  const [approveApplicant, setApproveApplicant] = useState("");

  const [rejectTaskId, setRejectTaskId] = useState<bigint | undefined>(undefined);
  const [rejectApplicant, setRejectApplicant] = useState("");

  const [submitTaskId, setSubmitTaskId] = useState<bigint | undefined>(undefined);
  const [pullRequestUrl, setPullRequestUrl] = useState("");
  const [submitNote, setSubmitNote] = useState("");
  const [submitUser, setSubmitUser] = useState(connectedAddress || "");

  const [resubmitTaskId, setResubmitTaskId] = useState<bigint | undefined>(undefined);
  const [resubmitNote, setResubmitNote] = useState("");
  const [githubFixedUrl, setGithubFixedUrl] = useState("");
  const [resubmitUser, setResubmitUser] = useState(connectedAddress || "");

  const [revisionTaskId, setRevisionTaskId] = useState<bigint | undefined>(undefined);
  const [revisionNote, setRevisionNote] = useState("");
  const [additionalDeadlineHours, setAdditionalDeadlineHours] = useState<bigint>(0n);

  const [approveTaskIdForCompletion, setApproveTaskIdForCompletion] = useState<bigint | undefined>(undefined);

  const [cancelTaskId, setCancelTaskId] = useState<bigint | undefined>(undefined);
  const [cancelUser, setCancelUser] = useState(connectedAddress || "");

  const [triggerDeadlineTaskId, setTriggerDeadlineTaskId] = useState<bigint | undefined>(undefined);

  const [withdrawFee, setWithdrawFee] = useState(false);

  const [newRegistryAddress, setNewRegistryAddress] = useState("");

  const [pauseCaller, setPauseCaller] = useState(connectedAddress || "");
  const [unpauseCaller, setUnpauseCaller] = useState(connectedAddress || "");

  const [value, setValue] = useState("0");

  const [rewardWei, setRewardWei] = useState<string>("0");
  const [creatorStakeCaller, setCreatorStakeCaller] = useState(connectedAddress || "");
  const [projectValueCaller, setProjectValueCaller] = useState(connectedAddress || "");

  const [handleApproveJoinRequestAndRejectOthersId, setHandleApproveJoinRequestAndRejectOthersId] = useState<
    bigint | undefined
  >(undefined);
  const [handleApproveJoinRequestAndRejectOthersApplicant, setHandleApproveJoinRequestAndRejectOthersApplicant] =
    useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "TaskController" });

  const handleCreateTask = async (params?: {
    title?: string;
    githubUrl?: string;
    deadlineHours?: bigint;
    maxRevision?: bigint;
    value?: string;
  }) => {
    try {
      // IMPORTANT: Always pass connectedAddress to ensure msg.sender matches _user parameter
      // The contract validates: if (msg.sender != _user) revert systemError("CallerMustBeUser");
      const userAddress = connectedAddress;
      if (!userAddress) {
        throw new Error("User not connected");
      }

      // Use provided params or fall back to state
      const finalTitle = params?.title ?? title;
      const finalGithubUrl = params?.githubUrl ?? githubUrl;
      const finalDeadlineHours = params?.deadlineHours ?? deadlineHours;
      const finalMaxRevision = params?.maxRevision ?? maxRevision;
      const finalValue = params?.value ?? value;

      await writeContractAsync(
        {
          functionName: "createTask",
          args: [finalTitle, finalGithubUrl, finalDeadlineHours, finalMaxRevision, parseEther(finalValue), userAddress],
          value: parseEther(finalValue),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
      // Task ID will be available from contract data after transaction confirmation
    } catch (e) {
      console.error("Error creating task", e);
      throw e;
    }
  };

  const handleDeleteTask = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "deleteTask",
          args: [deleteTaskId, deleteUser || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error deleting task", e);
      throw e;
    }
  };

  const handleActivateTask = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "activateTask",
          args: [activateTaskId, activateUser || connectedAddress],
          value: parseEther(value),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error activating task", e);
      throw e;
    }
  };

  const handleOpenRegistration = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "openRegistration",
          args: [openRegTaskId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error opening registration", e);
      throw e;
    }
  };

  const handleCloseRegistration = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "closeRegistration",
          args: [closeRegTaskId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error closing registration", e);
      throw e;
    }
  };

  const handleRequestJoinTask = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "requestJoinTask",
          args: [joinTaskId, joinUser || connectedAddress],
          value: parseEther(value),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error requesting join task", e);
      throw e;
    }
  };

  const handleWithdrawJoinRequest = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "withdrawJoinRequest",
          args: [withdrawTaskId, withdrawUser || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error withdrawing join request", e);
      throw e;
    }
  };

  const handleApproveJoinRequest = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "approveJoinRequest",
          args: [approveTaskId, approveApplicant],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error approving join request", e);
      throw e;
    }
  };

  const handleApproveJoinRequestAndRejectOthers = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "approveJoinRequestAndRejectOthers",
          args: [handleApproveJoinRequestAndRejectOthersId, handleApproveJoinRequestAndRejectOthersApplicant],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error approving join request", e);
      throw e;
    }
  };

  const handleRejectJoinRequest = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "rejectJoinRequest",
          args: [rejectTaskId, rejectApplicant],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error rejecting join request", e);
      throw e;
    }
  };

  const handleRequestSubmitTask = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "requestSubmitTask",
          args: [submitTaskId, pullRequestUrl, submitNote, submitUser || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error submitting task", e);
      throw e;
    }
  };

  const handleReSubmitTask = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "reSubmitTask",
          args: [resubmitTaskId, resubmitNote, githubFixedUrl, resubmitUser || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error resubmitting task", e);
      throw e;
    }
  };

  const handleRequestRevision = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "requestRevision",
          args: [revisionTaskId, revisionNote, additionalDeadlineHours],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error requesting revision", e);
      throw e;
    }
  };

  const handleApproveTask = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "approveTask",
          args: [approveTaskIdForCompletion],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error approving task", e);
      throw e;
    }
  };

  const handleCancelByMe = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "cancelByMe",
          args: [cancelTaskId, cancelUser || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error cancelling by me", e);
      throw e;
    }
  };

  const handleTriggerDeadline = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "triggerDeadline",
          args: [triggerDeadlineTaskId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error triggering deadline", e);
      throw e;
    }
  };

  const handleWithdrawToSystemWallet = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "withdrawToSystemWallet",
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error withdrawing to system wallet", e);
      throw e;
    }
  };

  const handleChangeRegistryAddress = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "__changeControllerAndModuleAddressRegistry",
          args: [newRegistryAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error changing registry address", e);
      throw e;
    }
  };

  const handlePause = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "pause",
          args: [pauseCaller || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error pausing", e);
      throw e;
    }
  };

  const handleUnpause = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "unpause",
          args: [unpauseCaller || connectedAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error unpausing", e);
      throw e;
    }
  };

  const { data: joinRequestCount, isLoading: isJoinRequestCountLoading } = useScaffoldReadContract({
    contractName: "TaskController",
    functionName: "getJoinRequestCount",
    args: [deleteTaskId],
  });

  const { data: memberRequiredStake, isLoading: isMemberRequiredStakeLoading } = useScaffoldReadContract({
    contractName: "TaskController",
    functionName: "getMemberRequiredStake",
    args: [deleteTaskId],
  });

  const { data: creatorStake, isLoading: isCreatorStakeLoading } = useScaffoldReadContract({
    contractName: "TaskController",
    functionName: "___getCreatorStake",
    args: [deadlineHours, maxRevision, BigInt(rewardWei || "0"), creatorStakeCaller || connectedAddress],
  });

  const { data: projectValue, isLoading: isProjectValueLoading } = useScaffoldReadContract({
    contractName: "TaskController",
    functionName: "___getProjectValue",
    args: [deadlineHours, maxRevision, BigInt(rewardWei || "0"), projectValueCaller || connectedAddress],
  });

  return {
    form: {
      title,
      setTitle,
      githubUrl,
      setGithubUrl,
      deadlineHours,
      setDeadlineHours,
      maxRevision,
      setMaxRevision,
      rewardWei,
      setRewardWei,
      value,
      setValue,
      pullRequestUrl,
      setPullRequestUrl,
      githubFixedUrl,
      setGithubFixedUrl,
    },

    task: {
      deleteTaskId,
      setDeleteTaskId,
      activateTaskId,
      setActivateTaskId,
      openRegTaskId,
      setOpenRegTaskId,
      closeRegTaskId,
      setCloseRegTaskId,
      joinTaskId,
      setJoinTaskId,
      withdrawTaskId,
      setWithdrawTaskId,
      approveTaskId,
      setApproveTaskId,
      handleApproveJoinRequestAndRejectOthersId,
      setHandleApproveJoinRequestAndRejectOthersId,
      rejectTaskId,
      setRejectTaskId,
      submitTaskId,
      setSubmitTaskId,
      resubmitTaskId,
      setResubmitTaskId,
      revisionTaskId,
      setRevisionTaskId,
      approveTaskIdForCompletion,
      setApproveTaskIdForCompletion,
      cancelTaskId,
      setCancelTaskId,
      triggerDeadlineTaskId,
      setTriggerDeadlineTaskId,
    },

    user: {
      createUser,
      setCreateUser,
      deleteUser,
      setDeleteUser,
      activateUser,
      setActivateUser,
      joinUser,
      setJoinUser,
      withdrawUser,
      setWithdrawUser,
      approveApplicant,
      setApproveApplicant,
      handleApproveJoinRequestAndRejectOthersApplicant,
      setHandleApproveJoinRequestAndRejectOthersApplicant,
      rejectApplicant,
      setRejectApplicant,
      submitUser,
      setSubmitUser,
      resubmitUser,
      setResubmitUser,
      cancelUser,
      setCancelUser,
      creatorStakeCaller,
      setCreatorStakeCaller,
      projectValueCaller,
      setProjectValueCaller,
      pauseCaller,
      setPauseCaller,
      unpauseCaller,
      setUnpauseCaller,
    },

    notes: {
      submitNote,
      setSubmitNote,
      resubmitNote,
      setResubmitNote,
      revisionNote,
      setRevisionNote,
    },

    config: {
      additionalDeadlineHours,
      setAdditionalDeadlineHours,
      withdrawFee,
      setWithdrawFee,
      newRegistryAddress,
      setNewRegistryAddress,
    },

    actions: {
      handleCreateTask,
      handleDeleteTask,
      handleActivateTask,
      handleOpenRegistration,
      handleCloseRegistration,
      handleRequestJoinTask,
      handleWithdrawJoinRequest,
      handleApproveJoinRequest,
      handleApproveJoinRequestAndRejectOthers,
      handleRejectJoinRequest,
      handleRequestSubmitTask,
      handleReSubmitTask,
      handleRequestRevision,
      handleApproveTask,
      handleCancelByMe,
      handleTriggerDeadline,
      handleWithdrawToSystemWallet,
      handleChangeRegistryAddress,
      handlePause,
      handleUnpause,
    },

    data: {
      joinRequestCount,
      memberRequiredStake,
      creatorStake,
      projectValue,
    },

    loading: {
      isPending,
      isJoinRequestCountLoading,
      isMemberRequiredStakeLoading,
      isCreatorStakeLoading,
      isProjectValueLoading,
    },
  };
};
