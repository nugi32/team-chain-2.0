import { useReadContract } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";

export interface TaskLifecycleParams {
  deadlineHours?: bigint;
  maximumRevision?: bigint;
  memberReward?: bigint;
  address?: `0x${string}`;
}

export const useTaskLifecycleLogic = (params: TaskLifecycleParams = {}) => {
  const { deadlineHours, maximumRevision, memberReward, address } = params;

  // Pull the ABI + deployed address directly from Scaffold-ETH's generated file,
  // bypassing useScaffoldReadContract which silently swallows errors.
  const { targetNetwork } = useTargetNetwork();
  const chainContracts = deployedContracts[targetNetwork.id as keyof typeof deployedContracts];
  const contractInfo = chainContracts?.TaskLifecycleLogic; // ← key must match deployedContracts.ts

  const paramsReady = !!(
    deadlineHours !== undefined &&
    deadlineHours > 0n &&
    maximumRevision !== undefined &&
    maximumRevision > 0n &&
    memberReward !== undefined &&
    memberReward > 0n &&
    address
  );

  const enabled = paramsReady && !!contractInfo;

  const {
    data: creatorRequiredStake,
    isLoading: isTaskLoading,
    isFetching: isTaskFetching,
    error: stakeError,
  } = useReadContract({
    address: contractInfo?.address as `0x${string}` | undefined,
    abi: contractInfo?.abi,
    functionName: "___getCreatorStake",
    args: [deadlineHours!, maximumRevision!, memberReward!, address!],
    query: { enabled },
  });

  // Detect the silent-failure case: query was enabled, finished loading,
  // but returned nothing and threw no error — usually means the contract
  // call reverted and wagmi swallowed it.
  const isStuck =
    enabled &&
    !isTaskLoading &&
    !isTaskFetching &&
    creatorRequiredStake == null &&
    !stakeError;

  return {
    creatorRequiredStake: creatorRequiredStake as bigint | undefined,
    isTaskLoading: isTaskLoading || isTaskFetching,
    stakeError,
    isStuck,
    enabled,
    // Expose for debugging — remove once confirmed working
    contractFound: !!contractInfo,
  };
};