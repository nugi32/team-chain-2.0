import { useEffect, useState } from "react";
import { UserStats } from "./types";
import { User, getUserByAddress, getUserById } from "@/utils/lib/express/queries/users";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { formatEther } from "viem";

const getTier = (rep: number): UserStats["tier"] => {
  if (rep >= 1000) return "Platinum";
  if (rep >= 500) return "Gold";
  if (rep >= 100) return "Silver";
  return "Bronze";
};

export const useDashboardUserData = (address?: string, id?: string) => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(address);
  const [user, setUser] = useState<UserStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Resolve wallet address from id if needed
  useEffect(() => {
    const resolve = async () => {
      try {
        setError(null);
        if (address) {
          setWalletAddress(address);
          return;
        }
        if (id) {
          setLoadingUser(true);
          const u = await getUserById(id);
          setWalletAddress(u.walletAddress);
          return;
        }
        setWalletAddress(undefined);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoadingUser(false);
      }
    };
    resolve();
  }, [address, id]);

  const { user: contractUser, form, actions, loading: contractLoading } = useUsersContract(walletAddress);

  // Reactively rebuild UserStats whenever onchain data or walletAddress changes
  useEffect(() => {
    if (!walletAddress) return;

    if (contractLoading.userData) {
      return;
    }

    if (!contractUser?.userData) {
      return;
    }

    const load = async () => {
      setLoadingStats(true);
      try {
        const offchain = await getUserByAddress(walletAddress);

        const raw = contractUser?.userData as readonly unknown[] | undefined;

        const onchain = raw
          ? {
              totalTasksCreated: raw[0] as bigint,
              totalTasksCompleted: raw[1] as bigint,
              totalTasksFailed: raw[2] as bigint,
              reputation: raw[3] as bigint,
              balance: raw[4] as bigint,
              isRegistered: raw[5] as boolean,
              exists: raw[6] as boolean,
              GitProfile: raw[7] as string,
            }
          : null;

        const completed = Number(onchain?.totalTasksCompleted ?? 0n);
        const failed = Number(onchain?.totalTasksFailed ?? 0n);
        const total = completed + failed;

        setUser({
          ...offchain,
          ...(onchain ?? {
            totalTasksCreated: 0n,
            totalTasksCompleted: 0n,
            totalTasksFailed: 0n,
            reputation: 0n,
            balance: 0n,
            isRegistered: false,
            exists: false,
            GitProfile: "",
          }),
          successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          tier: getTier(Number(onchain?.reputation ?? 0n)),
          formattedBalance: onchain?.balance ? formatEther(onchain.balance) : "0.0",
        } as UserStats);
      } catch (err) {
        console.error("LOAD ERROR", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoadingStats(false);
      }
    };

    load();
  }, [walletAddress, contractUser?.userData, contractLoading.userData]);

  const withdrawUserFunds = async (amount: number) => {
    form.setWithdrawAmount(BigInt(amount));
    form.setWithdrawFundUser(walletAddress ?? "");
    await actions.handleWithdrawUserFund();
  };

  const withdrawAllUserFunds = async () => {
    form.setWithdrawAllUser(walletAddress ?? "");
    await actions.handleWithdrawAllUserFund();
  };

  return {
    user,
    loadingUser: loadingUser || loadingStats,
    error,
    withdrawUserFunds,
    withdrawAllUserFunds,
  };
};
