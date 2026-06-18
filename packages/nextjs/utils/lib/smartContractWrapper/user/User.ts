import { useState } from "react";
import { useAccount } from "wagmi";
import { keccak256, stringToBytes } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const useUsersContract = (userAddress?: string, githubUrl?: string) => {
  const { address: connectedAddress } = useAccount();
  const targetUser = userAddress || connectedAddress || "";

  const [registerGitHubURL, setRegisterGitHubURL] = useState("");
  const [registerUser, setRegisterUser] = useState(connectedAddress || "");

  const [unregisterUser, setUnregisterUser] = useState(connectedAddress || "");

  const [withdrawFundUser, setWithdrawFundUser] = useState(connectedAddress || "");
  const [withdrawAmount, setWithdrawAmount] = useState<bigint>(0n);

  const [withdrawAllUser, setWithdrawAllUser] = useState(connectedAddress || "");

  const [newRegistryAddress, setNewRegistryAddress] = useState("");

  const [depositUser, setDepositUser] = useState("");
  const [depositAmount, setDepositAmount] = useState<bigint>(0n);

  const gitHash = githubUrl
    ? keccak256(stringToBytes(githubUrl))
    : undefined;

  const { data: userData, isLoading: isUserDataLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "Users",
    args: [targetUser]
  });

  const { data: totalTasksCreated, isLoading: isTotalTasksCreatedLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__getTotalTasksCreated",
    args: [targetUser]
  });

  const { data: totalTasksCompleted, isLoading: isTotalTasksCompletedLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__getTotalTasksCompleted",
    args: [targetUser]
  });

  const { data: totalTasksFailed, isLoading: isTotalTasksFailedLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__getTotalTasksFailed",
    args: [targetUser]
  });

  const { data: reputation, isLoading: isReputationLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__getUserReputation",
    args: [targetUser]
  });

  const { data: balance, isLoading: isBalanceLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__getUserBalance",
    args: [targetUser]
  });

  const { data: isRegistered, isLoading: isIsRegisteredLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__isRegistered",
    args: [targetUser]
  });

  const { data: gitProfile, isLoading: isGitProfileLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "__getUserGitProfile",
    args: [targetUser]
  });

  const { data: usedGitURL, isLoading: isUsedGitURLLoading } = useScaffoldReadContract({
    contractName: "UsersContract",
    functionName: "usedGitURL",
    args: [gitHash]
  });

  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "UsersContract" });

  const handleRegister = async () => {
    try {
      await writeContractAsync({
        functionName: "Register",
        args: [registerGitHubURL, registerUser || connectedAddress],
      });
    } catch (e) {
      console.error("Error registering user", e);
      throw e;
    }
  };

  const handleUnregister = async () => {
    try {
      await writeContractAsync({
        functionName: "Unregister",
        args: [unregisterUser || connectedAddress],
      });
    } catch (e) {
      console.error("Error unregistering user", e);
      throw e;
    }
  };

  const handleDeposit = async () => {
    try {
      await writeContractAsync({
        functionName: "deposit",
        args: [depositUser || connectedAddress],
        value: depositAmount,
      });
    } catch (e) {
      console.error("Error withdrawing all funds", e);
      throw e;
    }
  };

  const handleWithdrawUserFund = async () => {
    try {
      await writeContractAsync({
        functionName: "withdrawUserFund",
        args: [withdrawFundUser || connectedAddress, withdrawAmount],
      });
    } catch (e) {
      console.error("Error withdrawing funds", e);
      throw e;
    }
  };

  const handleWithdrawAllUserFund = async () => {
    try {
      await writeContractAsync({
        functionName: "withdrawAllUserFund",
        args: [withdrawAllUser || connectedAddress],
      });
    } catch (e) {
      console.error("Error withdrawing all funds", e);
      throw e;
    }
  };

  const handleChangeAddressRegistry = async () => {
    try {
      await writeContractAsync({
        functionName: "__changeAddressRegistry",
        args: [newRegistryAddress],
      });
    } catch (e) {
      console.error("Error changing address registry", e);
      throw e;
    }
  };

  const handlePause = async () => {
    try {
      await writeContractAsync({
        functionName: "pause"
      });
    } catch (e) {
      console.error("Error pausing contract", e);
      throw e;
    }
  };

  const handleUnpause = async () => {
    try {
      await writeContractAsync({
        functionName: "unpause"
      });
    } catch (e) {
      console.error("Error unpausing contract", e);
      throw e;
    }
  };

  return {
    user: {
      targetUser,
      userData,
      totalTasksCreated,
      totalTasksCompleted,
      totalTasksFailed,
      reputation,
      balance,
      isRegistered,
      gitProfile,
      usedGitURL,
    },

    loading: {
      userData: isUserDataLoading,
      totalTasksCreated: isTotalTasksCreatedLoading,
      totalTasksCompleted: isTotalTasksCompletedLoading,
      totalTasksFailed: isTotalTasksFailedLoading,
      reputation: isReputationLoading,
      balance: isBalanceLoading,
      isRegistered: isIsRegisteredLoading,
      gitProfile: isGitProfileLoading,
      usedGitURL: isUsedGitURLLoading,
      isPending,
    },

    form: {
      registerGitHubURL,
      setRegisterGitHubURL,

      registerUser,
      setRegisterUser,

      unregisterUser,
      setUnregisterUser,

      withdrawFundUser,
      setWithdrawFundUser,

      withdrawAmount,
      setWithdrawAmount,

      withdrawAllUser,
      setWithdrawAllUser,

      newRegistryAddress,
      setNewRegistryAddress,

      setDepositUser,
      setDepositAmount
    },

    actions: {
      handleRegister,
      handleUnregister,
      handleWithdrawUserFund,
      handleWithdrawAllUserFund,
      handleChangeAddressRegistry,
      handlePause,
      handleUnpause,
      handleDeposit,
    },
  };
};