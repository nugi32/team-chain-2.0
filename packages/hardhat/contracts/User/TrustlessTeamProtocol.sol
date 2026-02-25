// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/utils/addressUtils.sol";
import "../system/utils/ReentrancyGuard.sol";
import "../Pipe/AccesControlPipes.sol";
import "../system/interfaces/IDataContract.sol";
import "../system/interfaces/IAddressRegistry.sol";
import "../system/interfaces/CTCcall/IUsers.sol";
import "../system/libraries/TaskLibrary.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


/**
 * @title TrustlessTeamProtocol v2 (Optimized with Library)
 * @author nugi
 * @notice Protocol to create tasks, allow registration/joining, staking and pull-pay reward flows with reputation.
 * @dev Upgradeable contract (UUPS). Uses library for major functions to reduce contract size.
 */
contract TrustlessTeamProtocol is
    systemAddressUtils, 
    Initializable, 
    UUPSUpgradeable, 
    PausableUpgradeable,
    MainAccesControlPipes, 
    SystemReentrancyGuard
{
    // =============================================================
    // USING LIBRARY FOR TYPES
    // =============================================================
    using TaskLibrary for *;

    // =============================================================
    // STATE VARIABLES (menggunakan struct dari library)
    // =============================================================

    /// @dev Task ID to submission mapping
    mapping(uint256 => TaskSubmitData) public TaskSubmits;

    /// @dev Task ID to Task mapping
    mapping(uint256 => TaskData) public Tasks;

    /// @dev Task ID to join requests array mapping
    mapping(uint256 => JoinRequestData[]) public joinRequests;

    /// @dev Sequential task counter
    uint256 public taskCounter;

    /// @dev Accumulated protocol fees
    uint256 public feeCollected;

    /// @dev Address registry contract
    IAddressRegistry public addressRegistry;

    /// @dev Storage gap for future upgrades
    uint256[40] private ___gap;

    // =============================================================
    // EVENTS
    // =============================================================
    event systemChangedEvent(string info, address indexed newAddress, uint256 indexed value);
    event userEvent(string info, uint256 indexed param1, address indexed param2, uint256 param3, uint256 param4, uint8 param5, string param6, uint128 param7);

    // =============================================================
    // ERRORS
    // =============================================================
    error systemError(string errName);
    error userError(string errName);

    // =============================================================
    // MODIFIERS
    // =============================================================

    /// @dev Verifies task exists
    modifier taskExists(uint256 _taskId) {
        if (!Tasks[_taskId].exists) revert systemError("TaskDoesNotExist");
        _;
    }

    /// @dev Restricts access to task creator only
    modifier onlyTaskCreator(uint256 _taskId) {
        if (Tasks[_taskId].creator != msg.sender) revert systemError("NotTaskCreator");
        _;
    }

    /// @dev Restricts access to task member only
    modifier onlyTaskMember(uint256 _taskId) {
        if (Tasks[_taskId].member != msg.sender) revert systemError("NotTaskMember");
        _;
    }

    /// @dev Requires user to be registered
    modifier onlyRegistered() {
        if (!IUsers(addressRegistry.__usersContract()).__isRegistered(msg.sender)) revert systemError("NotRegistered");
        _;
    }

    // =============================================================
    // INITIALIZER
    // =============================================================

    function initialize(
        address _registryAddress
    ) public initializer {
        // Validate input addresses
        if (_registryAddress == address(0)) revert systemError("ZeroAddress");

        // Initialize parent contracts
        __ReentrancyGuard_init();
        __Pausable_init();

        // Set up access control and state variables
        addressRegistry = IAddressRegistry(_registryAddress);

        taskCounter = 0;
        feeCollected = 0;
    }

    // =============================================================
    // TASK LIFECYCLE - MENGGUNAKAN LIBRARY
    // =============================================================

    /**
     * @notice Creates a new task with initial parameters
     */
    function createTask(
        string memory Title,
        string memory GithubURL,
        uint32 DeadlineHours,
        uint8 MaximumRevision,
        address user
    ) external payable whenNotPaused onlyRegistered nonReentrant onlyUser(addressRegistry.__accessControlContract()) {
        uint256 newTaskId = TaskLibrary.createTask(
            Tasks,
            addressRegistry,
            taskCounter,
            Title,
            GithubURL,
            DeadlineHours,
            MaximumRevision,
            user,
            msg.value
        );
        
        taskCounter ++;
        
        emit userEvent("TaskCreated", newTaskId, user, msg.value, 0, 0, Title, 0);
    }

    /**
     * @notice Deletes a task
     */
    function deleteTask(uint256 taskId, address user) external nonReentrant onlyRegistered {
        TaskLibrary.deleteTask(
            Tasks,
            addressRegistry,
            taskId,
            user
        );
        
        emit userEvent("TaskDeleted", taskId, user, 0, 0, 0, "", 0);
    }

    /**
     * @notice Activates a task by providing creator stake
     */
    function activateTask(uint256 taskId) external payable taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        uint256 newFee = TaskLibrary.activateTask(
            Tasks,
            addressRegistry,
            taskId,
            msg.sender,
            msg.value
        );
        
        feeCollected += newFee;
        
        emit userEvent("TaskActive", taskId, msg.sender, 0, 0, 0, "", 0);
    }

    /**
     * @notice Opens task for member registration
     */
    function openRegistration(uint256 taskId) external taskExists(taskId) onlyTaskCreator(taskId) whenNotPaused {
        TaskData storage t = Tasks[taskId];
        if (t.status != TaskStatus.Active) revert systemError("TaskNotOpen");
        t.status = TaskStatus.OpenRegistration;
        emit userEvent("RegistrationOpened", taskId, t.creator, 0, 0, 0, "", 0);
    }

    /**
     * @notice Closes task registration
     */
    function closeRegistration(uint256 taskId) external taskExists(taskId) onlyTaskCreator(taskId) whenNotPaused {
        TaskData storage t = Tasks[taskId];
        if (t.status != TaskStatus.OpenRegistration) revert systemError("TaskNotOpen");
        t.status = TaskStatus.Active;
        emit userEvent("RegistrationClosed", taskId, t.creator, 0, 0, 0, "", 0);
    }

    /**
     * @notice Requests to join a task
     */
    function requestJoinTask(uint256 taskId, address user) external payable taskExists(taskId) whenNotPaused onlyRegistered onlyUser(addressRegistry.__accessControlContract()) {
        TaskLibrary.requestJoinTask(
            Tasks,
            joinRequests,
            addressRegistry,
            taskId,
            user,
            msg.value
        );
        
        emit userEvent("JoinRequested", taskId, user, msg.value, 0, 0, "", 0);
    }

    /**
     * @notice Withdraws a pending join request
     */
    function withdrawJoinRequest(uint256 taskId, address user) external nonReentrant onlyRegistered {
        TaskLibrary.withdrawJoinRequest(
            joinRequests,
            addressRegistry,
            taskId,
            user
        );
        
        emit userEvent("JoinrequestCancelled", taskId, user, 0, 0, 0, "", 0);
    }

    /**
     * @notice Approves a join request
     */
    function approveJoinRequest(uint256 taskId, address applicant) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        TaskLibrary.approveJoinRequest(
            Tasks,
            joinRequests,
            addressRegistry,
            taskId,
            applicant,
            msg.sender
        );
        
        emit userEvent("JoinApproved", taskId, applicant, 0, 0, 0, "", 0);
    }

    /**
     * @notice Rejects a join request
     */
    function rejectJoinRequest(uint256 taskId, address _applicant) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        TaskLibrary.rejectJoinRequest(
            joinRequests,
            addressRegistry,
            taskId,
            _applicant,
            msg.sender
        );
        
        emit userEvent("JoinRejected", taskId, _applicant, 0, 0, 0, "", 0);
    }

    /**
     * @notice Cancels a task by either party
     */
    function cancelByMe(uint256 taskId, address user) external taskExists(taskId) nonReentrant onlyUser(addressRegistry.__accessControlContract()) whenNotPaused {
        TaskLibrary.cancelByMe(
            Tasks,
            addressRegistry,
            taskId,
            user
        );
        
        emit userEvent("TaskCancelledByMe", taskId, user, 0, 0, 0, "", 0);
    }

    /**
     * @notice Submits task completion
     */
    function requestSubmitTask(uint256 taskId, string calldata PullRequestURL, string calldata Note, address user)
        external
        taskExists(taskId)
        onlyTaskMember(taskId)
        whenNotPaused
        onlyUser(addressRegistry.__accessControlContract())
    {
        TaskLibrary.requestSubmitTask(
            Tasks,
            TaskSubmits,
            addressRegistry,
            taskId,
            PullRequestURL,
            Note,
            user
        );
        
        emit userEvent("TaskSubmitted", taskId, user, 0, 0, 0, PullRequestURL, 0);
    }

    /**
     * @notice Resubmits task after revision
     */
    function reSubmitTask(uint256 taskId, string calldata Note, string calldata GithubFixedURL, address user)
        external
        taskExists(taskId)
        onlyTaskMember(taskId)
        whenNotPaused
        onlyUser(addressRegistry.__accessControlContract())
    {
        TaskLibrary.reSubmitTask(
            Tasks,
            TaskSubmits,
            addressRegistry,
            taskId,
            Note,
            GithubFixedURL,
            user
        );
        
        emit userEvent("TaskReSubmitted", taskId, user, 0, 0, 0, GithubFixedURL, 0);
    }

    /**
     * @notice Requests revision for a submission
     */
    function requestRevision(uint256 taskId, string calldata Note, uint256 additionalDeadlineHours)
        external
        whenNotPaused
    {
        TaskLibrary.requestRevision(
            Tasks,
            TaskSubmits,
            addressRegistry,
            taskId,
            Note,
            additionalDeadlineHours
        );
        
        emit userEvent("RevisionRequested", taskId, address(0), 0, 0, 0, Note, 0);
    }

    /**
     * @notice Approves task completion
     */
    function approveTask(uint256 taskId)
        external
        taskExists(taskId)
        onlyTaskCreator(taskId)
        nonReentrant
        whenNotPaused
    {
        TaskLibrary.approveTask(
            Tasks,
            TaskSubmits,
            addressRegistry,
            taskId,
            msg.sender
        );
        
        emit userEvent("TaskApproved", taskId, address(0), 0, 0, 0, "", 0);
    }

    /**
     * @notice Triggers deadline consequences
     */
    function triggerDeadline(uint256 taskId) public taskExists(taskId) whenNotPaused nonReentrant {
        TaskLibrary.triggerDeadline(
            Tasks,
            TaskSubmits,
            addressRegistry,
            taskId
        );
        
        emit userEvent("DeadlineTriggered", taskId, address(0), 0, 0, 0, "", 0);
    }

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================

    /**
     * @notice Checks join request count
     */
    function getJoinRequestCount(uint256 taskId) external view returns (uint256) {
        return joinRequests[taskId].length;
    }

    /**
     * @notice Gets required member stake
     */
    function getMemberRequiredStake(uint256 taskId) public view taskExists(taskId) returns (uint256) {
        return TaskLibrary.getMemberRequiredStake(Tasks, addressRegistry, taskId);
    }

    /**
     * @notice Gets creator stake
     */
    function ___getCreatorStake(
        uint32 DeadlineHours,
        uint8 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view returns (uint256) {
        uint256 category = ___getProjectValue(DeadlineHours, MaximumRevision, rewardWei, Caller);
        return (category * IDataContract(addressRegistry.__dataContract()).__getCreatorStakeFromProjectValuePercentage()) / 100;
    }

    /**
     * @notice Gets project value
     */
    function ___getProjectValue(
        uint32 DeadlineHours,
        uint8 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view returns (uint256) {
        uint256 rewardEtherUnits = rewardWei / 1 ether;
        
        IDataContract data = IDataContract(addressRegistry.__dataContract());
        IUsers users = IUsers(addressRegistry.__usersContract());
        
        uint256 pos = (data.__getRewardScore() * rewardEtherUnits) + 
                      (data.__getRevisionScore() * MaximumRevision);
        
        uint256 neg = (data.__getReputationScore() * users.__getUserReputation(Caller)) + 
                      (data.__getDeadlineScore() * DeadlineHours);
        
        uint256 rawValue = (pos <= neg) ? 0 : (pos - neg);
        
        return (rawValue * 1 ether) / 100;
    }

    /**
     * @notice Gets counter penalty
     */
    function __getCounterPenalty() internal view returns (uint64) {
        return TaskLibrary.getCounterPenalty(addressRegistry);
    }

    // =============================================================
    // OWNER FUNCTIONS
    // =============================================================

    /**
     * @notice Withdraws accumulated protocol fees
     */
    function withdrawToSystemWallet() external onlyOwner(addressRegistry.__accessControlContract()) nonReentrant whenNotPaused {
        uint256 amount = feeCollected;
        feeCollected = 0;
        (bool ok, ) = addressRegistry.__walletContract().call{value: amount}("");
        if (!ok) revert systemError("WithdrawFailed");
        
        emit systemChangedEvent("withdrawToSystemWallet", address(0), amount);
    }

    /**
     * @notice Pauses contract
     */
    function pause(address caller) external onlyOwner(addressRegistry.__accessControlContract()) {
        if (caller == address(0)) revert systemError("ZeroAddress");
        _pause();
        emit systemChangedEvent("contract paused", caller, 0);
    }

    /**
     * @notice Unpauses contract
     */
    function unpause(address caller) external onlyOwner(addressRegistry.__accessControlContract()) {
        if (caller == address(0)) revert systemError("ZeroAddress");
        _unpause();
        emit systemChangedEvent("contract Unpaused", caller, 0);
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

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner(addressRegistry.__accessControlContract()) whenNotPaused {
        if (newImplementation == address(0)) revert systemError("ZeroAddress");
    }
}