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
//
    // =============================================================
    // EVENTS
    // =============================================================
    event systemChangedEvent(string info, address indexed newAddress, uint256 indexed value);
    event userEvent(string info, uint256 indexed param1, address indexed param2, uint256 param3, uint256 param4, uint8 param5, string param6, uint128 param7);

    // =============================================================
    // ERRORS
    // =============================================================
    error systemError(string errName);
    error MainContractErr(string errName);

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
//
    // =============================================================
    // TASK LIFECYCLE - MENGGUNAKAN LIBRARY
    // =============================================================

    /**
     * @notice Creates a new task with initial parameters
     */
    function createTask(
        string memory _Title,
        string memory _GithubURL,
        uint128 _DeadlineHours,
        uint128 _MaximumRevision,
        address _user
    ) external payable whenNotPaused onlyRegistered nonReentrant onlyUser(addressRegistry.__accessControlContract()) {

        uint256 projectValue = ___getProjectValue(_DeadlineHours, _MaximumRevision, msg.value, _user);

        uint256 newTaskId = TaskLibrary.___createTask(
            Tasks,
            taskCounter,
            _Title,
            _GithubURL,
            _DeadlineHours,
            _MaximumRevision,
            _user,
            msg.value,
            projectValue
        );

        IUsers(addressRegistry.__usersContract()).__taskCreateCounter(_user);
        
        taskCounter ++;
        
        emit userEvent("TaskCreated", newTaskId, _user, msg.value, 0, 0, _Title, 0);
    }

    /**
     * @notice Deletes a task
     */
    function deleteTask(uint256 _taskId, address _user) external nonReentrant onlyTaskCreator(_taskId) onlyRegistered {
        TaskData storage t = Tasks[_taskId];
        if (!t.exists) revert systemError("TaskDoesNotExist");
        TaskLibrary.___deleteTask(
            Tasks,
            _taskId
        );

        if (t.member != address(0)) {
            cancelByMe(
                _taskId,
                _user
            );
        } else {
        IUsers(addressRegistry.__usersContract()).__addUserBalance(_user, t.reward);

        if (t.creatorStake > 0) {
            IUsers(addressRegistry.__usersContract()).__addUserBalance(_user, t.creatorStake);
            }
        }
        
        emit userEvent("TaskDeleted", _taskId, _user, 0, 0, 0, "", 0);
    }

    /**
     * @notice Activates a task by providing creator stake
     */
  function activateTask(uint256 taskId, address user)
    external
    payable
    taskExists(taskId)
    onlyTaskCreator(taskId)
    nonReentrant
    whenNotPaused
{
    TaskData storage t = Tasks[taskId];

    uint256 requiredStake = ___getCreatorStake(
        t.deadlineHours,
        t.maxRevision,
        t.reward,
        user
    );

uint256 userBalance =
    IUsers(addressRegistry.__usersContract())
        .__getUserBalance(user);

uint256 fromBalance = userBalance >= requiredStake
    ? requiredStake
    : userBalance;

uint256 remaining = requiredStake - fromBalance;

if (msg.value < remaining) {
    revert MainContractErr("InsufficientStake");
}

// tarik internal balance
if (fromBalance > 0) {
    IUsers(addressRegistry.__usersContract())
        .__takeUserBalance(user, fromBalance);
}

// kalau msg.value > remaining → refund
if (msg.value > remaining) {
    IUsers(addressRegistry.__usersContract())
        .__addUserBalance(user, msg.value - remaining);
}

// baru set stake
Tasks[taskId].creatorStake = requiredStake;
Tasks[taskId].status = TaskStatus.Active;
Tasks[taskId].isCreatorStakeLocked = true;

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
        TaskData storage t = Tasks[taskId];

    if (t.status != TaskStatus.OpenRegistration) {
        revert MainContractErr("InvalidStatus");
    }

    if (user == t.creator)
        revert MainContractErr("CannotJoinOwnTask");

        uint256 requiredStake = (
            t.reward *
            IDataContract(addressRegistry.__dataContract())
                .__getMemberStakeFromRewardPercentage()
        ) / 100;

        uint256 userBalance =
        IUsers(addressRegistry.__usersContract())
        .__getUserBalance(user);

        uint256 fromBalance = userBalance >= requiredStake
            ? requiredStake
            : userBalance;

        uint256 remaining = requiredStake - fromBalance;

        if (msg.value < remaining) {
            revert MainContractErr("InsufficientStake");
        }

        // tarik internal balance dulu
        if (fromBalance > 0) {
            IUsers(addressRegistry.__usersContract())
                .__takeUserBalance(user, fromBalance);
        }

        // kalau msg.value kelebihan → refund
        if (msg.value > remaining) {
            payable(msg.sender).transfer(msg.value - remaining);
        }
                
        TaskLibrary.___requestJoinTask(
            joinRequests,
            taskId,
            user,
            requiredStake
        );
        
        emit userEvent("JoinRequested", taskId, user, msg.value, 0, 0, "", 0);
    }

    /**
     * @notice Withdraws a pending join request
     */
    function withdrawJoinRequest(uint256 taskId, address user) external nonReentrant onlyRegistered {
        uint256 stake = TaskLibrary.___withdrawJoinRequest(
            joinRequests,
            taskId,
            user
        );

        IUsers(addressRegistry.__usersContract()).__addUserBalance(user, stake);
        
        emit userEvent("JoinrequestCancelled", taskId, user, 0, 0, 0, "", 0);
    }

    /**
     * @notice Approves a join request
     */
    function approveJoinRequest(uint256 taskId, address applicant) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        TaskLibrary.___approveJoinRequest(
            Tasks,
            joinRequests,
            taskId,
            applicant
        );
        
        emit userEvent("JoinApproved", taskId, applicant, 0, 0, 0, "", 0);
    }

    /**
     * @notice Rejects a join request
     */
    function rejectJoinRequest(uint256 taskId, address _applicant) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        uint256 stake = TaskLibrary.___rejectJoinRequest(
            joinRequests,
            taskId,
            _applicant
        );

        IUsers(addressRegistry.__usersContract()).__addUserBalance(_applicant, stake);
        
        emit userEvent("JoinRejected", taskId, _applicant, 0, 0, 0, "", 0);
    }

    /**
     * @notice Cancels a task by either party
     */
    function cancelByMe(uint256 taskId, address user) public taskExists(taskId) nonReentrant onlyUser(addressRegistry.__accessControlContract()) whenNotPaused {
        TaskData storage t = Tasks[taskId];

        if (user != t.creator && user != t.member) revert MainContractErr("NotCounterparty");
        if (t.status != TaskStatus.InProgres) revert MainContractErr("InvalidStatus");

        if (user == t.member) {
            uint256 penaltyToCreator = (t.memberStake * IDataContract(addressRegistry.__dataContract()).__getNegPenalty()) / 100;
            uint256 memberReturn = (t.memberStake * (100 - IDataContract(addressRegistry.__dataContract()).__getNegPenalty())) / 100;

            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, t.creatorStake + t.reward + penaltyToCreator);
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, memberReturn);
        } else {
            if (t.member == address(0)) revert MainContractErr("NoMemberAssigned");

            uint256 penaltyToMember = (t.creatorStake * IDataContract(addressRegistry.__dataContract()).__getNegPenalty()) / 100;
            uint256 creatorReturn = (t.creatorStake * (100 - IDataContract(addressRegistry.__dataContract()).__getNegPenalty())) / 100 + t.reward;

            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, t.memberStake + penaltyToMember);
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, creatorReturn);
        }

        t.isMemberStakeLocked = false;
        t.isCreatorStakeLocked = false;
        t.status = TaskStatus.Cancelled;

        IUsers(addressRegistry.__usersContract()).__cancelByMeRep(t.member);
        IUsers(addressRegistry.__usersContract()).__cancelByMeRep(t.creator);
        
        IUsers(addressRegistry.__usersContract()).__taskFailCounter(t.member, t.creator);
        
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
        TaskLibrary.___requestSubmitTask(
            Tasks,
            TaskSubmits,
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
        TaskLibrary.___reSubmitTask(
            Tasks,
            TaskSubmits,
            taskId,
            Note,
            GithubFixedURL
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
        TaskData storage t = Tasks[taskId];

        TaskLibrary.___requestRevision(
            Tasks,
            TaskSubmits,
            taskId,
            Note,
            additionalDeadlineHours
        );

        IUsers users = IUsers(addressRegistry.__usersContract());
        IDataContract data = IDataContract(addressRegistry.__dataContract());

        if (users.__isRegistered(t.member) && users.__isRegistered(t.creator)) {
            uint256 userRep = users.__getUserReputation(t.member);
            uint256 creatorRep = users.__getUserReputation(t.creator);

            if (creatorRep < data.__getRevisionPenalty()) {
                users.__penaltyIsBiggerThanReputation(t.creator);
            }

            if (userRep < data.__getRevisionPenalty()) {
                users.__penaltyIsBiggerThanReputation(t.member);
            }
            
            users.__revisionRep(t.member, t.creator);
        }

        
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
        TaskData storage t = Tasks[taskId];

        (uint256 memberGet, uint256 creatorGet) = TaskLibrary.___approveTask(
            Tasks,
            TaskSubmits,
            taskId
        );

        IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, memberGet);
        IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, creatorGet);

        if (IUsers(addressRegistry.__usersContract()).__isRegistered(t.member) && 
            IUsers(addressRegistry.__usersContract()).__isRegistered(t.creator)) {
            IUsers(addressRegistry.__usersContract()).__taskAcceptRep(t.member, t.creator);
        }

        IUsers(addressRegistry.__usersContract()).__taskCompleteCounter(t.member, t.creator);

        
        emit userEvent("TaskApproved", taskId, address(0), 0, 0, 0, "", 0);
    }

    /**
     * @notice Triggers deadline consequences
     */
    function triggerDeadline(uint256 taskId) public taskExists(taskId) whenNotPaused nonReentrant {
        TaskData storage t = Tasks[taskId];
        TaskSubmitData storage s = TaskSubmits[taskId];

        if (s.status == SubmitStatus.Pending) revert MainContractErr("SubmissionError");
        if (t.status != TaskStatus.InProgres) revert MainContractErr("InvalidStatus");
        if (t.deadlineAt == 0) revert MainContractErr("InvalidDeadline");
        if (block.timestamp < t.deadlineAt) revert MainContractErr("DeadlineNotExceeded");

        IDataContract dataContract = IDataContract(addressRegistry.__dataContract());
        IUsers users = IUsers(addressRegistry.__usersContract());

        if (t.member != address(0) && t.memberStake > 0) {
            uint256 toMember = (t.memberStake * dataContract.__getNegPenalty()) / 100;
            uint256 toCreator = (t.memberStake * (100 - dataContract.__getNegPenalty())) / 100;

            users.__addUserBalance(t.member, toMember);
            users.__addUserBalance(t.creator, toCreator + t.creatorStake + t.reward);
        } else {
            users.__addUserBalance(t.creator, t.creatorStake + t.reward);
        }

        t.isMemberStakeLocked = false;
        t.isCreatorStakeLocked = false;
        t.status = TaskStatus.Cancelled;

        if (users.__isRegistered(t.member) && users.__isRegistered(t.creator)) {
            uint256 memberRep = users.__getUserReputation(t.member);
            uint256 creatorRep = users.__getUserReputation(t.creator);

            if (creatorRep < dataContract.__getDeadlineHitCreator()) {
                users.__penaltyIsBiggerThanReputation(t.creator);
            }
            if (memberRep < dataContract.__getDeadlineHitMember()) {
                users.__penaltyIsBiggerThanReputation(t.member);
            }

            users.__deadlineHitRep(t.member, t.creator);
        }
        
        users.__taskFailCounter(t.creator, t.member);
        
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
        TaskData storage t = Tasks[taskId];
        return (t.reward * IDataContract(addressRegistry.__dataContract()).__getMemberStakeFromRewardPercentage()) / 100;
    }

    /**
     * @notice Gets creator stake
     */
    function ___getCreatorStake(
        uint128 DeadlineHours,
        uint128 MaximumRevision,
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
        uint128 DeadlineHours,
        uint128 MaximumRevision,
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

    function _authorizeUpgrade(address newImplementation) internal view override onlyOwner(addressRegistry.__accessControlContract()) whenNotPaused {
        if (newImplementation == address(0)) revert systemError("ZeroAddress");
    }
}