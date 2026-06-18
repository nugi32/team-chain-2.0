"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

import {
  useTaskController,
  CreateTaskParams,
} from "@/utils/lib/smartContractWrapper/user/TaskController";

import {
  handleCreateTask,
  type CreateTaskPayload,
} from "@/utils/lib/express/mutations/tasks";

import { getValidJwt } from "@/utils/globalLib/walletAuth";

export interface SmartContractTaskPayload
  extends CreateTaskParams {
  value: string;
}

export interface BackendTaskPayload
  extends CreateTaskPayload {}

export interface TaskCreationResult {
  contractId: string;
  expressId: string;
}

export function useTaskCreation() {
  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const { address, isConnected } =
    useAccount();

  const { actions, form } =
    useTaskController();

  const { data: taskDataContract } =
    useDeployedContractInfo({
      contractName: "taskData",
    });

  const createTask = async (
    scPayload: SmartContractTaskPayload,
    backendPayload: BackendTaskPayload
  ): Promise<TaskCreationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error(
          "Please connect your wallet first."
        );
      }

      if (!taskDataContract) {
        throw new Error(
          "TaskData contract not loaded."
        );
      }

      // --------------------------
      // Execute transaction with params
      // (pass params directly to avoid React state race condition)
      // --------------------------

      await actions.handleCreateTask({
        title: scPayload.title,
        githubUrl: scPayload.githubURL,
        deadlineHours: scPayload.deadlineHours,
        maxRevision: scPayload.maximumRevision,
        value: scPayload.value,
      });

      // --------------------------
      // Read fresh counter
      // --------------------------

      const freshCounter =
        await readContract(
          wagmiConfig,
          {
            address:
              taskDataContract.address,
            abi: taskDataContract.abi,
            functionName:
              "taskCounter",
          }
        );

      const contractId = (
        BigInt(
          freshCounter.toString()
        ) - 1n
      ).toString();

      console.log(
        "Fresh Counter:",
        freshCounter.toString()
      );

      console.log(
        "Created Task ID:",
        contractId
      );

      // --------------------------
      // JWT
      // --------------------------

      const jwt =
        await getValidJwt(address);

      // --------------------------
      // Store in Express
      // --------------------------

      const payload = {
        ...backendPayload,
        contractId,
      };

      const expressId =
        await handleCreateTask(
          payload,
          jwt
        );

      return {
        contractId,
        expressId,
      };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create task";

      setError(message);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTask,
    isLoading,
    error,
  };
}