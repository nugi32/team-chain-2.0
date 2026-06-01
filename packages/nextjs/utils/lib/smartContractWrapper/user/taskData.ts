import { useCallback, useEffect, useRef, useState } from "react";
import { useScaffoldContract } from "@/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import { useWalletClient } from "wagmi";
import { BrowserProvider, ethers } from "ethers";

// ── System (read-only) provider ───────────────────────────────────────────────
// Built once at module level from the first configured RPC URL so it is never
// re-created on re-renders. Used as a fallback when no wallet is connected.
const SYSTEM_RPC =
  scaffoldConfig.targetNetworks[0].rpcUrls.default.http[0] ?? "http://127.0.0.1:8545";

const systemProvider = new ethers.JsonRpcProvider(SYSTEM_RPC);

export const useTaskContractService = () => {
  const { data: walletClient } = useWalletClient();

  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [walletChainId, setWalletChainId] = useState<number | undefined>(undefined);
  const [isWalletChainResolved, setIsWalletChainResolved] = useState(false);

  useEffect(() => {
    async function loadSigner() {
      if (!walletClient) {
        setSigner(null);
        return;
      }
      const provider = new BrowserProvider(walletClient.transport);
      const signerInstance = await provider.getSigner();
      setSigner(signerInstance);
    }
    loadSigner();
  }, [walletClient]);

  useEffect(() => {
    async function loadWalletChainId() {
      if (!walletClient) {
        setWalletChainId(undefined);
        setIsWalletChainResolved(true);
        return;
      }
      try {
        const chainId = await walletClient.getChainId();
        setWalletChainId(chainId);
      } catch (error) {
        console.error("Failed to detect wallet chain id:", error);
        setWalletChainId(undefined);
      } finally {
        setIsWalletChainResolved(true);
      }
    }
    setIsWalletChainResolved(false);
    loadWalletChainId();
  }, [walletClient]);

  // ── FIX: always fall back to the default target network so useScaffoldContract
  //    initialises even when no wallet is connected. Without this, activeChainId
  //    is undefined → contract is null → every getter throws immediately.
  const activeChainId = (
    walletChainId &&
    scaffoldConfig.targetNetworks.some((n) => n.id === walletChainId)
      ? walletChainId
      : scaffoldConfig.targetNetworks[0].id
  ) as AllowedChainIds;

  const { data: rawContractData, isLoading: isContractLoading } =
    useScaffoldContract({
      contractName: "taskData",
      walletClient,
      chainId: activeChainId,
    });

  // hasWalletChainMismatch is still relevant for UI warnings / write guards.
  // It only fires when a wallet IS connected but on the wrong chain.
  const hasWalletChainMismatch =
    walletClient &&
    isWalletChainResolved &&
    walletChainId !== undefined &&
    !scaffoldConfig.targetNetworks.some((n) => n.id === walletChainId);

  const isContractLoadingState =
    isContractLoading ||
    (walletClient && !isWalletChainResolved) ||
    hasWalletChainMismatch;

  const contract = rawContractData;

  // Ethers contract with signer — writes only; undefined when no wallet.
  const ethersContract =
    contract?.address && contract?.abi && signer
      ? new ethers.Contract(contract.address, contract.abi, signer)
      : null;

  // System (read-only) ethers contract — always available once scaffold gives
  // us the address + ABI, regardless of whether a wallet is connected.
  const systemEthersContract =
    contract?.address && contract?.abi
      ? new ethers.Contract(contract.address, contract.abi, systemProvider)
      : null;

  // ── Stable refs ───────────────────────────────────────────────────────────
  const contractRef            = useRef(contract);
  const signerRef              = useRef(signer);
  const ethersContractRef      = useRef(ethersContract);
  const systemEthersContractRef = useRef(systemEthersContract);

  contractRef.current             = contract;
  signerRef.current               = signer;
  ethersContractRef.current       = ethersContract;
  systemEthersContractRef.current = systemEthersContract;

  // Helper: returns the viem contract for reads (scaffold's built-in public
  // client) or throws a clear message if scaffold hasn't loaded yet.
  function readContract() {
    const c = contractRef.current;
    if (!c) throw new Error("Contract not yet loaded");
    return c as any;
  }

  //---------------------------------------------------------
  // GETTERS — use viem read via scaffold contract.
  //   Falls back to systemEthersContract if viem path fails
  //   (e.g. scaffold still initialising on first render).
  //---------------------------------------------------------

  const getTaskSubmit = useCallback(async (taskId: number | bigint) => {
    try {
      const result = await readContract().read.TaskSubmits({ args: [taskId] });
      return { success: true, data: result };
    } catch (viemErr) {
      // Fallback: system ethers provider (no wallet required)
      try {
        const sc = systemEthersContractRef.current;
        if (!sc) throw viemErr;
        const result = await sc.TaskSubmits(taskId);
        return { success: true, data: result };
      } catch (error: any) {
        console.error("Failed to get task submit:", error);
        return { success: false, error: error.message };
      }
    }
  }, []);

  const getTask = useCallback(async (taskId: number | bigint) => {
    try {
      const result = await readContract().read.Tasks({ args: [taskId] });
      return { success: true, data: result };
    } catch (viemErr) {
      try {
        const sc = systemEthersContractRef.current;
        if (!sc) throw viemErr;
        const result = await sc.Tasks(taskId);
        return { success: true, data: result };
      } catch (error: any) {
        console.error("Failed to get task:", error);
        return { success: false, error: error.message };
      }
    }
  }, []);

  const getJoinRequest = useCallback(
    async (taskId: number | bigint, index: number | bigint) => {
      try {
        const result = await readContract().read.joinRequests({ args: [taskId, index] });
        return { success: true, data: result };
      } catch (viemErr) {
        try {
          const sc = systemEthersContractRef.current;
          if (!sc) throw viemErr;
          const result = await sc.joinRequests(taskId, index);
          return { success: true, data: result };
        } catch (error: any) {
          console.error("Failed to get join request:", error);
          return { success: false, error: error.message };
        }
      }
    },
    [],
  );

  const getHasPendingRequest = useCallback(
    async (taskId: number | bigint, user: string) => {
      try {
        const result = await readContract().read.hasPendingRequest({ args: [taskId, user] });
        return { success: true, data: result };
      } catch (viemErr) {
        try {
          const sc = systemEthersContractRef.current;
          if (!sc) throw viemErr;
          const result = await sc.hasPendingRequest(taskId, user);
          return { success: true, data: result };
        } catch (error: any) {
          console.error("Failed to get pending request:", error);
          return { success: false, error: error.message };
        }
      }
    },
    [],
  );

  const getJoinRequestIndex = useCallback(
    async (taskId: number | bigint, user: string) => {
      try {
        const result = await readContract().read.joinRequestIndex({ args: [taskId, user] });
        return { success: true, data: result };
      } catch (viemErr) {
        try {
          const sc = systemEthersContractRef.current;
          if (!sc) throw viemErr;
          const result = await sc.joinRequestIndex(taskId, user);
          return { success: true, data: result };
        } catch (error: any) {
          console.error("Failed to get join request index:", error);
          return { success: false, error: error.message };
        }
      }
    },
    [],
  );

  const getTaskCounter = useCallback(async () => {
    try {
      const result = await readContract().read.taskCounter();
      return { success: true, data: result };
    } catch (viemErr) {
      try {
        const sc = systemEthersContractRef.current;
        if (!sc) throw viemErr;
        const result = await sc.taskCounter();
        return { success: true, data: result };
      } catch (error: any) {
        console.error("Failed to get task counter:", error);
        return { success: false, error: error.message };
      }
    }
  }, []);

  const getFeeCollected = useCallback(async () => {
    try {
      const result = await readContract().read.feeCollected();
      return { success: true, data: result };
    } catch (viemErr) {
      try {
        const sc = systemEthersContractRef.current;
        if (!sc) throw viemErr;
        const result = await sc.feeCollected();
        return { success: true, data: result };
      } catch (error: any) {
        console.error("Failed to get fee collected:", error);
        return { success: false, error: error.message };
      }
    }
  }, []);

  return {
    signer,
    contract,
    isContractLoading: isContractLoadingState,
    hasWalletChainMismatch,
    getTaskSubmit,
    getTask,
    getJoinRequest,
    getHasPendingRequest,
    getJoinRequestIndex,
    getTaskCounter,
    getFeeCollected,
  };
};