// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "../../system/interfaces/taskCTCcall/ITaskData.sol";
import "../../system/interfaces/taskCTCcall/IJoinRequestLogic.sol";
import "../../system/interfaces/IAddressRegistry.sol";
import "../../system/interfaces/CTCcall/IUsers.sol";
import "../../system/interfaces/IDataContract.sol";

/**
 * @title JoinRequestLogic
 * @notice Handles task join requests, approvals, and rejections
 * @dev Stateless logic contract - all state access via CTC calls to taskData
 */
contract JoinRequestLogic is IJoinRequestLogic {
    // =============================================================
    // STATE VARIABLES
    // =============================================================
    IAddressRegistry public addressRegistry;

    modifier ctcCall() {
        if(msg.sender != addressRegistry.__taskComponentsAddr().taskControler) revert JoinRequestErr("UnauthorizedCaller");
        _;
        
    }

    // =============================================================
    // INITIALIZATION
    // =============================================================
    constructor(address _addressRegistry) {
        if (_addressRegistry == address(0)) {
            revert JoinRequestErr("ZeroAddress");
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


    // =============================================================
    // JOIN REQUEST FUNCTIONS
    // =============================================================

    /**
     * @notice Requests to join a task with stake
     * @dev Validates task status and user eligibility
     */
    function __requestJoinTask(uint256 taskId, address user) external payable override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);

        if (t.status != ITaskData.TaskStatus.OpenRegistration) {
            revert JoinRequestErr("InvalidStatus");
        }

        if (user == t.creator) {
            revert JoinRequestErr("CannotJoinOwnTask");
        }

        // Calculate required stake
        uint256 requiredStake = (t.reward *
            _getDataContract().__getMemberStakeFromRewardPercentage()) / 100;

        // Check for existing pending request - O(1) lookup
        if (_getTaskDataContract().__hasPendingRequest(taskId, user)) {
            revert JoinRequestErr("AlreadyRequested");
        }

        uint256 userBalance = _getUsersContract().__getUserBalance(user);
        uint256 fromBalance = userBalance >= requiredStake ? requiredStake : userBalance;
        uint256 remaining = requiredStake - fromBalance;

        if (msg.value < remaining) {
            revert JoinRequestErr("InsufficientStake");
        }

        // Deduct from internal balance
        if (fromBalance > 0) {
            _getUsersContract().__takeUserBalance(user, fromBalance);
        }

        // Refund excess ETH
        if (msg.value > remaining) {
            payable(msg.sender).transfer(msg.value - remaining);
        }

        ITaskData.JoinRequestData memory newRequest = ITaskData.JoinRequestData({
            applicant: user,
            stakeAmount: requiredStake,
            status: ITaskData.UserTask.Request,
            isPending: true,
            hasWithdrawn: false
        });

        _getTaskDataContract().__addJoinRequest(taskId, newRequest);

        emit JoinRequestEvent(taskId, user, "JoinRequested");
    }

    /**
     * @notice Withdraws a pending join request
     * @dev Returns stake to user
     */
    function __withdrawJoinRequest(uint256 taskId, address user) external override ctcCall {
        // Get request data using O(1) lookup
        ITaskData.JoinRequestData memory request = _getTaskDataContract().__getJoinRequestByUser(taskId, user);
        
        if (!request.isPending || request.hasWithdrawn) {
            revert JoinRequestErr("NoPendingRequest");
        }

        uint256 index = _getTaskDataContract().joinRequestIndex(taskId, user);
        uint256 stake = request.stakeAmount;

        _getTaskDataContract().__updateJoinRequestStatus(taskId, index, ITaskData.UserTask.Cancelled);
        _getTaskDataContract().__updateJoinRequestFlags(taskId, index, false, true);

        _getUsersContract().__addUserBalance(user, stake);

        emit JoinRequestEvent(taskId, user, "JoinrequestCancelled");
    }

    /**
     * @notice Approves a join request
     * @dev Only callable by task creator, transitions task to InProgress
     */
    function __approveJoinRequest(uint256 taskId, address applicant) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        
        // Get request data using O(1) lookup
        ITaskData.JoinRequestData memory request = _getTaskDataContract().__getJoinRequestByUser(taskId, applicant);
        
        if (!request.isPending) {
            revert JoinRequestErr("NoPendingRequest");
        }

        uint256 index = _getTaskDataContract().joinRequestIndex(taskId, applicant);
        uint256 stakeAmount = request.stakeAmount;

        // Update join request
        _getTaskDataContract().__updateJoinRequestStatus(taskId, index, ITaskData.UserTask.Accepted);
        _getTaskDataContract().__updateJoinRequestFlags(taskId, index, false, true);

        // Update task with member info
        _getTaskDataContract().__updateTaskParticipants(taskId, t.creator, applicant);
        _getTaskDataContract().__updateTaskFinancials(taskId, t.value, t.reward, t.creatorStake, stakeAmount);
        _getTaskDataContract().__updateTaskFlags(taskId, true, t.isCreatorStakeLocked, t.isRewardClaimed);

        // Set deadline
        uint256 newDeadline = block.timestamp + (uint256(t.deadlineHours) * 1 hours);
        _getTaskDataContract().__updateTaskDeadline(taskId, newDeadline, t.deadlineHours);
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.InProgres);

        emit JoinRequestEvent(taskId, applicant, "JoinApproved");
    }

    /**
     * @notice Rejects a join request
     * @dev Only callable by task creator, returns stake to applicant
     */
    function __rejectJoinRequest(uint256 taskId, address _applicant) external override ctcCall {
        // Get request data using O(1) lookup
        ITaskData.JoinRequestData memory request = _getTaskDataContract().__getJoinRequestByUser(taskId, _applicant);
        
        if (!request.isPending) {
            revert JoinRequestErr("NoPendingRequest");
        }

        uint256 index = _getTaskDataContract().joinRequestIndex(taskId, _applicant);
        uint256 stake = request.stakeAmount;

        _getTaskDataContract().__updateJoinRequestStatus(taskId, index, ITaskData.UserTask.Rejected);
        _getTaskDataContract().__updateJoinRequestFlags(taskId, index, false, true);

        _getUsersContract().__addUserBalance(_applicant, stake);

        emit JoinRequestEvent(taskId, _applicant, "JoinRejected");
    }

    // =============================================================
    // INTERNAL ADDRESS REGISTRY
    // =============================================================

    /**
     * @notice Change address registry reference and called in controller
     */
    function __changeAddressRegistry(address newAddress) external override ctcCall {
        if (newAddress == address(0)) {
            revert JoinRequestErr("ZeroAddress");
        }
        addressRegistry = IAddressRegistry(newAddress);
        emit JoinRequestEvent(0, newAddress, "addressRegistryUpdated");
    }
}
