import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
} from "~~/hooks/scaffold-eth";
///home/tsunugi/projects/team-chain-2.0/packages/nextjs/services/web3/wagmiConfig.tsx

export enum TaskStatus {
    NonExistent = 0,
    Created = 1,
    Active = 2,
    OpenRegistration = 3,
    InProgres = 4,
    Completed = 5,
    Cancelled = 6,
}

export const useLoopTasks = (creatorAddress?: string, memberAddress?: string) => {
  const { address: connectedAddress } = useAccount();

  const creator = creatorAddress ?? connectedAddress;
  const member = memberAddress ?? connectedAddress;

  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const { data: contractData } = useDeployedContractInfo({
    contractName: "taskData",
  });

  const { data: taskCounter, isLoading: isTaskCounterLoading } =
    useScaffoldReadContract({
      contractName: "taskData",
      functionName: "taskCounter",
    });

  useEffect(() => {
    const fetchTasks = async () => {
      if (!contractData || taskCounter === undefined) return;

      setIsLoadingTasks(true);

      try {
        const results = await Promise.all(
          Array.from({ length: Number(taskCounter) }, (_, i) =>
            readContract(wagmiConfig, {
              address: contractData.address,
              abi: contractData.abi,
              functionName: "__getTask",
              args: [BigInt(i)],
            })
          )
        );

        setTasks(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [contractData, taskCounter]);

  const creatorTasks = useMemo(() => {
    if (!creator) return [];

    return tasks.filter(
      task =>
        task.creator?.toLowerCase() === creator.toLowerCase()
    );
  }, [tasks, creator]);

  const memberTasks = useMemo(() => {
    if (!member) return [];

    return tasks.filter(
      task =>
        task.member?.toLowerCase() === member.toLowerCase()
    );
  }, [tasks, member]);

  const latestMemberTask = useMemo(() => {
    return memberTasks.length
      ? memberTasks[memberTasks.length - 1]
      : null;
  }, [memberTasks]);

  const latestCreatorTask = useMemo(() => {
    return creatorTasks.length
      ? creatorTasks[creatorTasks.length - 1]
      : null;
  }, [creatorTasks]);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => Number(task.status) === status);
  };

  const createdTasks = useMemo(
    () => getTasksByStatus(TaskStatus.Created),
    [tasks]
  );

  const activeTasks = useMemo(
    () => getTasksByStatus(TaskStatus.Active),
    [tasks]
  );

  const openRegistrationTasks = useMemo(
    () => getTasksByStatus(TaskStatus.OpenRegistration),
    [tasks]
  );

  const inProgressTasks = useMemo(
    () => getTasksByStatus(TaskStatus.InProgres),
    [tasks]
  );

  const completedTasks = useMemo(
    () => getTasksByStatus(TaskStatus.Completed),
    [tasks]
  );

  const cancelledTasks = useMemo(
    () => getTasksByStatus(TaskStatus.Cancelled),
    [tasks]
  );

  return {
    taskCounter,
    tasks,

    creatorTasks,
    latestCreatorTask,

    memberTasks,
    latestMemberTask,

    createdTasks,
    activeTasks,
    openRegistrationTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,

    getTasksByStatus,

    loading: {
      taskCounter: isTaskCounterLoading,
      tasks: isLoadingTasks,
      isLoading:
        isTaskCounterLoading || isLoadingTasks,
    },
  };
};