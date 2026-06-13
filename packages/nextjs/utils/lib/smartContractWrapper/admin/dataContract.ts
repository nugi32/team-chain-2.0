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
 * Struct types matching the dataContract Solidity structs.
 */
export interface ComponentWeightPercentage {
    rewardScore: bigint;
    reputationScore: bigint;
    deadlineScore: bigint;
    revisionScore: bigint;
}

export interface ReputationPoint {
    cancelByMe: bigint;
    revision: bigint;
    taskAcceptCreator: bigint;
    taskAcceptMember: bigint;
    deadlineHitCreator: bigint;
    deadlineHitMember: bigint;
}

export interface StateVar {
    maxStake: bigint;
    maxReward: bigint;
    minRevisionTimeInHour: bigint;
    negPenalty: bigint;
    feePercentage: bigint;
    maxRevision: bigint;
}

export interface ProjectValueCategory {
    low: bigint;
    middleLow: bigint;
    middle: bigint;
    middleHigh: bigint;
    high: bigint;
    ultraHigh: bigint;
}

export interface StakeUtil {
    memberStakePercentageFromReward: bigint;
    creatorStakePercentageFromProjectValue: bigint;
}

/**
 * Custom hook that provides a typed interface to the dataContract smart contract.
 * Uses wagmi's useWalletClient, Scaffold-ETH's useScaffoldContract and ethers v6.
 *
 * Returns the signer, the write-enabled contract, the signer address, and wrapper
 * functions for every public/external method of the contract.
 */
