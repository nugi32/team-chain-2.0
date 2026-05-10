// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "../../system/interfaces/taskCTCcall/ITaskData.sol";
import "../../system/interfaces/taskCTCcall/ICancellationLogic.sol";
import "../../system/interfaces/IAddressRegistry.sol";
import "../../system/interfaces/CTCcall/IUsers.sol";
import "../../system/interfaces/IDataContract.sol";

/**
 * @title CancellationLogic
 * @notice Handles task cancellations and deadline triggers
 * @dev Stateless logic contract - all state access via CTC calls to taskData
 */
contract CancellationLogic is ICancellationLogic {
    // =============================================================
    // STATE VARIABLES
    // =============================================================
    IAddressRegistry public addressRegistry;

    modifier ctcCall() {
        if(msg.sender != addressRegistry.__taskComponentsAddr().taskControler) revert CancellationErr("UnauthorizedCaller");
        _;
        
    }

    // =============================================================
    // INITIALIZATION
    // =============================================================
    constructor(address _addressRegistry) {
        if (_addressRegistry == address(0)) {
            revert CancellationErr("ZeroAddress");
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
    // CANCELLATION FUNCTIONS
    // =============================================================

    /**
     * @notice Cancels a task by either creator or member
     * @dev Applies penalties and returns remaining funds
     */
    function __cancelByMe(uint256 taskId, address user) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);

        if (user != t.creator && user != t.member) {
            revert CancellationErr("NotCounterparty");
        }
        if (t.status != ITaskData.TaskStatus.InProgres) {
            revert CancellationErr("InvalidStatus");
        }

        if (user == t.member) {
            // Member cancels: member pays penalty to creator
            uint256 penaltyToCreator = (t.memberStake * _getDataContract().__getNegPenalty()) / 100;
            uint256 memberReturn = (t.memberStake * (100 - _getDataContract().__getNegPenalty())) / 100;

            _getUsersContract().__addUserBalance(t.creator, t.creatorStake + t.reward + penaltyToCreator);
            _getUsersContract().__addUserBalance(t.member, memberReturn);
        } else {
            // Creator cancels: creator pays penalty to member
            if (t.member == address(0)) {
                revert CancellationErr("NoMemberAssigned");
            }

            uint256 penaltyToMember = (t.creatorStake * _getDataContract().__getNegPenalty()) / 100;
            uint256 creatorReturn = (t.creatorStake * (100 - _getDataContract().__getNegPenalty())) / 100 + t.reward;

            _getUsersContract().__addUserBalance(t.member, t.memberStake + penaltyToMember);
            _getUsersContract().__addUserBalance(t.creator, creatorReturn);
        }

        // Update task state
        _getTaskDataContract().__updateTaskFlags(taskId, false, false, t.isRewardClaimed);
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.Cancelled);

        // Update reputation
        _getUsersContract().__cancelByMeRep(t.member);
        _getUsersContract().__cancelByMeRep(t.creator);
        _getUsersContract().__taskFailCounter(t.member, t.creator);

        emit CancellationEvent(taskId, user, "TaskCancelledByMe");
    }

    /**
     * @notice Triggers deadline consequence if task not completed
     * @dev Penalties applied if deadline exceeded with pending submission
     */
    function __triggerDeadline(uint256 taskId) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        ITaskData.TaskSubmitData memory s = _getTaskDataContract().__getTaskSubmit(taskId);

        if (s.status == ITaskData.SubmitStatus.Pending) {
            revert CancellationErr("SubmissionError");
        }
        if (t.status != ITaskData.TaskStatus.InProgres) {
            revert CancellationErr("InvalidStatus");
        }
        if (t.deadlineAt == 0) {
            revert CancellationErr("InvalidDeadline");
        }
        if (block.timestamp < t.deadlineAt) {
            revert CancellationErr("DeadlineNotExceeded");
        }

        // Distribute penalties
        if (t.member != address(0) && t.memberStake > 0) {
            uint256 toMember = (t.memberStake * _getDataContract().__getNegPenalty()) / 100;
            uint256 toCreator = (t.memberStake * (100 - _getDataContract().__getNegPenalty())) / 100;

            _getUsersContract().__addUserBalance(t.member, toMember);
            _getUsersContract().__addUserBalance(t.creator, toCreator + t.creatorStake + t.reward);
        } else {
            _getUsersContract().__addUserBalance(t.creator, t.creatorStake + t.reward);
        }

        // Update task state
        _getTaskDataContract().__updateTaskFlags(taskId, false, false, t.isRewardClaimed);
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.Cancelled);

        // Apply reputation penalties
        if (_getUsersContract().__isRegistered(t.member) && _getUsersContract().__isRegistered(t.creator)) {
            uint256 memberRep = _getUsersContract().__getUserReputation(t.member);
            uint256 creatorRep = _getUsersContract().__getUserReputation(t.creator);

            if (creatorRep < _getDataContract().__getDeadlineHitCreator()) {
                _getUsersContract().__penaltyIsBiggerThanReputation(t.creator);
            }
            if (memberRep < _getDataContract().__getDeadlineHitMember()) {
                _getUsersContract().__penaltyIsBiggerThanReputation(t.member);
            }

            _getUsersContract().__deadlineHitRep(t.member, t.creator);
        }

        _getUsersContract().__taskFailCounter(t.creator, t.member);

        emit CancellationEvent(taskId, address(0), "DeadlineTriggered");
    }

    // =============================================================
    // INTERNAL ADDRESS REGISTRY
    // =============================================================

    /**
     * @notice Change address registry reference and called in controller
     */
    function __changeAddressRegistry(address newAddress) external override ctcCall {
        if (newAddress == address(0)) {
            revert CancellationErr("ZeroAddress");
        }
        addressRegistry = IAddressRegistry(newAddress);
        emit CancellationEvent(0, newAddress, "addressRegistryUpdated");
    }
}
