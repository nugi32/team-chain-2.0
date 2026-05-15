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
 * Custom hook that provides a typed interface to the TaskController smart contract.
 * Uses wagmi's useWalletClient, Scaffold-ETH's useScaffoldContract and ethers v6.
 *
 * Returns the signer, the write-enabled contract, the signer address, and wrapper
 * functions for every public/external method of the contract.
 */
export default function useTaskController() {
    const { data: walletClient } = useWalletClient();
    const { data: deployedContractData } =
        useDeployedContractInfo("TaskController");

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

                // Connect the deployed contract (read-only instance) with the signer
                if (deployedContractData) {
                    const contract = new ethers.Contract(
                        deployedContractData.address,
                        deployedContractData.abi,
                        _signer
                    );
                    setWriteContract(contract);
                }
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
    // Wrapper for INITIALIZATION function
    // ---------------------------------------------------------------------------
    const initialize = useCallback(
        async (_registryAddress: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.initialize(_registryAddress);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // TASK LIFECYCLE
    // ---------------------------------------------------------------------------

    /**
     * Creates a new task (payable).
     * @param _Title Task title
     * @param _GithubURL GitHub URL
     * @param _DeadlineHours Deadline in hours (uint128)
     * @param _MaximumRevision Max revisions (uint128)
     * @param _user (optional) task creator address, defaults to signer
     * @param valueWei Ether to send with the transaction (bigint)
     */
    const createTask = useCallback(
        async (
            _Title: string,
            _GithubURL: string,
            _DeadlineHours: number | bigint,
            _MaximumRevision: number | bigint,
            _user?: string,
            valueWei?: bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = _user ?? signerAddress;
                const tx = await c.createTask(
                    _Title,
                    _GithubURL,
                    _DeadlineHours,
                    _MaximumRevision,
                    userAddr,
                    { value: valueWei }
                );
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Deletes a task.
     * @param _taskId Task ID
     * @param _user (optional) user address (must be creator), defaults to signer
     */
    const deleteTask = useCallback(
        async (_taskId: number | bigint, _user?: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = _user ?? signerAddress;
                const tx = await c.deleteTask(_taskId, userAddr);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Activates a task by providing creator stake (payable).
     * @param taskId Task ID
     * @param user (optional) creator address, defaults to signer
     * @param valueWei Ether to send (bigint)
     */
    const activateTask = useCallback(
        async (
            taskId: number | bigint,
            user?: string,
            valueWei?: bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = user ?? signerAddress;
                const tx = await c.activateTask(taskId, userAddr, { value: valueWei });
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Opens registration for a task.
     * @param taskId Task ID
     */
    const openRegistration = useCallback(
        async (taskId: number | bigint): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.openRegistration(taskId);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Closes registration for a task.
     * @param taskId Task ID
     */
    const closeRegistration = useCallback(
        async (taskId: number | bigint): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.closeRegistration(taskId);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // JOIN REQUEST FUNCTIONS
    // ---------------------------------------------------------------------------

    /**
     * Requests to join a task (payable).
     * @param taskId Task ID
     * @param user (optional) applicant address, defaults to signer
     * @param valueWei Ether to send (bigint)
     */
    const requestJoinTask = useCallback(
        async (
            taskId: number | bigint,
            user?: string,
            valueWei?: bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = user ?? signerAddress;
                const tx = await c.requestJoinTask(taskId, userAddr, { value: valueWei });
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Withdraws a pending join request.
     * @param taskId Task ID
     * @param user (optional) user address, defaults to signer
     */
    const withdrawJoinRequest = useCallback(
        async (taskId: number | bigint, user?: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = user ?? signerAddress;
                const tx = await c.withdrawJoinRequest(taskId, userAddr);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Approves a join request.
     * @param taskId Task ID
     * @param applicant Address of the applicant
     */
    const approveJoinRequest = useCallback(
        async (
            taskId: number | bigint,
            applicant: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.approveJoinRequest(taskId, applicant);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Rejects a join request.
     * @param taskId Task ID
     * @param _applicant Address of the applicant
     */
    const rejectJoinRequest = useCallback(
        async (
            taskId: number | bigint,
            _applicant: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.rejectJoinRequest(taskId, _applicant);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // SUBMISSION FUNCTIONS
    // ---------------------------------------------------------------------------

    /**
     * Submits a task for review.
     * @param taskId Task ID
     * @param PullRequestURL PR URL
     * @param Note Note
     * @param user (optional) member address, defaults to signer
     */
    const requestSubmitTask = useCallback(
        async (
            taskId: number | bigint,
            PullRequestURL: string,
            Note: string,
            user?: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = user ?? signerAddress;
                const tx = await c.requestSubmitTask(taskId, PullRequestURL, Note, userAddr);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Resubmits a task after revision.
     * @param taskId Task ID
     * @param Note Note
     * @param GithubFixedURL Fixed GitHub URL
     * @param user (optional) member address, defaults to signer
     */
    const reSubmitTask = useCallback(
        async (
            taskId: number | bigint,
            Note: string,
            GithubFixedURL: string,
            user?: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = user ?? signerAddress;
                const tx = await c.reSubmitTask(taskId, Note, GithubFixedURL, userAddr);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Requests revision on a submission.
     * @param taskId Task ID
     * @param Note Note
     * @param additionalDeadlineHours Additional deadline hours
     */
    const requestRevision = useCallback(
        async (
            taskId: number | bigint,
            Note: string,
            additionalDeadlineHours: number | bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.requestRevision(taskId, Note, additionalDeadlineHours);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Approves a task submission.
     * @param taskId Task ID
     */
    const approveTask = useCallback(
        async (taskId: number | bigint): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.approveTask(taskId);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // CANCELLATION FUNCTIONS
    // ---------------------------------------------------------------------------

    /**
     * Cancels a task by the caller (creator or member).
     * @param taskId Task ID
     * @param user (optional) user address, defaults to signer
     */
    const cancelByMe = useCallback(
        async (
            taskId: number | bigint,
            user?: string
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const userAddr = user ?? signerAddress;
                const tx = await c.cancelByMe(taskId, userAddr);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract, signerAddress]
    );

    /**
     * Triggers deadline consequence.
     * @param taskId Task ID
     */
    const triggerDeadline = useCallback(
        async (taskId: number | bigint): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.triggerDeadline(taskId);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // VIEW / PURE FUNCTIONS (read-only, no transaction required)
    // ---------------------------------------------------------------------------

    /**
     * Gets the number of join requests for a task.
     * @param taskId Task ID
     * @returns count as bigint
     */
    const getJoinRequestCount = useCallback(
        async (taskId: number | bigint): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();
                const result: bigint = await c.getJoinRequestCount(taskId);
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Gets the required member stake for a task.
     * @param taskId Task ID
     * @returns stake amount in wei as bigint
     */
    const getMemberRequiredStake = useCallback(
        async (taskId: number | bigint): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();
                const result: bigint = await c.getMemberRequiredStake(taskId);
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Calculates required creator stake.
     * @param DeadlineHours Deadline in hours
     * @param MaximumRevision Max revisions
     * @param rewardWei Reward in wei
     * @param Caller Address of the caller
     * @returns stake amount in wei as bigint
     */
    const ___getCreatorStake = useCallback(
        async (
            DeadlineHours: number | bigint,
            MaximumRevision: number | bigint,
            rewardWei: bigint,
            Caller: string
        ): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();
                const result: bigint = await c.___getCreatorStake(
                    DeadlineHours,
                    MaximumRevision,
                    rewardWei,
                    Caller
                );
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Calculates project value.
     * @param DeadlineHours Deadline in hours
     * @param MaximumRevision Max revisions
     * @param rewardWei Reward in wei
     * @param Caller Address of the caller
     * @returns project value in wei as bigint
     */
    const ___getProjectValue = useCallback(
        async (
            DeadlineHours: number | bigint,
            MaximumRevision: number | bigint,
            rewardWei: bigint,
            Caller: string
        ): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();
                const result: bigint = await c.___getProjectValue(
                    DeadlineHours,
                    MaximumRevision,
                    rewardWei,
                    Caller
                );
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // OWNER / ADMIN FUNCTIONS
    // ---------------------------------------------------------------------------

    /**
     * Withdraws accumulated protocol fees to system wallet (owner only).
     */
    const withdrawToSystemWallet = useCallback(async (): Promise<ContractResponse> => {
        try {
            const c = requireContract();
            const tx = await c.withdrawToSystemWallet();
            const receipt = await tx.wait();
            return { success: true, txHash: tx.hash, receipt };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    /**
     * Changes the address registry (owner only).
     * @param newAddress New registry address
     */
    const __changeControllerAndModuleAddressRegistry = useCallback(
        async (newAddress: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.__changeControllerAndModuleAddressRegistry(newAddress);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Pauses the contract (owner only).
     * @param caller Address of the caller (must be non-zero)
     */
    const pause = useCallback(
        async (caller: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.pause(caller);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Unpauses the contract (owner only).
     * @param caller Address of the caller (must be non-zero)
     */
    const unpause = useCallback(
        async (caller: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.unpause(caller);
                const receipt = await tx.wait();
                return { success: true, txHash: tx.hash, receipt };
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
        // Initialization
        initialize,
        // Task lifecycle
        createTask,
        deleteTask,
        activateTask,
        openRegistration,
        closeRegistration,
        // Join requests
        requestJoinTask,
        withdrawJoinRequest,
        approveJoinRequest,
        rejectJoinRequest,
        // Submissions
        requestSubmitTask,
        reSubmitTask,
        requestRevision,
        approveTask,
        // Cancellation
        cancelByMe,
        triggerDeadline,
        // View / Pure
        getJoinRequestCount,
        getMemberRequiredStake,
        ___getCreatorStake,
        ___getProjectValue,
        // Owner
        withdrawToSystemWallet,
        __changeControllerAndModuleAddressRegistry,
        pause,
        unpause,
    };
}