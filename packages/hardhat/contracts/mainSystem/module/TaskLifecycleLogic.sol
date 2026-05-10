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
        if(msg.sender != addressRegistry.__taskComponentsAddr().taskControler) revert TaskLifecycleErr("UnauthorizedCaller");
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
     */
    function __createTask(
        string memory _Title,
        string memory _GithubURL,
        uint128 _DeadlineHours,
        uint128 _MaximumRevision,
        address _user
    ) external payable override ctcCall returns (uint256 taskId) {
        (uint256 _taskCounter, ) = _getTaskDataContract().__getGlobalState();
        taskId = _taskCounter;

        uint256 projectValue = ___getProjectValue(
            _DeadlineHours,
            _MaximumRevision,
            msg.value,
            _user
        );

        ITaskData.TaskData memory newTask = ITaskData.TaskData({
            status: ITaskData.TaskStatus.Created,
            taskId: taskId,
            value: projectValue,
            reward: msg.value,
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
     */
    function __deleteTask(uint256 _taskId, address _user) external override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(_taskId);

        _getTaskDataContract().__updateTaskStatus(_taskId, ITaskData.TaskStatus.Cancelled);
        _getTaskDataContract().__updateTaskFlags(_taskId, false, false, t.isRewardClaimed);

        if (t.member != address(0)) {
            // If member assigned, cancel task with penalty logic
            ICancellationLogic(addressRegistry.__taskComponentsAddr().cancelModule).__cancelByMe(_taskId, _user);
        } else {
            // Return funds if no member assigned
            _getUsersContract().__addUserBalance(_user, t.reward);
            if (t.creatorStake > 0) {
                _getUsersContract().__addUserBalance(_user, t.creatorStake);
            }
        }

        emit TaskLifecycleEvent(_taskId, _user, "TaskDeleted");
    }

    /**
     * @notice Activates a task by requiring creator stake
     * @dev Creator must provide stake amount based on task parameters
     */
    function __activateTask(uint256 taskId, address user) external payable override ctcCall {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);

        uint256 requiredStake = ___getCreatorStake(
            t.deadlineHours,
            t.maxRevision,
            t.reward,
            user
        );

        uint256 userBalance = _getUsersContract().__getUserBalance(user);
        uint256 fromBalance = userBalance >= requiredStake ? requiredStake : userBalance;
        uint256 remaining = requiredStake - fromBalance;

        if (msg.value < remaining) {
            revert TaskLifecycleErr("InsufficientStake");
        }

        // Deduct from internal balance
        if (fromBalance > 0) {
            _getUsersContract().__takeUserBalance(user, fromBalance);
        }

        // Refund excess ETH
        if (msg.value > remaining) {
            _getUsersContract().__addUserBalance(user, msg.value - remaining);
        }

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

        uint256 rawValue = (pos <= neg) ? 0 : (pos - neg);

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
