// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

/**
 * @title ITaskController
 * @notice Interface for task controller contract
 * @dev Routes calls to appropriate logic contracts
 */
interface ITaskController {
    // =============================================================
    // TASK LIFECYCLE FUNCTIONS
    // =============================================================
    function createTask(
        string memory _Title,
        string memory _GithubURL,
        uint128 _DeadlineHours,
        uint128 _MaximumRevision,
        address _user
    ) external payable;

    function deleteTask(uint256 _taskId, address _user) external;
    function activateTask(uint256 taskId, address user) external payable;
    function openRegistration(uint256 taskId) external;
    function closeRegistration(uint256 taskId) external;

    // =============================================================
    // JOIN REQUEST FUNCTIONS
    // =============================================================
    function requestJoinTask(uint256 taskId, address user) external payable;
    function withdrawJoinRequest(uint256 taskId, address user) external;
    function approveJoinRequest(uint256 taskId, address applicant) external;
    function rejectJoinRequest(uint256 taskId, address applicant) external;

    // =============================================================
    // SUBMISSION FUNCTIONS
    // =============================================================
    function requestSubmitTask(
        uint256 taskId,
        string calldata PullRequestURL,
        string calldata Note,
        address user
    ) external;

    function reSubmitTask(
        uint256 taskId,
        string calldata Note,
        string calldata GithubFixedURL,
        address user
    ) external;

    function requestRevision(
        uint256 taskId,
        string calldata Note,
        uint256 additionalDeadlineHours
    ) external;

    function approveTask(uint256 taskId) external;

    // =============================================================
    // CANCELLATION FUNCTIONS
    // =============================================================
    function cancelByMe(uint256 taskId, address user) external;
    function triggerDeadline(uint256 taskId) external;

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================
    function getJoinRequestCount(uint256 taskId) external view returns (uint256);
    function getMemberRequiredStake(uint256 taskId) external view returns (uint256);

    function ___getCreatorStake(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) external view returns (uint256);

    function ___getProjectValue(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) external view returns (uint256);

    function __changeControllerAndModuleAddressRegistry(address newAddress) external;
}
