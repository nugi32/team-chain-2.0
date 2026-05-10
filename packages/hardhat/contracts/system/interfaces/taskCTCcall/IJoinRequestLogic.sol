// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

/**
 * @title IJoinRequestLogic
 * @notice Interface for join request logic contract
 * @dev Handles task join requests, approvals, and rejections
 */
interface IJoinRequestLogic {
    // =============================================================
    // EVENTS
    // =============================================================
    event JoinRequestEvent(uint indexed taskId, address indexed user, string action);

    // =============================================================
    // ERRORS
    // =============================================================
    error JoinRequestErr(string message);

    // =============================================================
    // FUNCTIONS
    // =============================================================

    /**
     * @notice Requests to join a task
     * @param taskId Task ID to join
     * @param user Applicant address
     */
    function __requestJoinTask(uint256 taskId, address user) external payable;

    /**
     * @notice Withdraws a pending join request
     * @param taskId Task ID
     * @param user Applicant address
     */
    function __withdrawJoinRequest(uint256 taskId, address user) external;

    /**
     * @notice Approves a join request
     * @param taskId Task ID
     * @param applicant Applicant address to approve
     */
    function __approveJoinRequest(uint256 taskId, address applicant) external;

    /**
     * @notice Rejects a join request
     * @param taskId Task ID
     * @param applicant Applicant address to reject
     */
    function __rejectJoinRequest(uint256 taskId, address applicant) external;

    function __changeAddressRegistry(address newAddress) external;
}
