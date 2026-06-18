// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "../../system/interfaces/taskCTCcall/ITaskData.sol";
import "../../system/interfaces/taskCTCcall/ITaskLifecycleLogic.sol";
import "../../system/interfaces/IAddressRegistry.sol";
import "../../system/interfaces/CTCcall/IUsers.sol";
import "../../system/interfaces/IDataContract.sol";

/**
 * @title TaskLifecycleLogic
 * @notice Handles task creation, deletion, activation, and registration management
 * @dev Stateless logic contract - all state access via CTC calls to taskData
 */
contract TaskLifecycleLogic is ITaskLifecycleLogic {
    // =============================================================
    // STATE VARIABLES
    // =============================================================
    IAddressRegistry public addressRegistry;

    modifier ctcCall() {
        if (msg.sender != addressRegistry.__taskComponentsAddr().taskControler)
            revert TaskLifecycleErr("UnauthorizedCaller");
        _;
    }

    // =============================================================
    // INITIALIZATION
    // =============================================================
    constructor(address _addressRegistry) {
        if (_addressRegistry == address(0)) {
            revert TaskLifecycleErr("ZeroAddress");
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
    // TASK LIFECYCLE FUNCTIONS
    // =============================================================

    /**
     * @notice Creates a new task
     * @dev Only callable from TaskController via CTC
     * @dev SECURITY FIX C-1: Deduct reward from user balance, not from msg.value
     * @dev SECURITY FIX NEW-M-2: Validate reward amount to prevent spam
     */
    function __createTask(
        string memory _Title,
        string memory _GithubURL,
        uint128 _DeadlineHours,
        uint128 _MaximumRevision,
        uint256 _rewardAmount,
        address _user
    ) external override ctcCall returns (uint256 taskId) {
        // SECURITY FIX NEW-M-2: Enforce minimum reward value
        if (_rewardAmount == 0) {
            revert TaskLifecycleErr("ZeroReward");
        }

        (uint256 _taskCounter, ) = _getTaskDataContract().__getGlobalState();
        taskId = _taskCounter;

        // SECURITY FIX C-1: Check user has enough balance for reward
        uint256 userBalance = _getUsersContract().__getUserBalance(_user);
        if (userBalance < _rewardAmount) {
            revert TaskLifecycleErr("InsufficientReward");
        }

        // SECURITY FIX C-1: Deduct reward from user's balance (stored in UsersContract vault)
        _getUsersContract().__takeUserBalance(_user, _rewardAmount);

        uint256 projectValue = ___getProjectValue(_DeadlineHours, _MaximumRevision, _rewardAmount, _user);

        ITaskData.TaskData memory newTask = ITaskData.TaskData({
            status: ITaskData.TaskStatus.Created,
            taskId: taskId,
            value: projectValue,
            reward: _rewardAmount,
            deadlineAt: 0,
            createdAt: block.timestamp,
            creatorStake: 0,
            memberStake: 0,
            maxRevision: _MaximumRevision,
            deadlineHours: _DeadlineHours,
            creator: _user,
            member: address(0),
            title: _Title,
            githubURL: _GithubURL,
            isMemberStakeLocked: false,
            isCreatorStakeLocked: false,
            isRewardClaimed: false,
            exists: true
        });

        _getTaskDataContract().__createTask(newTask);
        _getUsersContract().__taskCreateCounter(_user);

        emit TaskLifecycleEvent(taskId, _user, "TaskCreated");

        return taskId;
    }

    /**
     * @notice Deletes a task
     * @dev Only callable by task creator
     * @dev SECURITY FIX H-1, H-2: Cannot delete tasks with assigned members due to ctcCall routing
     * @dev Cross-module calls violate ctcCall invariant - member cancellations must route through TaskController
     */
    function __deleteTask(uint256 _taskId, address _user) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(_taskId);

        if (t.member != address(0)) {
            // SECURITY FIX H-1: Cannot directly call CancellationLogic here
            // The ctcCall modifier in CancellationLogic checks msg.sender == taskControler
            // but msg.sender here is taskLifecycleModule, causing the call to revert
            // Solution: Require deletion via TaskController.cancelByMe() instead
            revert TaskLifecycleErr("CannotDeleteTaskWithMember");
        } else {
            // SECURITY FIX H-2: Refund all pending join request stakes before deletion
            ITaskData.JoinRequestData[] memory requests = _getTaskDataContract().__getJoinRequests(_taskId);
            for (uint256 i = 0; i < requests.length; i++) {
                if (requests[i].isPending && !requests[i].hasWithdrawn) {
                    _getUsersContract().__addUserBalance(requests[i].applicant, requests[i].stakeAmount);
                }
            }
            
            // Return creator's funds if no member assigned
            _getUsersContract().__addUserBalance(_user, t.reward);
            if (t.creatorStake > 0) {
                _getUsersContract().__addUserBalance(_user, t.creatorStake);
            }
            
            // Update task status to Cancelled
            _getTaskDataContract().__updateTaskStatus(_taskId, ITaskData.TaskStatus.Cancelled);
            _getTaskDataContract().__updateTaskFlags(_taskId, false, false, t.isRewardClaimed);
        }

        emit TaskLifecycleEvent(_taskId, _user, "TaskDeleted");
    }

    /**
     * @notice Activates a task by requiring creator stake
     * @dev Creator must provide stake amount based on task parameters
     * @dev SECURITY FIX H-5: Ensure task is in Created status before activation
     * @dev SECURITY FIX C-1: ETH is now pre-deposited in UsersContract, don't expect msg.value
     */
    function __activateTask(uint256 taskId, address user) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);

        // SECURITY FIX H-5: Check that task is in Created status to prevent repeated activation
        if (t.status != ITaskData.TaskStatus.Created) {
            revert TaskLifecycleErr("InvalidStatus");
        }

        uint256 requiredStake = ___getCreatorStake(t.deadlineHours, t.maxRevision, t.reward, user);

        uint256 userBalance = _getUsersContract().__getUserBalance(user);
        
        // SECURITY FIX C-1: No msg.value to add - all ETH is already in UsersContract balance
        if (userBalance < requiredStake) {
            revert TaskLifecycleErr("InsufficientStake");
        }

        // Deduct required stake from user's balance
        _getUsersContract().__takeUserBalance(user, requiredStake);

        _getTaskDataContract().__updateTaskFinancials(taskId, t.value, t.reward, requiredStake, t.memberStake);
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.Active);
        _getTaskDataContract().__updateTaskFlags(taskId, t.isMemberStakeLocked, true, t.isRewardClaimed);

        emit TaskLifecycleEvent(taskId, user, "TaskActive");
    }

    /**
     * @notice Opens registration for task
     * @dev Only callable by task creator
     */
    function __openRegistration(uint256 taskId) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        if (t.status != ITaskData.TaskStatus.Active) {
            revert TaskLifecycleErr("TaskNotOpen");
        }
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.OpenRegistration);
        emit TaskLifecycleEvent(taskId, t.creator, "RegistrationOpened");
    }

    /**
     * @notice Closes registration for task
     * @dev Only callable by task creator
     */
    function __closeRegistration(uint256 taskId) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        if (t.status != ITaskData.TaskStatus.OpenRegistration) {
            revert TaskLifecycleErr("TaskNotOpen");
        }
        _getTaskDataContract().__updateTaskStatus(taskId, ITaskData.TaskStatus.Active);
        emit TaskLifecycleEvent(taskId, t.creator, "RegistrationClosed");
    }

    // =============================================================
    // INTERNAL VIEW FUNCTIONS
    // =============================================================

    /**
     * @notice Calculates required creator stake
     */
    function ___getCreatorStake(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view override returns (uint256) {
        uint256 category = ___getProjectValue(DeadlineHours, MaximumRevision, rewardWei, Caller);
        return (category * _getDataContract().__getCreatorStakeFromProjectValuePercentage()) / 100;
    }

    /**
     * @notice Calculates project value based on task parameters and user reputation
     */
    function ___getProjectValue(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view override returns (uint256) {
        uint256 rewardEtherUnits = rewardWei / 1 ether;

        IUsers users = IUsers(addressRegistry.__usersContract());

        uint256 pos = (_getDataContract().__getRewardScore() * rewardEtherUnits) +
            (_getDataContract().__getRevisionScore() * MaximumRevision);

        uint256 neg = (_getDataContract().__getReputationScore() * users.__getUserReputation(Caller)) +
            (_getDataContract().__getDeadlineScore() * DeadlineHours);

        // Use ratio-based calculation: higher neg scales down value gracefully instead of zeroing it
        uint256 rawValue = (pos > neg) ? (pos - neg) : (pos * 100) / (neg / (1 ether) + 1);

        return (rawValue * 1 ether) / 100;
    }

    // =============================================================
    // INTERNAL ADDRESS REGISTRY
    // =============================================================

    /**
     * @notice Change address registry reference and called in controller
     */
    function __changeAddressRegistry(address newAddress) external override ctcCall {
        if (newAddress == address(0)) {
            revert TaskLifecycleErr("ZeroAddress");
        }
        addressRegistry = IAddressRegistry(newAddress);
        emit TaskLifecycleEvent(0, newAddress, "addressRegistryUpdated");
    }
}

interface ICancellationLogic {
    function __cancelByMe(uint256 taskId, address user) external;
}
