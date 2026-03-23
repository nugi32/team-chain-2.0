// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "../system/interfaces/IAddressRegistry.sol";
import "../system/utils/addressUtils.sol";
import "../Pipe/AccesControlPipes.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract taskData is 
    AddressUtils, 
    Initializable, 
    UUPSUpgradeable, 
    PausableUpgradeable,
    MainAccesControlPipes {

    // =============================================================
    // ENUMS
    // =============================================================
    enum TaskStatus { 
        NonExistent, 
        Created, 
        Active, 
        OpenRegistration, 
        InProgres, 
        Completed, 
        Cancelled 
    }

    enum UserTask { 
        None, 
        Request, 
        Accepted, 
        Rejected, 
        Cancelled 
    }

    enum SubmitStatus { 
        NoneStatus, 
        Pending, 
        RevisionNeeded, 
        Accepted 
    }

    // =============================================================
    // STRUCTS
    // =============================================================
    struct TaskData {
        TaskStatus status;
        uint256 taskId;
        uint256 value;
        uint256 reward;
        uint256 deadlineAt;
        uint256 createdAt;
        uint256 creatorStake;
        uint256 memberStake;
        uint128 maxRevision;
        uint128 deadlineHours;
        address creator;
        address member;
        string title;
        string githubURL;
        bool isMemberStakeLocked;
        bool isCreatorStakeLocked;
        bool isRewardClaimed;
        bool exists;
    }

    struct JoinRequestData {
        address applicant;
        uint256 stakeAmount;
        UserTask status;
        bool isPending;
        bool hasWithdrawn;
    }

    struct TaskSubmitData {
        string githubURL;
        string note;
        address sender;
        SubmitStatus status;
        uint256 revisionTime;
        uint256 newDeadline;
    }

    // =============================================================
    // STORAGE
    // =============================================================
    mapping(uint256 => TaskSubmitData) public TaskSubmits;
    mapping(uint256 => TaskData) public Tasks;
    mapping(uint256 => JoinRequestData[]) public joinRequests;

    uint256 public taskCounter;
    uint256 public feeCollected;

    IAddressRegistry public addressRegistry;

    uint256[40] private ___gap;

    // =============================================================
    // event & error
    // =============================================================
    event taskDataEvent(string eventName, uint256 indexed taskId, address indexed caller, bytes extraData);
    error taskDataErr(string message);

    // =============================================================
    // MODIFIER
    // =============================================================
    modifier ctcCall() {
        require(
            msg.sender == addressRegistry.__taskDataContractCaller(),
            "Unauthorized caller"
        );
        _;
    }

    // =============================================================
    // INITIAL SETUP
    // =============================================================
    function initialize(
        address _registryAddress
    ) public initializer {
        // Validate input addresses
        if (_registryAddress == address(0)) revert taskDataErr("ZeroAddress");

        // Initialize parent contracts
        __Pausable_init();

        // Set up access control and state variables
        addressRegistry = IAddressRegistry(_registryAddress);

        taskCounter = 0;
        feeCollected = 0;
    }

    // =============================================================
    // TASK MODIFY FUNCTIONS
    // =============================================================

    function __createTask(TaskData calldata data) external ctcCall {
        require(!Tasks[data.taskId].exists, "Task exists");

        Tasks[data.taskId] = data;
        Tasks[data.taskId].exists = true;

        taskCounter++;
        
        emit taskDataEvent("createTask", data.taskId, msg.sender, abi.encode(data.status, data.value, data.reward, data.creatorStake, data.memberStake, data.deadlineAt, data.creator, data.member));
    }

    function __updateTaskStatus(uint256 taskId, TaskStatus status) external ctcCall {
        require(Tasks[taskId].exists, "Task not found");
        Tasks[taskId].status = status;
        
        emit taskDataEvent("updateTaskStatus", taskId, msg.sender, abi.encode(status));
    }

    function __updateTaskFinancials(
        uint256 taskId,
        uint256 value,
        uint256 reward,
        uint256 creatorStake,
        uint256 memberStake
    ) external ctcCall {
        TaskData storage t = Tasks[taskId];
        require(t.exists, "Task not found");

        t.value = value;
        t.reward = reward;
        t.creatorStake = creatorStake;
        t.memberStake = memberStake;
        
        emit taskDataEvent("updateTaskFinancials", taskId, msg.sender, abi.encode(value, reward, creatorStake, memberStake));
    }

    function __updateTaskParticipants(
        uint256 taskId,
        address creator,
        address member
    ) external ctcCall {
        TaskData storage t = Tasks[taskId];
        require(t.exists, "Task not found");

        t.creator = creator;
        t.member = member;
        
        emit taskDataEvent("updateTaskParticipants", taskId, msg.sender, abi.encode(creator, member));
    }

    function __updateTaskMetadata(
        uint256 taskId,
        string calldata title,
        string calldata githubURL
    ) external ctcCall {
        TaskData storage t = Tasks[taskId];
        require(t.exists, "Task not found");

        t.title = title;
        t.githubURL = githubURL;
        
        emit taskDataEvent("updateTaskMetadata", taskId, msg.sender, abi.encode(title, githubURL));
    }

    function __updateTaskFlags(
        uint256 taskId,
        bool memberStakeLocked,
        bool creatorStakeLocked,
        bool rewardClaimed
    ) external ctcCall {
        TaskData storage t = Tasks[taskId];
        require(t.exists, "Task not found");

        t.isMemberStakeLocked = memberStakeLocked;
        t.isCreatorStakeLocked = creatorStakeLocked;
        t.isRewardClaimed = rewardClaimed;
        
        emit taskDataEvent("updateTaskFlags", taskId, msg.sender, abi.encode(memberStakeLocked, creatorStakeLocked, rewardClaimed));
    }

    function __updateTaskDeadline(
        uint256 taskId,
        uint256 deadlineAt,
        uint128 deadlineHours
    ) external ctcCall {
        TaskData storage t = Tasks[taskId];
        require(t.exists, "Task not found");

        t.deadlineAt = deadlineAt;
        t.deadlineHours = deadlineHours;
        
        emit taskDataEvent("updateTaskDeadline", taskId, msg.sender, abi.encode(deadlineAt, deadlineHours));
    }

    function __updateTaskRevision(
        uint256 taskId,
        uint128 maxRevision
    ) external ctcCall {
        TaskData storage t = Tasks[taskId];
        require(t.exists, "Task not found");

        t.maxRevision = maxRevision;
        
        emit taskDataEvent("updateTaskRevision", taskId, msg.sender, abi.encode(maxRevision));
    }

    // =============================================================
    // JOIN REQUEST FUNCTIONS
    // =============================================================

    function __addJoinRequest(
        uint256 taskId,
        JoinRequestData calldata request
    ) external ctcCall {
        require(Tasks[taskId].exists, "Task not found");
        joinRequests[taskId].push(request);
        
        emit taskDataEvent("addJoinRequest", taskId, msg.sender, abi.encode(request.applicant, request.stakeAmount, request.status, request.isPending, request.hasWithdrawn));
    }

    function __updateJoinRequestStatus(
        uint256 taskId,
        uint256 index,
        UserTask status
    ) external ctcCall {
        joinRequests[taskId][index].status = status;
        
        emit taskDataEvent("updateJoinRequestStatus", taskId, msg.sender, abi.encode(index, status));
    }

    function __updateJoinRequestFlags(
        uint256 taskId,
        uint256 index,
        bool isPending,
        bool hasWithdrawn
    ) external ctcCall {
        JoinRequestData storage r = joinRequests[taskId][index];
        r.isPending = isPending;
        r.hasWithdrawn = hasWithdrawn;
        
        emit taskDataEvent("updateJoinRequestFlags", taskId, msg.sender, abi.encode(index, isPending, hasWithdrawn));
    }

    // =============================================================
    // SUBMISSION FUNCTIONS
    // =============================================================

    function __setTaskSubmit(
        uint256 taskId,
        TaskSubmitData calldata data
    ) external ctcCall {
        require(Tasks[taskId].exists, "Task not found");
        TaskSubmits[taskId] = data;
        
        emit taskDataEvent("setTaskSubmit", taskId, msg.sender, abi.encode(data.githubURL, data.note, data.sender, data.status, data.revisionTime, data.newDeadline));
    }

    function __updateSubmitStatus(
        uint256 taskId,
        SubmitStatus status
    ) external ctcCall {
        TaskSubmits[taskId].status = status;
        
        emit taskDataEvent("updateSubmitStatus", taskId, msg.sender, abi.encode(status));
    }

    function __updateSubmitContent(
        uint256 taskId,
        string calldata githubURL,
        string calldata note
    ) external ctcCall {
        TaskSubmitData storage s = TaskSubmits[taskId];
        s.githubURL = githubURL;
        s.note = note;
        
        emit taskDataEvent("updateSubmitContent", taskId, msg.sender, abi.encode(githubURL, note));
    }

    function __updateSubmitRevision(
        uint256 taskId,
        uint256 revisionTime,
        uint256 newDeadline
    ) external ctcCall {
        TaskSubmitData storage s = TaskSubmits[taskId];
        s.revisionTime = revisionTime;
        s.newDeadline = newDeadline;
        
        emit taskDataEvent("updateSubmitRevision", taskId, msg.sender, abi.encode(revisionTime, newDeadline));
    }

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================

    function __getTask(uint256 taskId) external view returns (TaskData memory) {
        require(Tasks[taskId].exists, "Task not found");
        return Tasks[taskId];
    }

    function __getTaskStatus(uint256 taskId) external view returns (TaskStatus) {
        require(Tasks[taskId].exists, "Task not found");
        return Tasks[taskId].status;
    }

    function __getTaskParticipants(uint256 taskId)
        external
        view
        returns (address creator, address member)
    {
        require(Tasks[taskId].exists, "Task not found");
        TaskData storage t = Tasks[taskId];
        return (t.creator, t.member);
    }

    function __getTaskFinancials(uint256 taskId)
        external
        view
        returns (
            uint256 value,
            uint256 reward,
            uint256 creatorStake,
            uint256 memberStake
        )
    {
        require(Tasks[taskId].exists, "Task not found");
        TaskData storage t = Tasks[taskId];
        return (t.value, t.reward, t.creatorStake, t.memberStake);
    }

    function __getTaskMetadata(uint256 taskId)
        external
        view
        returns (string memory title, string memory githubURL)
    {
        require(Tasks[taskId].exists, "Task not found");
        TaskData storage t = Tasks[taskId];
        return (t.title, t.githubURL);
    }

    function __getTaskFlags(uint256 taskId)
        external
        view
        returns (
            bool isMemberStakeLocked,
            bool isCreatorStakeLocked,
            bool isRewardClaimed
        )
    {
        require(Tasks[taskId].exists, "Task not found");
        TaskData storage t = Tasks[taskId];
        return (
            t.isMemberStakeLocked,
            t.isCreatorStakeLocked,
            t.isRewardClaimed
        );
    }

    function __getJoinRequests(uint256 taskId)
        external
        view
        returns (JoinRequestData[] memory)
    {
        return joinRequests[taskId];
    }

    function __getJoinRequestByIndex(uint256 taskId, uint256 index)
        external
        view
        returns (JoinRequestData memory)
    {
        return joinRequests[taskId][index];
    }

    function __getJoinRequestCount(uint256 taskId)
        external
        view
        returns (uint256)
    {
        return joinRequests[taskId].length;
    }

    function __getTaskSubmit(uint256 taskId)
        external
        view
        returns (TaskSubmitData memory)
    {
        return TaskSubmits[taskId];
    }

    function __getSubmitStatus(uint256 taskId)
        external
        view
        returns (SubmitStatus)
    {
        return TaskSubmits[taskId].status;
    }

    function __getSubmitContent(uint256 taskId)
        external
        view
        returns (string memory githubURL, string memory note)
    {
        TaskSubmitData storage s = TaskSubmits[taskId];
        return (s.githubURL, s.note);
    }

    function __getSubmitRevision(uint256 taskId)
        external
        view
        returns (uint256 revisionTime, uint256 newDeadline)
    {
        TaskSubmitData storage s = TaskSubmits[taskId];
        return (s.revisionTime, s.newDeadline);
    }

    function __getGlobalState()
        external
        view
        returns (uint256 _taskCounter, uint256 _feeCollected)
    {
        return (taskCounter, feeCollected);
    }

    // =============================================================
    // GLOBAL MODIFY
    // =============================================================

    function __increaseFee(uint256 amount) external ctcCall {
        feeCollected += amount;
        
        emit taskDataEvent("increaseFee", 0, msg.sender, abi.encode(amount, feeCollected));
    }

    function __decreaseFee(uint256 amount) external ctcCall {
        require(feeCollected >= amount, "Insufficient fee");
        feeCollected -= amount;
        
        emit taskDataEvent("decreaseFee", 0, msg.sender, abi.encode(amount, feeCollected));
    }

    // =============================================================
    // OWNER FUNCTIONS
    // =============================================================

    /**
     * @notice Pauses contract
     */
    function pause(address caller) external onlyOwner(addressRegistry.__accessControlContract()) {
        if (caller == address(0)) revert taskDataErr("ZeroAddress");
        _pause();
        emit taskDataEvent("contract paused", 0, caller, abi.encode(""));
    }

    /**
     * @notice Unpauses contract
     */
    function unpause(address caller) external onlyOwner(addressRegistry.__accessControlContract()) {
        if (caller == address(0)) revert taskDataErr("ZeroAddress");
        _unpause();
        emit taskDataEvent("contract Unpaused", 0, caller, abi.encode(""));
    }

    /**
     * @notice Change address registry address
     */
    function changeRegistryAddress(address newRegistry) external onlyOwner(addressRegistry.__accessControlContract()) {
        if (newRegistry == address(0)) revert taskDataErr("ZeroAddress");
        addressRegistry = IAddressRegistry(newRegistry);
        emit taskDataEvent("registry address changed", 0, msg.sender, abi.encode(newRegistry));
    }

    // =============================================================
    // FALLBACK FUNCTIONS
    // =============================================================

    receive() external payable {
        revert taskDataErr("DirectEtherTransferNotAllowed");
    }

    fallback() external payable {
        revert taskDataErr("FunctionNotFound");
    }

    // =============================================================
    // UPGRADE AUTHORIZATION
    // =============================================================

    function _authorizeUpgrade(address newImplementation) internal view override onlyOwner(addressRegistry.__accessControlContract()) whenNotPaused {
        if (newImplementation == address(0)) revert taskDataErr("ZeroAddress");
    }
}