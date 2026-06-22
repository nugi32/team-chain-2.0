import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
} from "~~/hooks/scaffold-eth";
import { getTaskBySmartContractId } from "@/utils/lib/express/queries/tasks";
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

export const useLoopTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [validTasks, setValidTasks] = useState<any[]>([]);
  const [openRegistrationTasks, setOpenRegistrationTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingValidTasks, setIsLoadingValidTasks] = useState(false);

  const { data: contractData } = useDeployedContractInfo({
    contractName: "taskData",
  });

  const { data: taskCounter, isLoading: isTaskCounterLoading } =
    useScaffoldReadContract({
      contractName: "taskData",
      functionName: "taskCounter",
    });

  // Fetch tasks from contract
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

  // Fetch valid tasks whenever tasks changes
  useEffect(() => {
    const fetchValidTasks = async () => {
      if (!tasks.length) {
        setValidTasks([]);
        return;
      }

      setIsLoadingValidTasks(true);

      try {
        const results = await Promise.all(
          tasks.map(async task => {
            const dbTask = await getTaskBySmartContractId(
              task.taskId.toString()
            );

            return dbTask ? task : null;
          })
        );

        setValidTasks(results.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingValidTasks(false);
      }
    };

    fetchValidTasks();
  }, [tasks]);

  useEffect(() => {
    const fetchValidTasks = async () => {
      if (!tasks.length) {
        setValidTasks([]);
        setOpenRegistrationTasks([]);
        return;
      }

      setIsLoadingValidTasks(true);

      try {
        const results = await Promise.all(
          tasks.map(async task => {
            const dbTask = await getTaskBySmartContractId(
              task.taskId.toString()
            );

            return dbTask ? task : null;
          })
        );

        const valid = results.filter(Boolean);

        setValidTasks(valid);

        const openRegistrations = valid.filter(
          task => Number(task.status) === TaskStatus.OpenRegistration
        );

        setOpenRegistrationTasks(openRegistrations);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingValidTasks(false);
      }
    };

    fetchValidTasks();
  }, [tasks]);

  return {
    taskCounter,
    tasks,
    validTasks,
    openRegistrationTasks,

    loading: {
      taskCounter: isTaskCounterLoading,
      tasks: isLoadingTasks,
      validTasks: isLoadingValidTasks,
      isLoading:
        isTaskCounterLoading ||
        isLoadingTasks ||
        isLoadingValidTasks,
    },
  };
};