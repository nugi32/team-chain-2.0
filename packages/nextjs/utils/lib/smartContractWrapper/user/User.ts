import { useCallback, useEffect, useRef, useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import { useWalletClient } from "wagmi";
import { BrowserProvider, ethers } from "ethers";
import { createPublicClient, http } from "viem";

export const useUsersContractService = () => {
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

  const activeChainId =
    walletChainId &&
    scaffoldConfig.targetNetworks.some((n) => n.id === walletChainId)
      ? (walletChainId as AllowedChainIds)
      : undefined;

  const { data: rawContractData, isLoading: isContractLoading } =
    useScaffoldContract({
      contractName: "UsersContract",
      walletClient,
      chainId: activeChainId,
    });

  const hasWalletChainMismatch =
    walletClient &&
    isWalletChainResolved &&
    walletChainId !== undefined &&
    activeChainId === undefined;

  const isContractLoadingState =
    isContractLoading ||
    (walletClient && !isWalletChainResolved) ||
    hasWalletChainMismatch;

  const contract = rawContractData;

  const ethersContract =
    contract?.address && contract?.abi && signer
      ? new ethers.Contract(contract.address, contract.abi, signer)
      : null;

  // ── Stable refs so useCallback functions below have empty dep arrays ────────
  // Any consumer (e.g. useDashboard) that stores these functions in their own
  // refs always gets a fresh value without causing re-render cascades.
  const contractRef = useRef(contract);
  const signerRef = useRef(signer);
  const ethersContractRef = useRef(ethersContract);

  contractRef.current = contract;
  signerRef.current = signer;
  ethersContractRef.current = ethersContract;

  // Public client for read-only operations (no signer needed)
  const publicClient = createPublicClient({
    chain: scaffoldConfig.targetNetworks[0],
    transport: http(),
  });

  //---------------------------------------------------------
  // Wrappers — all stable (empty dep arrays, read from refs)
  //---------------------------------------------------------

  const getUsers = useCallback(async () => {
    try {
      const c = contractRef.current;
      if (!c) throw new Error("Contract not initialized");

      const address = signerRef.current
        ? await signerRef.current.getAddress()
        : "0x0000000000000000000000000000000000000000";

      try {
        const result = await (c as any).read.Users({ args: [address] });
        return { success: true, data: result };
      } catch (contractError: any) {
        if (
          contractError.message?.includes("returned no data") ||
          contractError.message?.includes("ZeroData")
        ) {
          return {
            success: true,
            data: {
              GitProfile: "",
              isRegistered: false,
              totalTasksCreated: 0n,
              totalTasksCompleted: 0n,
              totalTasksFailed: 0n,
              reputation: 0n,
              balance: 0n,
            },
          };
        }
        throw contractError;
      }
    } catch (error: any) {
      console.error("Failed to get users:", error);
      return { success: false, error: error.message };
    }
  }, []); // stable — reads contract/signer from refs

  const getUsedGitUrl = useCallback(async (bytecode: string) => {
    try {
      const c = contractRef.current;
      if (!c) throw new Error("Contract not initialized");
      const result = await (c as any).read.usedGitURL({ args: [bytecode] });
      return { success: true, data: result };
    } catch (error: any) {
      console.error("Failed to get used Git URL:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const Register = useCallback(async (githubURL: string) => {
    try {
      const ec = ethersContractRef.current;
      const s = signerRef.current;
      if (!ec || !s) throw new Error("Contract not initialized");
      const address = await s.getAddress();
      const tx = await ec.Register(githubURL, address);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error("Registration failed:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const UnRegister = useCallback(async () => {
    try {
      const ec = ethersContractRef.current;
      const s = signerRef.current;
      if (!ec || !s) throw new Error("Contract not initialized");
      const address = await s.getAddress();
      const tx = await ec.Unregister(address);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error("Unregistration failed:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const withdrawUserFund = useCallback(async (amount: number | bigint) => {
    try {
      const ec = ethersContractRef.current;
      const s = signerRef.current;
      if (!ec || !s) throw new Error("Contract not initialized");
      const address = await s.getAddress();
      const tx = await ec.withdrawUserFund(address, amount);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error("Failed to withdraw user fund:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const withdrawAllUserFund = useCallback(async () => {
    try {
      const ec = ethersContractRef.current;
      const s = signerRef.current;
      if (!ec || !s) throw new Error("Contract not initialized");
      const address = await s.getAddress();
      const tx = await ec.withdrawAllUserFund(address);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      const ec = ethersContractRef.current;
      if (!ec || !signerRef.current) throw new Error("Contract not initialized");
      const tx = await ec.pause();
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const unpause = useCallback(async () => {
    try {
      const ec = ethersContractRef.current;
      if (!ec || !signerRef.current) throw new Error("Contract not initialized");
      const tx = await ec.unpause();
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    signer,
    contract,
    isContractLoading: isContractLoadingState,
    hasWalletChainMismatch,
    getUsers,
    getUsedGitUrl,
    Register,
    UnRegister,
    withdrawUserFund,
    withdrawAllUserFund,
    pause,
    unpause,
  };
};