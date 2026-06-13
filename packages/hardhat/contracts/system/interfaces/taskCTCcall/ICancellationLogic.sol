// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

/**
 * @title ICancellationLogic
 * @notice Interface for cancellation logic contract
 * @dev Handles task cancellations and deadline triggers
 */
interface ICancellationLogic {
    // =============================================================
    // EVENTS
    // =============================================================
    event CancellationEvent(uint indexed taskId, address indexed user, string action);

    // =============================================================
    // ERRORS
    // =============================================================
    error CancellationErr(string message);

    // =============================================================
    // FUNCTIONS
    // =============================================================

    /**
     * @notice Cancels a task by creator or member
     * @param taskId Task ID to cancel
     * @param user Caller address (creator or member)
     */
    function __cancelByMe(uint256 taskId, address user) external;

    /**
     * @notice Triggers deadline consequence if not completed
     * @param taskId Task ID
     */
    function __triggerDeadline(uint256 taskId) external;

    function __changeAddressRegistry(address newAddress) external;
}
