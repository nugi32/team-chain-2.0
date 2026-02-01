// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStateVariable {
    // =============================================================
    // 1. Stake Utils Getters
    // =============================================================

    function __getMemberStakeFromRewardPercentage() external view returns (uint128);
    function __getCreatorStakeFromProjectValuePercentage() external view returns (uint128);

    // =============================================================
    // 2. Address Utils Getters
    // =============================================================

    function __getAccessControlAddress() external view returns(address);
    function __getSystemWalletAddress() external view returns(address);
    function __getStateVariableAddress() external view returns(address);

    // =============================================================
    // 3. Component Weight Percentage Getters
    // =============================================================

    function __getRewardScore() external view returns (uint64);
    function __getReputationScore() external view returns (uint64);
    function __getDeadlineScore() external view returns (uint64);
    function __getRevisionScore() external view returns (uint64);

    // =============================================================
    // 4. Reputation Point Getters
    // =============================================================

    function __getCancelByMe() external view returns (uint64);
    function __getRevisionPenalty() external view returns (uint64);
    function __getTaskAcceptCreator() external view returns (uint32);
    function __getTaskAcceptMember() external view returns (uint32);
    function __getDeadlineHitCreator() external view returns (uint32);
    function __getDeadlineHitMember() external view returns (uint32);

    // =============================================================
    // 5. State Variable Getters
    // =============================================================

    function __getMaxStake() external view returns (uint256);
    function __getMaxReward() external view returns (uint256);
    function __getMinRevisionTimeInHour() external view returns (uint64);
    function __getNegPenalty() external view returns (uint64);
    function __getFeePercentage() external view returns (uint64);
    function __getMaxRevision() external view returns (uint64);

    // =============================================================
    // 6. Project Category Getters
    // =============================================================

    function __getCategoryLow() external view returns (uint256);
    function __getCategoryMiddleLow() external view returns (uint256);
    function __getCategoryMiddle() external view returns (uint256);
    function __getCategoryMiddleHigh() external view returns (uint256);
    function __getCategoryHigh() external view returns (uint256);
    function __getCategoryUltraHigh() external view returns (uint256);
}