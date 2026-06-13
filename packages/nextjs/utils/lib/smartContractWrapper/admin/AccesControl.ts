import { useWalletClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

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
 * Custom hook that provides a typed interface
 * to the AccessControl smart contract.
 *
 * Uses:
 * - wagmi useWalletClient
 * - Scaffold-ETH deployed contract lookup
 * - ethers v6
 */
export default function useAccessControl() {
    const { data: walletClient } = useWalletClient();

    const { data: deployedContractData } =
        useDeployedContractInfo("AccessControl");

    const [signer, setSigner] =
        useState<ethers.Signer | null>(null);

    const [signerAddress, setSignerAddress] =
        useState<string>("");

    const [writeContract, setWriteContract] =
        useState<ethers.Contract | null>(null);

    // ---------------------------------------------------------------------------
    // Initialize ethers signer + contract
    // ---------------------------------------------------------------------------

    useEffect(() => {
        if (!walletClient || !deployedContractData) {
            setSigner(null);
            setSignerAddress("");
            setWriteContract(null);
            return;
        }

        const initSigner = async () => {
            try {
                // Create ethers provider from wagmi wallet client
                const provider = new ethers.BrowserProvider(
                    walletClient.transport
                );

                // Get signer
                const _signer = await provider.getSigner();

                setSigner(_signer);

                // Get connected wallet address
                const addr = await _signer.getAddress();

                setSignerAddress(addr);

                // Create write-enabled ethers contract
                const contract = new ethers.Contract(
                    deployedContractData.address,
                    deployedContractData.abi,
                    _signer
                );

                setWriteContract(contract);
            } catch (error) {
                console.error(
                    "Failed to initialize signer/contract:",
                    error
                );

                setSigner(null);
                setSignerAddress("");
                setWriteContract(null);
            }
        };

        initSigner();
    }, [walletClient, deployedContractData]);

    // ---------------------------------------------------------------------------
    // Helper: ensure contract exists
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
     * Initialize contract
     */
    const initialize = useCallback(
        async (): Promise<ContractResponse> => {
            try {
                const c = requireContract();

                const tx = await c.initialize();

                const receipt = await tx.wait();

                return {
                    success: true,
                    txHash: tx.hash,
                    receipt,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    /**
     * Assign new employee
     */
    const assignNewEmployee = useCallback(
        async (
            newEmployee: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();

                const tx = await c.assignNewEmployee(
                    newEmployee
                );

                const receipt = await tx.wait();

                return {
                    success: true,
                    txHash: tx.hash,
                    receipt,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    /**
     * Remove employee
     */
    const removeEmployee = useCallback(
        async (
            employee: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();

                const tx = await c.removeEmployee(employee);

                const receipt = await tx.wait();

                return {
                    success: true,
                    txHash: tx.hash,
                    receipt,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    /**
     * Change owner
     */
    const changeOwner = useCallback(
        async (
            newOwner: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();

                const tx = await c.changeOwner(newOwner);

                const receipt = await tx.wait();

                return {
                    success: true,
                    txHash: tx.hash,
                    receipt,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // READ FUNCTIONS
    // ---------------------------------------------------------------------------

    /**
     * Get contract owner
     */
    const getOwner = useCallback(
        async (): Promise<ContractResponse<string>> => {
            try {
                const c = requireContract();

                const result: string = await c.owner();

                return {
                    success: true,
                    data: result,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    /**
     * Get employee count
     */
    const getEmployeeCount = useCallback(
        async (): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();

                const result: bigint =
                    await c.employeeCount();

                return {
                    success: true,
                    data: result,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    /**
     * Check employee role
     */
    const hasRole = useCallback(
        async (
            account: string
        ): Promise<ContractResponse<boolean>> => {
            try {
                const c = requireContract();

                const result: boolean =
                    await c.hasRole(account);

                return {
                    success: true,
                    data: result,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    /**
     * Get employee mapping status
     */
    const getEmployee = useCallback(
        async (
            employee: string
        ): Promise<ContractResponse<boolean>> => {
            try {
                const c = requireContract();

                const result: boolean =
                    await c.employees(employee);

                return {
                    success: true,
                    data: result,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // Return API
    // ---------------------------------------------------------------------------

    return {
        signer,
        signerAddress,

        // ethers contract instance
        contract: writeContract,

        // Write functions
        initialize,
        assignNewEmployee,
        removeEmployee,
        changeOwner,

        // Read functions
        getOwner,
        getEmployeeCount,
        hasRole,
        getEmployee,
    };
}