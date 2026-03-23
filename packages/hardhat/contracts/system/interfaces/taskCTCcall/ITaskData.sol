// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

interface ITaskData {
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
    // EVENTS
    // =============================================================
    event taskDataEvent(string eventName, uint256 indexed taskId, address indexed caller, bytes extraData);

    // =============================================================
    // TASK MODIFY FUNCTIONS
    // =============================================================
    function __createTask(TaskData calldata data) external;
    function __updateTaskStatus(uint256 taskId, TaskStatus status) external;
    function __updateTaskFinancials(uint256 taskId, uint256 value, uint256 reward, uint256 creatorStake, uint256 memberStake) external;
    function __updateTaskParticipants(uint256 taskId, address creator, address member) external;
    function __updateTaskMetadata(uint256 taskId, string calldata title, string calldata githubURL) external;
    function __updateTaskFlags(uint256 taskId, bool memberStakeLocked, bool creatorStakeLocked, bool rewardClaimed) external;
    function __updateTaskDeadline(uint256 taskId, uint256 deadlineAt, uint128 deadlineHours) external;
    function __updateTaskRevision(uint256 taskId, uint128 maxRevision) external;

    // =============================================================
    // JOIN REQUEST FUNCTIONS
    // =============================================================
    function __addJoinRequest(uint256 taskId, JoinRequestData calldata request) external;
    function __updateJoinRequestStatus(uint256 taskId, uint256 index, UserTask status) external;
    function __updateJoinRequestFlags(uint256 taskId, uint256 index, bool isPending, bool hasWithdrawn) external;

    // =============================================================
    // SUBMISSION FUNCTIONS
    // =============================================================
    function __setTaskSubmit(uint256 taskId, TaskSubmitData calldata data) external;
    function __updateSubmitStatus(uint256 taskId, SubmitStatus status) external;
    function __updateSubmitContent(uint256 taskId, string calldata githubURL, string calldata note) external;
    function __updateSubmitRevision(uint256 taskId, uint256 revisionTime, uint256 newDeadline) external;

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================
    function __getTask(uint256 taskId) external view returns (TaskData memory);
    function __getTaskStatus(uint256 taskId) external view returns (TaskStatus);
    function __getTaskParticipants(uint256 taskId) external view returns (address creator, address member);
    function __getTaskFinancials(uint256 taskId) external view returns (uint256 value, uint256 reward, uint256 creatorStake, uint256 memberStake);
    function __getTaskMetadata(uint256 taskId) external view returns (string memory title, string memory githubURL);
    function __getTaskFlags(uint256 taskId) external view returns (bool isMemberStakeLocked, bool isCreatorStakeLocked, bool isRewardClaimed);
    function __getJoinRequests(uint256 taskId) external view returns (JoinRequestData[] memory);
    function __getJoinRequestByIndex(uint256 taskId, uint256 index) external view returns (JoinRequestData memory);
    function __getJoinRequestCount(uint256 taskId) external view returns (uint256);
    function __getTaskSubmit(uint256 taskId) external view returns (TaskSubmitData memory);
    function __getSubmitStatus(uint256 taskId) external view returns (SubmitStatus);
    function __getSubmitContent(uint256 taskId) external view returns (string memory githubURL, string memory note);
    function __getSubmitRevision(uint256 taskId) external view returns (uint256 revisionTime, uint256 newDeadline);
    function __getGlobalState() external view returns (uint256 _taskCounter, uint256 _feeCollected);

    // =============================================================
    // GLOBAL MODIFY
    // =============================================================
    function __increaseFee(uint256 amount) external;
    function __decreaseFee(uint256 amount) external;

    // =============================================================
    // OWNER FUNCTIONS
    // =============================================================
    function pause(address caller) external;
    function unpause(address caller) external;
    function changeRegistryAddress(address newRegistry) external;

    // =============================================================
    // STORAGE VARIABLES
    // =============================================================
    function TaskSubmits(uint256 taskId) external view returns (TaskSubmitData memory);
    function Tasks(uint256 taskId) external view returns (TaskData memory);
    function joinRequests(uint256 taskId, uint256 index) external view returns (JoinRequestData memory);
    function taskCounter() external view returns (uint256);
    function feeCollected() external view returns (uint256);
    function addressRegistry() external view returns (address);
}