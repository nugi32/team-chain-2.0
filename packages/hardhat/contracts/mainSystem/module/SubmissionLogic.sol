// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "../../system/interfaces/taskCTCcall/ITaskData.sol";
import "../../system/interfaces/taskCTCcall/ISubmissionLogic.sol";
import "../../system/interfaces/taskCTCcall/ICancellationLogic.sol";
import "../../system/interfaces/IAddressRegistry.sol";
import "../../system/interfaces/CTCcall/IUsers.sol";
import "../../system/interfaces/IDataContract.sol";

/**
 * @title SubmissionLogic
 * @notice Handles task submissions, revisions, and approvals
 * @dev Stateless logic contract - all state access via CTC calls to taskData
 */
contract SubmissionLogic is ISubmissionLogic {
    // =============================================================
    // STATE VARIABLES
    // =============================================================
    IAddressRegistry public addressRegistry;

    modifier ctcCall() {
        if(msg.sender != addressRegistry.__taskComponentsAddr().taskControler) revert SubmissionErr("UnauthorizedCaller");
        _;
    }

    // =============================================================
    // INITIALIZATION
    // =============================================================
    constructor(address _addressRegistry) {
        if (_addressRegistry == address(0)) {
            revert SubmissionErr("ZeroAddress");
        }
        addressRegistry = IAddressRegistry(_addressRegistry);
    }

    function _getTaskDataContract() internal view returns (ITaskData) {
        return ITaskData(addressRegistry.__taskComponentsAddr().dataContract);
    }

    function _getUsersContract() internal view returns (IUsers) {
        return IUsers(addressRegistry.__usersContract());
    }

    function _getDataContract() internal view returns (IDataContract) {
        return IDataContract(addressRegistry.__dataContract());
    }

    function _getTaskCancellationContract() internal view returns (ICancellationLogic) {
        return ICancellationLogic(addressRegistry.__taskComponentsAddr().cancelModule);
    }

    // =============================================================
    // SUBMISSION FUNCTIONS
    // =============================================================

    /**
     * @notice Submits a task for review
     * @dev Only callable by task member, task must be in progress
     */
    function __requestSubmitTask(
        uint256 taskId,
        string calldata PullRequestURL,
        string calldata Note,
        address user
    ) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);

        if (t.status != ITaskData.TaskStatus.InProgres) {
            revert SubmissionErr("InvalidStatus");
        }

        // SECURITY FIX M-1, NEW-H-2: Add deadline check - late submissions should be blocked
        // Cannot call __triggerDeadline here due to ctcCall routing issue
        // (msg.sender would be submisionModule not taskControler, causing revert)
        if (block.timestamp > t.deadlineAt && t.deadlineAt != 0) {
            revert SubmissionErr("SubmissionPastDeadline");
        }

        ITaskData.TaskSubmitData memory existingSubmit = _getTaskDataContract().__getTaskSubmit(taskId);
        if (existingSubmit.sender != address(0) && existingSubmit.status == ITaskData.SubmitStatus.Pending) {
            revert SubmissionErr("SubmissionError");
        }

        ITaskData.TaskSubmitData memory newSubmit = ITaskData.TaskSubmitData({
            githubURL: PullRequestURL,
            note: Note,
            sender: user,
            status: ITaskData.SubmitStatus.Pending,
            revisionTime: 0,
            newDeadline: t.deadlineAt
        });

        _getTaskDataContract().__setTaskSubmit(taskId, newSubmit);

        emit SubmissionEvent(taskId, user, "TaskSubmitted");
    }

    /**
     * @notice Resubmits a task after revision request
     * @dev Only callable by task member after revision is requested
     */
    function __reSubmitTask(
        uint256 taskId,
        string calldata Note,
        string calldata GithubFixedURL,
        address user
    ) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        ITaskData.TaskSubmitData memory s = _getTaskDataContract().__getTaskSubmit(taskId);

        if (s.status != ITaskData.SubmitStatus.RevisionNeeded) {
            revert SubmissionErr("InvalidStatus");
        }

        // SECURITY FIX H-3: Check revision count before updating to prevent stale memory reads
        if (s.revisionTime >= t.maxRevision) {
            // Max revisions exceeded - auto-approve the task
            __approveTask(taskId);
            return;
        }

        // Update submission and refresh from storage
        _getTaskDataContract().__updateSubmitContent(taskId, GithubFixedURL, Note);
        _getTaskDataContract().__updateSubmitStatus(taskId, ITaskData.SubmitStatus.Pending);

        emit SubmissionEvent(taskId, user, "TaskReSubmitted");
    }

    /**
     * @notice Requests revision on a submission
     * @dev Only callable by task creator
     */
    function __requestRevision(
        uint256 taskId,
        string calldata Note,
        uint256 additionalDeadlineHours
    ) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        ITaskData.TaskSubmitData memory s = _getTaskDataContract().__getTaskSubmit(taskId);

        if (s.status != ITaskData.SubmitStatus.Pending) {
            revert SubmissionErr("InvalidStatus");
        }

        uint256 additionalSeconds = (additionalDeadlineHours * 1 hours);
        uint256 newDeadline = block.timestamp + additionalSeconds;
        uint256 newRevisionTime = s.revisionTime + 1;

        // SECURITY FIX H-3: Check max revisions BEFORE updating submission state
        if (newRevisionTime > t.maxRevision) {
            // Max revisions exceeded - auto-approve the task instead of requesting revision
            __approveTask(taskId);
            return;
        }

        // Update submission
        _getTaskDataContract().__updateSubmitStatus(taskId, ITaskData.SubmitStatus.RevisionNeeded);
        _getTaskDataContract().__updateSubmitContent(taskId, s.githubURL, Note);
        _getTaskDataContract().__updateSubmitRevision(taskId, newRevisionTime, newDeadline);
        _getTaskDataContract().__updateTaskDeadline(taskId, newDeadline, t.deadlineHours);

        // Apply reputation penalties
        // SECURITY FIX C-3: Remove dangerous __penaltyIsBiggerThanReputation guards
        // Safe subtraction is now handled in __revisionRep
        if (_getUsersContract().__isRegistered(t.member) && _getUsersContract().__isRegistered(t.creator)) {
            _getUsersContract().__revisionRep(t.member, t.creator);
        }

        emit SubmissionEvent(taskId, address(0), "RevisionRequested");
    }

    /**
     * @notice Approves a task submission
     * @dev Only callable by task creator, distributes rewards
     * @dev SECURITY FIX M-5: Implement fee collection mechanism
     */
    function __approveTask(uint256 taskId) public override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        ITaskData.TaskSubmitData memory s = _getTaskDataContract().__getTaskSubmit(taskId);

        if (t.status != ITaskData.TaskStatus.InProgres) {
            revert SubmissionErr("InvalidStatus");
        }
        if (s.status != ITaskData.SubmitStatus.Pending) {
            revert SubmissionErr("SubmissionError");
        }
        if (t.isRewardClaimed) {
            revert SubmissionErr("AlreadyClaimed");
        }

        // SECURITY FIX M-5: Implement fee collection
        uint256 feePercentage = _getDataContract().__getFeePercentage();
        uint256 feeAmount = (t.reward * feePercentage) / 100;
        uint256 memberReward = t.reward - feeAmount;
        
        uint256 memberGet = memberReward + t.memberStake;
        uint256 creatorGet = t.creatorStake;

        // Update task flags and status
        _getTaskDataContract().__updateTaskFlags(taskId, false, false, true);
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.Completed);

        // Clear submission data
        ITaskData.TaskSubmitData memory emptySubmit = ITaskData.TaskSubmitData({
            githubURL: "",
            note: "",
            sender: address(0),
            status: ITaskData.SubmitStatus.NoneStatus,
            revisionTime: 0,
            newDeadline: 0
        });
        _getTaskDataContract().__setTaskSubmit(taskId, emptySubmit);

        // Distribute rewards (minus fees)
        _getUsersContract().__addUserBalance(t.member, memberGet);
        _getUsersContract().__addUserBalance(t.creator, creatorGet);
        
        // Collect fees for protocol
        if (feeAmount > 0) {
            _getTaskDataContract().__increaseFee(feeAmount);
        }

        // Update reputation
        if (_getUsersContract().__isRegistered(t.member) && _getUsersContract().__isRegistered(t.creator)) {
            _getUsersContract().__taskAcceptRep(t.member, t.creator);
        }

        _getUsersContract().__taskCompleteCounter(t.member, t.creator);

        emit SubmissionEvent(taskId, address(0), "TaskApproved");
    }

    // =============================================================
    // INTERNAL ADDRESS REGISTRY
    // =============================================================

    /**
     * @notice Change address registry reference and called in controller
     */
    function __changeAddressRegistry(address newAddress) external override ctcCall {
        if (newAddress == address(0)) {
            revert SubmissionErr("ZeroAddress");
        }
        addressRegistry = IAddressRegistry(newAddress);
        emit SubmissionEvent(0, newAddress, "addressRegistryUpdated");
    }
}