export default function useDataContract() {
    const { data: walletClient } = useWalletClient();
    const { data: deployedContractData } =
        useDeployedContractInfo("dataContract");

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
    // PUBLIC STATE VARIABLE GETTERS (automatically generated by Solidity)
    // ---------------------------------------------------------------------------

    /**
     * Returns the full ComponentWeightPercentage struct.
     */
    const getComponentWeightPercentages = useCallback(
        async (): Promise<ContractResponse<ComponentWeightPercentage>> => {
            try {
                const c = requireContract();
                const raw = await c.componentWeightPercentages();
                const result: ComponentWeightPercentage = {
                    rewardScore: raw.rewardScore,
                    reputationScore: raw.reputationScore,
                    deadlineScore: raw.deadlineScore,
                    revisionScore: raw.revisionScore,
                };
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Returns the full ReputationPoint struct.
     */
    const getReputationPoints = useCallback(
        async (): Promise<ContractResponse<ReputationPoint>> => {
            try {
                const c = requireContract();
                const raw = await c.reputationPoints();
                const result: ReputationPoint = {
                    cancelByMe: raw.cancelByMe,
                    revision: raw.revision,
                    taskAcceptCreator: raw.taskAcceptCreator,
                    taskAcceptMember: raw.taskAcceptMember,
                    deadlineHitCreator: raw.deadlineHitCreator,
                    deadlineHitMember: raw.deadlineHitMember,
                };
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Returns the full StateVar struct.
     */
    const getStateVariables = useCallback(
        async (): Promise<ContractResponse<StateVar>> => {
            try {
                const c = requireContract();
                const raw = await c.stateVariables();
                const result: StateVar = {
                    maxStake: raw.maxStake,
                    maxReward: raw.maxReward,
                    minRevisionTimeInHour: raw.minRevisionTimeInHour,
                    negPenalty: raw.negPenalty,
                    feePercentage: raw.feePercentage,
                    maxRevision: raw.maxRevision,
                };
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Returns the full ProjectValueCategory struct.
     */
    const getProjectCategories = useCallback(
        async (): Promise<ContractResponse<ProjectValueCategory>> => {
            try {
                const c = requireContract();
                const raw = await c.projectCategories();
                const result: ProjectValueCategory = {
                    low: raw.low,
                    middleLow: raw.middleLow,
                    middle: raw.middle,
                    middleHigh: raw.middleHigh,
                    high: raw.high,
                    ultraHigh: raw.ultraHigh,
                };
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Returns the full StakeUtil struct.
     */
    const getStakeUtils = useCallback(
        async (): Promise<ContractResponse<StakeUtil>> => {
            try {
                const c = requireContract();
                const raw = await c.stakeUtils();
                const result: StakeUtil = {
                    memberStakePercentageFromReward: raw.memberStakePercentageFromReward,
                    creatorStakePercentageFromProjectValue: raw.creatorStakePercentageFromProjectValue,
                };
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    /**
     * Returns the address registry contract address.
     */
    const getAddressRegistry = useCallback(
        async (): Promise<ContractResponse<string>> => {
            try {
                const c = requireContract();
                const result: string = await c.addressRegistry();
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // STAKING UTILITY GETTERS (external view)
    // ---------------------------------------------------------------------------

    const getMemberStakeFromRewardPercentage = useCallback(
        async (): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();
                const result: bigint = await c.__getMemberStakeFromRewardPercentage();
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    const getCreatorStakeFromProjectValuePercentage = useCallback(
        async (): Promise<ContractResponse<bigint>> => {
            try {
                const c = requireContract();
                const result: bigint = await c.__getCreatorStakeFromProjectValuePercentage();
                return { success: true, data: result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        [writeContract]
    );

    // ---------------------------------------------------------------------------
    // COMPONENT WEIGHT PERCENTAGE GETTERS
    // ---------------------------------------------------------------------------

    const getRewardScore = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getRewardScore();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getReputationScore = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getReputationScore();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getDeadlineScore = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getDeadlineScore();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getRevisionScore = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getRevisionScore();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    // ---------------------------------------------------------------------------
    // REPUTATION POINT GETTERS
    // ---------------------------------------------------------------------------

    const getCancelByMe = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCancelByMe();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getRevisionPenalty = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getRevisionPenalty();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getTaskAcceptCreator = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getTaskAcceptCreator();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getTaskAcceptMember = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getTaskAcceptMember();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getDeadlineHitCreator = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getDeadlineHitCreator();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getDeadlineHitMember = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getDeadlineHitMember();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    // ---------------------------------------------------------------------------
    // STATE VARIABLE GETTERS
    // ---------------------------------------------------------------------------

    const getMaxStake = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getMaxStake();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getMaxReward = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getMaxReward();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getMinRevisionTimeInHour = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getMinRevisionTimeInHour();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getNegPenalty = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getNegPenalty();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getFeePercentage = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getFeePercentage();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getMaxRevision = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getMaxRevision();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    // ---------------------------------------------------------------------------
    // PROJECT CATEGORY GETTERS
    // ---------------------------------------------------------------------------

    const getCategoryLow = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCategoryLow();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getCategoryMiddleLow = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCategoryMiddleLow();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getCategoryMiddle = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCategoryMiddle();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getCategoryMiddleHigh = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCategoryMiddleHigh();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getCategoryHigh = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCategoryHigh();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    const getCategoryUltraHigh = useCallback(async (): Promise<ContractResponse<bigint>> => {
        try {
            const c = requireContract();
            const result: bigint = await c.__getCategoryUltraHigh();
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }, [writeContract]);

    // ---------------------------------------------------------------------------
    // WRITE FUNCTIONS (onlyEmployes / onlyOwner)
    // ---------------------------------------------------------------------------

    /**
     * Updates component weight percentages (onlyEmployes).
     */
    const setComponentWeightPercentages = useCallback(
        async (
            _rewardScore: number | bigint,
            _reputationScore: number | bigint,
            _deadlineScore: number | bigint,
            _revisionScore: number | bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.setComponentWeightPercentages(
                    _rewardScore,
                    _reputationScore,
                    _deadlineScore,
                    _revisionScore
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
     * Updates reputation points (onlyEmployes).
     */
    const setReputationPoints = useCallback(
        async (
            _cancelByMeRP: number | bigint,
            _revisionRP: number | bigint,
            _taskAcceptCreatorRP: number | bigint,
            _taskAcceptMemberRP: number | bigint,
            _deadlineHitCreatorRP: number | bigint,
            _deadlineHitMemberRP: number | bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.setReputationPoints(
                    _cancelByMeRP,
                    _revisionRP,
                    _taskAcceptCreatorRP,
                    _taskAcceptMemberRP,
                    _deadlineHitCreatorRP,
                    _deadlineHitMemberRP
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
     * Updates global state variables (onlyEmployes).
     * Values for maxStake/maxReward are expected in ether units (converted internally).
     */
    const setStateVariables = useCallback(
        async (
            _maxStakeInEther: number | bigint,
            _maxRewardInEther: number | bigint,
            _minRevisionTimeInHour: number | bigint,
            _negPenalty: number | bigint,
            _feePercentage: number | bigint,
            _maxRevision: number | bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.setStateVariables(
                    _maxStakeInEther,
                    _maxRewardInEther,
                    _minRevisionTimeInHour,
                    _negPenalty,
                    _feePercentage,
                    _maxRevision
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
     * Updates project categories (onlyEmployes).
     * Values are expected in ether units (converted internally).
     */
    const setProjectCategories = useCallback(
        async (
            _low: number | bigint,
            _middleLow: number | bigint,
            _middle: number | bigint,
            _middleHigh: number | bigint,
            _high: number | bigint,
            _ultraHigh: number | bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.setProjectCategories(
                    _low,
                    _middleLow,
                    _middle,
                    _middleHigh,
                    _high,
                    _ultraHigh
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
     * Updates stake utility percentages (onlyEmployes).
     */
    const setStakeUtils = useCallback(
        async (
            _memberStakePercentageFromReward: number | bigint,
            _creatorStakePercentageFromProjectValue: number | bigint
        ): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.setStakeUtils(
                    _memberStakePercentageFromReward,
                    _creatorStakePercentageFromProjectValue
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
     * Changes the address registry contract (onlyOwner).
     */
    const changeRegistryAddress = useCallback(
        async (_newRegistryAddress: string): Promise<ContractResponse> => {
            try {
                const c = requireContract();
                const tx = await c.changeRegistryAddress(_newRegistryAddress);
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
    // Return everything
    // ---------------------------------------------------------------------------
    return {
        signer,
        signerAddress,
        contract: writeContract, // write-enabled contract instance

        // Struct getters
        getComponentWeightPercentages,
        getReputationPoints,
        getStateVariables,
        getProjectCategories,
        getStakeUtils,
        getAddressRegistry,

        // Staking utility getters
        getMemberStakeFromRewardPercentage,
        getCreatorStakeFromProjectValuePercentage,

        // Component weight getters
        getRewardScore,
        getReputationScore,
        getDeadlineScore,
        getRevisionScore,

        // Reputation point getters
        getCancelByMe,
        getRevisionPenalty,
        getTaskAcceptCreator,
        getTaskAcceptMember,
        getDeadlineHitCreator,
        getDeadlineHitMember,

        // State variable getters
        getMaxStake,
        getMaxReward,
        getMinRevisionTimeInHour,
        getNegPenalty,
        getFeePercentage,
        getMaxRevision,

        // Project category getters
        getCategoryLow,
        getCategoryMiddleLow,
        getCategoryMiddle,
        getCategoryMiddleHigh,
        getCategoryHigh,
        getCategoryUltraHigh,

        // Write functions
        setComponentWeightPercentages,
        setReputationPoints,
        setStateVariables,
        setProjectCategories,
        setStakeUtils,
        changeRegistryAddress,
        pause,
        unpause,
    };
}