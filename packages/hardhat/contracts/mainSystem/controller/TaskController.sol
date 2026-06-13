// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "../../system/utils/addressUtils.sol";
import "../../system/utils/ReentrancyGuard.sol";
import "../../Pipe/AccesControlPipes.sol";
import "../../system/interfaces/taskCTCcall/ITaskController.sol";
import "../../system/interfaces/taskCTCcall/ITaskData.sol";
import "../../system/interfaces/taskCTCcall/ITaskLifecycleLogic.sol";
import "../../system/interfaces/taskCTCcall/IJoinRequestLogic.sol";
import "../../system/interfaces/taskCTCcall/ISubmissionLogic.sol";
import "../../system/interfaces/taskCTCcall/ICancellationLogic.sol";
import "../../system/interfaces/IAddressRegistry.sol";
import "../../system/interfaces/CTCcall/IUsers.sol";
import "../../system/interfaces/IDataContract.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title TaskController
 * @notice Main entry point for task system - routes to logic contracts
 * @dev Handles access control, pausable, reentrancy protection, and call aggregation
 */
contract TaskController is
    ITaskController,
    AddressUtils,
    Initializable,
    UUPSUpgradeable,
    PausableUpgradeable,
    MainAccesControlPipes,
    SystemReentrancyGuard
{
    // =============================================================
    // STATE VARIABLES
    // =============================================================

    IAddressRegistry public addressRegistry;

    uint256[40] private ___gap;

    // =============================================================
    // EVENTS
    // =============================================================
    event ControllerEvent(string eventName, uint256 indexed taskId, address indexed user);

    // =============================================================
    // ERRORS
    // =============================================================
    error systemError(string errName);
    error MainContractErr(string errName);

    // =============================================================
    // Helper functions to get logic contract instances
    // =============================================================

    function _getTaskDataContract() internal view returns (ITaskData) {
        return ITaskData(addressRegistry.__taskComponentsAddr().dataContract);
    }

    function _getTaskLifecycleLogicContract() internal view returns (ITaskLifecycleLogic) {
        return ITaskLifecycleLogic(addressRegistry.__taskComponentsAddr().taskLifecycleModule);
    }

    function _getTaskJoinRequestContract() internal view returns (IJoinRequestLogic) {
        return IJoinRequestLogic(addressRegistry.__taskComponentsAddr().joinModule);
    }

    function _getTaskSubmissionContract() internal view returns (ISubmissionLogic) {
        return ISubmissionLogic(addressRegistry.__taskComponentsAddr().submisionModule);
    }

    function _getTaskCancellationContract() internal view returns (ICancellationLogic) {
        return ICancellationLogic(addressRegistry.__taskComponentsAddr().cancelModule);
    }


    // =============================================================
    // MODIFIERS
    // =============================================================

    modifier taskExists(uint256 _taskId) {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(_taskId);
        if (!t.exists) revert systemError("TaskDoesNotExist");
        _;
    }

    modifier onlyTaskCreator(uint256 _taskId) {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(_taskId);
        if (t.creator != msg.sender) revert systemError("NotTaskCreator");
        _;
    }

    modifier onlyTaskMember(uint256 _taskId) {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(_taskId);
        if (t.member != msg.sender) revert systemError("NotTaskMember");
        _;
    }

    modifier onlyRegistered() {
        if (!IUsers(addressRegistry.__usersContract()).__isRegistered(msg.sender)) {
            revert systemError("NotRegistered");
        }
        _;
    }

    modifier onlyOwner {
        __onlyOwner(addressRegistry.__accessControlContract());
        _;
    }

    modifier onlyUser() {
        __onlyUser(addressRegistry.__accessControlContract());  
        _;
    }


    // =============================================================
    // INITIALIZATION
    // =============================================================

    /**
     * @notice Initializes the TaskController with all logic contract addresses
     */
    function initialize(
        address _registryAddress
    ) public initializer {
        if (_registryAddress == address(0)) revert systemError("ZeroAddress");

        __ReentrancyGuard_init();
        __Pausable_init();

        addressRegistry = IAddressRegistry(_registryAddress);
    }

    // =============================================================
    // TASK LIFECYCLE FUNCTIONS
    // =============================================================

    /**
     * @notice Creates a new task
     */
    function createTask(
        string memory _Title,
        string memory _GithubURL,
        uint128 _DeadlineHours,
        uint128 _MaximumRevision,
        address _user
    ) external payable override whenNotPaused onlyRegistered nonReentrant onlyUser {
        _getTaskLifecycleLogicContract().__createTask{value: msg.value}(
            _Title,
            _GithubURL,
            _DeadlineHours,
            _MaximumRevision,
            _user
        );
        emit ControllerEvent("TaskCreated", 0, _user);
    }

    /**
     * @notice Deletes a task
     */
    function deleteTask(uint256 _taskId, address _user)
        external
        override
        nonReentrant
        onlyTaskCreator(_taskId)
        onlyRegistered
    {
        _getTaskLifecycleLogicContract().__deleteTask(_taskId, _user);
        emit ControllerEvent("TaskDeleted", _taskId, _user);
    }

    /**
     * @notice Activates a task by providing creator stake
     */
    function activateTask(uint256 taskId, address user)
        external
        payable
        override
        taskExists(taskId)
        onlyTaskCreator(taskId)
        nonReentrant
        whenNotPaused
    {
        _getTaskLifecycleLogicContract().__activateTask{value: msg.value}(taskId, user);
        emit ControllerEvent("TaskActive", taskId, user);
    }

    /**
     * @notice Opens registration for task
     */
    function openRegistration(uint256 taskId)
        external
        override
        taskExists(taskId)
        onlyTaskCreator(taskId)
        whenNotPaused
    {
        _getTaskLifecycleLogicContract().__openRegistration(taskId);
        emit ControllerEvent("RegistrationOpened", taskId, msg.sender);
    }

    /**
     * @notice Closes registration for task
     */
    function closeRegistration(uint256 taskId)
        external
        override
        taskExists(taskId)
        onlyTaskCreator(taskId)
        whenNotPaused
    {
        _getTaskLifecycleLogicContract().__closeRegistration(taskId);
        emit ControllerEvent("RegistrationClosed", taskId, msg.sender);
    }

    // =============================================================
    // JOIN REQUEST FUNCTIONS
    // =============================================================

    /**
     * @notice Requests to join a task
     */
    function requestJoinTask(uint256 taskId, address user)
        external
        payable
        override
        taskExists(taskId)
        whenNotPaused
        onlyRegistered
        onlyUser
    {
        _getTaskJoinRequestContract().__requestJoinTask{value: msg.value}(taskId, user);
        emit ControllerEvent("JoinRequested", taskId, user);
    }

    /**
     * @notice Withdraws a pending join request
     */
    function withdrawJoinRequest(uint256 taskId, address user)
        external
        override
        nonReentrant
        onlyRegistered
    {
        _getTaskJoinRequestContract().__withdrawJoinRequest(taskId, user);
        emit ControllerEvent("JoinrequestCancelled", taskId, user);
    }

    /**
     * @notice Approves a join request
     */
    function approveJoinRequest(uint256 taskId, address applicant)
        external
        override
        taskExists(taskId)
        onlyTaskCreator(taskId)
        nonReentrant
        whenNotPaused
    {
        _getTaskJoinRequestContract().__approveJoinRequest(taskId, applicant);
        emit ControllerEvent("JoinApproved", taskId, applicant);
    }

    /**
     * @notice Rejects a join request
     */
    function rejectJoinRequest(uint256 taskId, address _applicant)
        external
        override
        taskExists(taskId)
        onlyTaskCreator(taskId)
        nonReentrant
        whenNotPaused
    {
        _getTaskJoinRequestContract().__rejectJoinRequest(taskId, _applicant);
        emit ControllerEvent("JoinRejected", taskId, _applicant);
    }

    // =============================================================
    // SUBMISSION FUNCTIONS
    // =============================================================

    /**
     * @notice Submits a task for review
     */
    function requestSubmitTask(
        uint256 taskId,
        string calldata PullRequestURL,
        string calldata Note,
        address user
    )
        external
        override
        taskExists(taskId)
        onlyTaskMember(taskId)
        whenNotPaused
        onlyUser
    {
        _getTaskSubmissionContract().__requestSubmitTask(taskId, PullRequestURL, Note, user);
        emit ControllerEvent("TaskSubmitted", taskId, user);
    }

    /**
     * @notice Resubmits a task after revision
     */
    function reSubmitTask(
        uint256 taskId,
        string calldata Note,
        string calldata GithubFixedURL,
        address user
    )
        external
        override
        taskExists(taskId)
        onlyTaskMember(taskId)
        whenNotPaused
        onlyUser {
        _getTaskSubmissionContract().__reSubmitTask(taskId, Note, GithubFixedURL, user);
        emit ControllerEvent("TaskReSubmitted", taskId, user);
    }

    /**
     * @notice Requests revision on a submission
     */
    function requestRevision(
        uint256 taskId,
        string calldata Note,
        uint256 additionalDeadlineHours
    ) external override whenNotPaused {
        _getTaskSubmissionContract().__requestRevision(taskId, Note, additionalDeadlineHours);
        emit ControllerEvent("RevisionRequested", taskId, msg.sender);
    }

    /**
     * @notice Approves a task submission
     */
    function approveTask(uint256 taskId)
        external
        override
        taskExists(taskId)
        onlyTaskCreator(taskId)
        nonReentrant
        whenNotPaused
    {
        _getTaskSubmissionContract().__approveTask(taskId);
        emit ControllerEvent("TaskApproved", taskId, msg.sender);
    }

    // =============================================================
    // CANCELLATION FUNCTIONS
    // =============================================================

    /**
     * @notice Cancels a task by creator or member
     */
    function cancelByMe(uint256 taskId, address user)
        external
        override
        taskExists(taskId)
        nonReentrant
        onlyUser
        whenNotPaused
    {
        _getTaskCancellationContract().__cancelByMe(taskId, user);
        emit ControllerEvent("TaskCancelledByMe", taskId, user);
    }

    /**
     * @notice Triggers deadline consequence
     */
    function triggerDeadline(uint256 taskId)
        external
        override
        taskExists(taskId)
        whenNotPaused
        nonReentrant
    {
        _getTaskCancellationContract().__triggerDeadline(taskId);
        emit ControllerEvent("DeadlineTriggered", taskId, msg.sender);
    }

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================

    /**
     * @notice Gets join request count for task
     */
    function getJoinRequestCount(uint256 taskId)
        external
        view
        override
        returns (uint256)
    {
        return _getTaskDataContract().__getJoinRequestCount(taskId);
    }

    /**
     * @notice Gets required member stake for task
     */
    function getMemberRequiredStake(uint256 taskId)
        public
        view
        override
        taskExists(taskId)
        returns (uint256)
    {
        ITaskData.TaskData memory t = _getTaskDataContract().__getTask(taskId);
        return (t.reward *
            IDataContract(addressRegistry.__dataContract()).__getMemberStakeFromRewardPercentage()) / 100;
    }

    /**
     * @notice Calculates required creator stake
     */
    function ___getCreatorStake(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view override returns (uint256) {
        return _getTaskLifecycleLogicContract().___getCreatorStake(
            DeadlineHours,
            MaximumRevision,
            rewardWei,
            Caller
        );
    }

    /**
     * @notice Calculates project value
     */
    function ___getProjectValue(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view override returns (uint256) {
        return _getTaskLifecycleLogicContract().___getProjectValue(
            DeadlineHours,
            MaximumRevision,
            rewardWei,
            Caller
        );
    }

    // =============================================================
    // OWNER FUNCTIONS
    // =============================================================

    /**
     * @notice Withdraws accumulated protocol fees
     */
    function withdrawToSystemWallet()
        external
        onlyOwner
        nonReentrant
        whenNotPaused
    {
        (uint256 feeCollected, ) = _getTaskDataContract().__getGlobalState();
        if (feeCollected > 0) {
            _getTaskDataContract().__decreaseFee(feeCollected);
            (bool ok, ) = addressRegistry.__walletContract().call{value: feeCollected}("");
            if (!ok) revert systemError("WithdrawFailed");
        }
    }

    /**
     * @notice Change address registry
     */
    function __changeControllerAndModuleAddressRegistry(address newAddress) external override whenNotPaused onlyOwner{
        if (newAddress == address(0)) {
            revert systemError("ZeroAddress");
        }

        _getTaskLifecycleLogicContract().__changeAddressRegistry(newAddress);
        _getTaskJoinRequestContract().__changeAddressRegistry(newAddress);
        _getTaskSubmissionContract().__changeAddressRegistry(newAddress);
        _getTaskCancellationContract().__changeAddressRegistry(newAddress);

        addressRegistry = IAddressRegistry(newAddress);
        emit ControllerEvent("addressRegistryUpdated", 0, newAddress);
    }

    /**
     * @notice Pauses the contract
     */
    function pause(address caller)
        external
        onlyOwner
    {
        if (caller == address(0)) revert systemError("ZeroAddress");
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause(address caller)
        external
        onlyOwner
    {
        if (caller == address(0)) revert systemError("ZeroAddress");
        _unpause();
    }

    // =============================================================
    // FALLBACK FUNCTIONS
    // =============================================================

    receive() external payable {
        revert systemError("DirectEtherTransferNotAllowed");
    }

    fallback() external payable {
        revert systemError("FunctionNotFound");
    }

    // =============================================================
    // UPGRADE AUTHORIZATION
    // =============================================================

    function _authorizeUpgrade(address newImplementation)
        internal
        view
        override
        onlyOwner
        whenNotPaused
    {
        if (newImplementation == address(0)) revert systemError("ZeroAddress");
    }
}
