// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

/**
 * @title ISubmissionLogic
 * @notice Interface for submission logic contract
 * @dev Handles task submissions, revisions, and approvals
 */
interface ISubmissionLogic {
    // =============================================================
    // EVENTS
    // =============================================================
    event SubmissionEvent(uint indexed taskId, address indexed user, string action);

    // =============================================================
    // ERRORS
    // =============================================================
    error SubmissionErr(string message);

    // =============================================================
    // FUNCTIONS
    // =============================================================

    /**
     * @notice Submits a task for review
     * @param taskId Task ID to submit
     * @param PullRequestURL GitHub Pull Request URL
     * @param Note Submission notes
     * @param user Member address
     */
    function __requestSubmitTask(
        uint256 taskId,
        string calldata PullRequestURL,
        string calldata Note,
        address user
    ) external;

    /**
     * @notice Resubmits a task after revision request
     * @param taskId Task ID to resubmit
     * @param Note Resubmission notes
     * @param GithubFixedURL Updated GitHub URL
     * @param user Member address
     */
    function __reSubmitTask(
        uint256 taskId,
        string calldata Note,
        string calldata GithubFixedURL,
        address user
    ) external;

    /**
     * @notice Requests revision on a submission
     * @param taskId Task ID
     * @param Note Revision notes/feedback
     * @param additionalDeadlineHours Additional hours for revision
     */
    function __requestRevision(
        uint256 taskId,
        string calldata Note,
        uint256 additionalDeadlineHours
    ) external;

    /**
     * @notice Approves a task submission
     * @param taskId Task ID to approve
     */
    function __approveTask(uint256 taskId) external;

    function __changeAddressRegistry(address newAddress) external;
}
