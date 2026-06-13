// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "./ITaskData.sol";

/**
 * @title ITaskLifecycleLogic
 * @notice Interface for task lifecycle logic contract
 * @dev Handles task creation, deletion, activation, and registration management
 */
interface ITaskLifecycleLogic {
    // =============================================================
    // EVENTS
    // =============================================================
    event TaskLifecycleEvent(uint indexed taskId, address indexed user, string action);

    // =============================================================
    // ERRORS
    // =============================================================
    error TaskLifecycleErr(string message);

    // =============================================================
    // FUNCTIONS
    // =============================================================

    /**
     * @notice Creates a new task
     * @param _Title Task title
     * @param _GithubURL GitHub repository URL
     * @param _DeadlineHours Deadline in hours
     * @param _MaximumRevision Maximum number of revisions allowed
     * @param _user Creator address
     * @return taskId The ID of the newly created task
     */
    function __createTask(
        string memory _Title,
        string memory _GithubURL,
        uint128 _DeadlineHours,
        uint128 _MaximumRevision,
        address _user
    ) external payable returns (uint256 taskId);

    /**
     * @notice Deletes a task
     * @param _taskId Task ID to delete
     * @param _user Task creator address
     */
    function __deleteTask(uint256 _taskId, address _user) external;

    /**
     * @notice Activates a task by requiring creator stake
     * @param taskId Task ID to activate
     * @param user Creator address
     */
    function __activateTask(uint256 taskId, address user) external payable;

    /**
     * @notice Opens registration for task applicants
     * @param taskId Task ID
     */
    function __openRegistration(uint256 taskId) external;

    /**
     * @notice Closes registration for task applicants
     * @param taskId Task ID
     */
    function __closeRegistration(uint256 taskId) external;

    /**
     * @notice Gets required creator stake for a task
     * @param DeadlineHours Deadline in hours
     * @param MaximumRevision Maximum revisions allowed
     * @param rewardWei Reward amount in wei
     * @param Caller Address of the caller
     * @return stake Required stake amount
     */
    function ___getCreatorStake(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) external view returns (uint256 stake);

    /**
     * @notice Calculates project value based on parameters
     * @param DeadlineHours Deadline in hours
     * @param MaximumRevision Maximum revisions allowed
     * @param rewardWei Reward amount in wei
     * @param Caller Address of the caller
     * @return value Calculated project value
     */
    function ___getProjectValue(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) external view returns (uint256 value);

    function __changeAddressRegistry(address newAddress) external;
}
