import { useEffect, useState } from "react";
import { useTaskController } from "../smartContractWrapper/user/TaskController";
import { getUserById } from "@/utils/lib/express/queries/users";
import { useGetCompleteTasks } from "@/utils/lib/tasksHelper/useGetCompleteTasks";

//utils/lib/dashboard
/*
this hook return something like this
export interface CompleteTaskOutput {
    // Smart contract data
    smartContractId: number;
    status: TaskStatus;
    value: number;
    reward: number;
    deadlineAt: number;
    createdAt: number;
    creatorStake: number;
    memberStake: number;
    maxRevision: number;
    deadlineHours: number;
    creator: string;
    member: string;
    githubURL: string;
    isMemberStakeLocked: boolean;
    isCreatorStakeLocked: boolean;
    isRewardClaimed: boolean;
    exists: boolean;

    // Express data
    expressId: string;
    projectName: string;
    objective: string;
    category: string;
    effort: string;
    minReputation: string;
    roles: string[];
    skills: string[];
    description: string;
    badges: string[];
    milestones: unknown | null;
    stakeRequired: string;
    owner: string;
}
*/

export const useDashboardTasksData = (address?: string, id?: string) => {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(address);

  const [loadingTask, setLoadingTask] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        setError(null);

        if (address) {
          setWalletAddress(address);
          return;
        }

        if (id) {
          setLoadingTask(true);

          const user = await getUserById(id);

          setWalletAddress(user.walletAddress);
          return;
        }

        setWalletAddress(undefined);
      } catch (err) {
        console.error(`error while fetching user by id, error message: ${err}`);

        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoadingTask(false);
      }
    };

    loadWalletAddress();
  }, [address, id]);

  const tasksData: ReturnType<typeof useGetCompleteTasks> = useGetCompleteTasks(walletAddress);

  return {
    walletAddress,
    DashboardLoading: loadingTask,
    error,
    ...tasksData,
  };
};
