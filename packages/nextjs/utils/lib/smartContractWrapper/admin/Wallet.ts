import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

/**
 * Standardized response shape for all wrapper functions.
 */
export interface ContractResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  txHash?: string;
  receipt?: ethers.TransactionReceipt;
}

/**
 * Custom hook that provides a typed interface to the System_wallet smart contract.
 * Uses wagmi's useWalletClient, Scaffold-ETH's useScaffoldContract and ethers v6.
 *
 * Returns the signer, the write-enabled contract, the signer address, and wrapper
 * functions for every public/external method of the contract.
 */
export default function useSystemWallet() {
  const { data: walletClient } = useWalletClient();
  const { data: deployedContractData } = useDeployedContractInfo("System_wallet");

  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [writeContract, setWriteContract] = useState<ethers.Contract | null>(null);

  // ---------------------------------------------------------------------------
  // Set up ethers v6 BrowserProvider & signer, then connect the scaffold contract
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!walletClient) {
      setSigner(null);
      setSignerAddress("");
      setWriteContract(null);
      return;
    }

    const initSigner = async () => {
      try {
        // ethers v6 BrowserProvider from wagmi wallet client transport
        const provider = new ethers.BrowserProvider(walletClient.transport);
        const _signer = await provider.getSigner();
        setSigner(_signer);

        const addr = await _signer.getAddress();
        setSignerAddress(addr);

        // Connect the scaffold contract (read-only instance) with the signer
        useEffect(() => {
          if (!walletClient || !deployedContractData) {
            setSigner(null);
            setSignerAddress("");
            setWriteContract(null);
            return;
          }

          const initSigner = async () => {
            try {
              const provider = new ethers.BrowserProvider(walletClient.transport);

              const _signer = await provider.getSigner();

              setSigner(_signer);

              const addr = await _signer.getAddress();

              setSignerAddress(addr);

              const contract = new ethers.Contract(deployedContractData.address, deployedContractData.abi, _signer);

              setWriteContract(contract);
            } catch (error) {
              console.error("Failed to initialize signer/contract:", error);

              setSigner(null);
              setSignerAddress("");
              setWriteContract(null);
            }
          };

          initSigner();
        }, [walletClient, deployedContractData]);
      } catch (error) {
        console.error("Failed to initialize signer/contract:", error);
        setSigner(null);
        setSignerAddress("");
        setWriteContract(null);
      }
    };

    initSigner();
  }, [walletClient, deployedContractData]);

  // ---------------------------------------------------------------------------
  // Helper: ensure contract is ready before making a call
  // ---------------------------------------------------------------------------
  const requireContract = (): ethers.Contract => {
    if (!writeContract) {
      throw new Error("Contract not initialized");
    }
    return writeContract;
  };

  // ---------------------------------------------------------------------------
  // WRITE FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Initializes the System_wallet with the AddressRegistry address.
   * @param _addressRegistry Address of the AddressRegistry contract
   */
  const initialize = useCallback(
    async (_addressRegistry: string): Promise<ContractResponse> => {
      try {
        const c = requireContract();
        const tx = await c.initialize(_addressRegistry);
        const receipt = await tx.wait();
        return { success: true, txHash: tx.hash, receipt };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [writeContract],
  );

  /**
   * Transfers ETH to a specified address (onlyOwner).
   * @param _to Recipient address (payable)
   * @param _amount Amount in wei (bigint)
   */
  const transfer = useCallback(
    async (_to: string, _amount: bigint): Promise<ContractResponse> => {
      try {
        const c = requireContract();
        const tx = await c.transfer(_to, _amount);
        const receipt = await tx.wait();
        return { success: true, txHash: tx.hash, receipt };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [writeContract],
  );

  /**
   * Transfers ERC20 tokens to a specified address (onlyOwner).
   * @param token ERC20 token contract address
   * @param to Recipient address
   * @param amount Token amount (bigint)
   */
  const transferToken = useCallback(
    async (token: string, to: string, amount: bigint): Promise<ContractResponse> => {
      try {
        const c = requireContract();
        const tx = await c.transferToken(token, to, amount);
        const receipt = await tx.wait();
        return { success: true, txHash: tx.hash, receipt };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [writeContract],
  );

  /**
   * Batch transfers ERC20 tokens to multiple addresses (onlyOwner).
   * @param tokens Array of token contract addresses
   * @param tos Array of recipient addresses
   * @param amounts Array of token amounts
   */
  const batchTransferToken = useCallback(
    async (tokens: string[], tos: string[], amounts: bigint[]): Promise<ContractResponse> => {
      try {
        const c = requireContract();
        const tx = await c.batchTransferToken(tokens, tos, amounts);
        const receipt = await tx.wait();
        return { success: true, txHash: tx.hash, receipt };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [writeContract],
  );

  /**
   * Changes the AddressRegistry contract (onlyOwner).
   * @param _newAddressRegistry New AddressRegistry address
   */
  const changeAddressRegistry = useCallback(
    async (_newAddressRegistry: string): Promise<ContractResponse> => {
      try {
        const c = requireContract();
        const tx = await c.__changeAddressRegistry(_newAddressRegistry);
        const receipt = await tx.wait();
        return { success: true, txHash: tx.hash, receipt };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [writeContract],
  );

  /**
   * Pauses the contract (onlyOwner).
   */
  const pause = useCallback(async (): Promise<ContractResponse> => {
    try {
      const c = requireContract();
      const tx = await c.pause();
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [writeContract]);

  /**
   * Unpauses the contract (onlyOwner).
   */
  const unpause = useCallback(async (): Promise<ContractResponse> => {
    try {
      const c = requireContract();
      const tx = await c.unpause();
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [writeContract]);

  // ---------------------------------------------------------------------------
  // VIEW / PURE FUNCTIONS (read-only, no transaction required)
  // ---------------------------------------------------------------------------

  /**
   * Returns the balance of a specific ERC20 token held by the wallet contract.
   * @param token ERC20 token contract address
   * @returns Token balance as bigint
   */
  const tokenBalance = useCallback(
    async (token: string): Promise<ContractResponse<bigint>> => {
      try {
        const c = requireContract();
        const result: bigint = await c.tokenBalance(token);
        return { success: true, data: result };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [writeContract],
  );

  /**
   * Returns the ETH balance of the wallet contract.
   * @returns ETH balance in wei as bigint
   */
  const ethBalance = useCallback(async (): Promise<ContractResponse<bigint>> => {
    try {
      const c = requireContract();
      const result: bigint = await c.ethBalance();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [writeContract]);

  /**
   * Returns the address registry contract address (public state variable getter).
   */
  const getAddressRegistry = useCallback(async (): Promise<ContractResponse<string>> => {
    try {
      const c = requireContract();
      const result: string = await c.addressRegistry();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [writeContract]);

  // ---------------------------------------------------------------------------
  // Return everything
  // ---------------------------------------------------------------------------
  return {
    signer,
    signerAddress,
    contract: writeContract, // write-enabled contract instance

    // Write functions
    initialize,
    transfer,
    transferToken,
    batchTransferToken,
    changeAddressRegistry,
    pause,
    unpause,

    // View functions
    tokenBalance,
    ethBalance,
    getAddressRegistry,
  };
}
