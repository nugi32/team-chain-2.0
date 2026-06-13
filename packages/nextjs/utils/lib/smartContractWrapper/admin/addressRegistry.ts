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
 * Type for the taskComponents struct returned by the contract.
 */
export interface TaskComponents {
    dataContract: string;
    cancelModule: string;
    joinModule: string;
    submisionModule: string;
    taskLifecycleModule: string;
    taskControler: string;
}

/**
 * Custom hook that provides a typed interface to the AddressRegistry smart contract.
 * Uses wagmi's useWalletClient, Scaffold-ETH's useScaffoldContract and ethers v6.
 *
 * Returns the signer, the write-enabled contract, the signer address, and wrapper
 * functions for every public/external method of the contract.
 */
export default function useAddressRegistry() {
    const { data: walletClient } = useWalletClient();
    const { data: deployedContractData } =
        useDeployedContractInfo("AddressRegistry");

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
                            const provider = new ethers.BrowserProvider(
                                walletClient.transport
                            );

                            const _signer = await provider.getSigner();

                            setSigner(_signer);

                            const addr = await _signer.getAddress();

                            setSignerAddress(addr);

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
     * Initializes the AddressRegistry with the access control contract.
     * @param _accessControlContract Address of the access control contract
     */
    const initialize = useCallback(
        async (_accessControlContract: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.initialize(_accessControlContract);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Performs the second initialization (circular dependency resolution).
     * @param _usersContract Address of the Users contract
     * @param _walletContract Address of the Wallet contract (payable)
     * @param _dataContract Address of the Data contract
     * @param _taskDataContract Address of the TaskData contract
     * @param _cancelModule Address of the Cancel module
     * @param _joinModule Address of the Join module
     * @param _submissionModule Address of the Submission module
     * @param _taskLifecycleModule Address of the TaskLifecycle module
     * @param _taskControler Address of the TaskController
     */
    const secondInitialization = useCallback(
        async (
            _usersContract: string,
            _walletContract: string,
            _dataContract: string,
            _taskDataContract: string,
            _cancelModule: string,
            _joinModule: string,
            _submissionModule: string,
            _taskLifecycleModule: string,
            _taskControler: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.____secondInitialization(
                    _usersContract,
                    _walletContract,
                    _dataContract,
                    _taskDataContract,
                    _cancelModule,
                    _joinModule,
                    _submissionModule,
                    _taskLifecycleModule,
                    _taskControler
                );
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Updates the core addresses (access control, users, wallet, data).
     * @param _accessControlContract New access control address
     * @param _usersContract New users contract address
     * @param _walletContract New wallet contract address (payable)
     * @param _dataContract New data contract address
     */
    const updateCoreAddresses = useCallback(
        async (
            _accessControlContract: string,
            _usersContract: string,
            _walletContract: string,
            _dataContract: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.updateCoreAddresses(
                    _accessControlContract,
                    _usersContract,
                    _walletContract,
                    _dataContract
                );
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Updates all task component addresses.
     * @param _dataContract TaskData contract address
     * @param _cancelModule Cancel module address
     * @param _joinModule Join module address
     * @param _submisionModule Submission module address
     * @param _taskLifecycleModule TaskLifecycle module address
     * @param _taskControler TaskController address
     */
    const updateTaskComponents = useCallback(
        async (
            _dataContract: string,
            _cancelModule: string,
            _joinModule: string,
            _submisionModule: string,
            _taskLifecycleModule: string,
            _taskControler: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.updateTaskComponents(
                    _dataContract,
                    _cancelModule,
                    _joinModule,
                    _submisionModule,
                    _taskLifecycleModule,
                    _taskControler
                );
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
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
     * Returns the current access control contract address.
     */
    const getAccessControlContract = useCallback(
        async (): Promise<ContractResponse<string>> => {
            try {
                const c = requireContract();
                const result: string = await c.__accessControlContract();
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Returns the current users contract address.
     */
    const getUsersContract = useCallback(async (): Promise<ContractResponse<string>> => {
        try {
            const c = requireContract();
            const result: string = await c.__usersContract();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    /**
     * Returns the current wallet contract address (payable).
     */
    const getWalletContract = useCallback(async (): Promise<ContractResponse<string>> => {
        try {
            const c = requireContract();
            const result: string = await c.__walletContract();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    /**
     * Returns the current data contract address.
     */
    const getDataContract = useCallback(async (): Promise<ContractResponse<string>> => {
        try {
            const c = requireContract();
            const result: string = await c.__dataContract();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    /**
     * Returns the full taskComponents struct.
     */
    const getTaskComponents = useCallback(
        async (): Promise<ContractResponse<TaskComponents>> => {
            try {
                const c = requireContract();
                const raw: any = await c.__taskComponentsAddr();
                // In ethers v6, structs are returned as an array-like object with named keys.
                const components: TaskComponents = {
                    dataContract: raw.dataContract,
                    cancelModule: raw.cancelModule,
                    joinModule: raw.joinModule,
                    submisionModule: raw.submisionModule,
                    taskLifecycleModule: raw.taskLifecycleModule,
                    taskControler: raw.taskControler,
                };
                return { success: true, data: components };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // Return everything
    // ---------------------------------------------------------------------------
    return {
        signer,
        signerAddress,
        contract: writeContract, // write-enabled contract instance

        // Write functions
        initialize,
        secondInitialization,
        updateCoreAddresses,
        updateTaskComponents,
        pause,
        unpause,

        // View functions (state variable getters)
        getAccessControlContract,
        getUsersContract,
        getWalletContract,
        getDataContract,
        getTaskComponents,
    };
}