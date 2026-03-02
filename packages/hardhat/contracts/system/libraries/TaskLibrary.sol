// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// =============================================================
// ENUMS (didefinisikan di global scope)
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
// STRUCTS (didefinisikan di global scope)
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

/**
 * @title TaskLibrary
 * @notice Library containing main task logic
 */
library TaskLibrary {
    
    // =============================================================
    // EVENTS
    // =============================================================
    event TaskEvent(uint indexed taskId, address indexed user, string action, uint value1, uint value2);

    // =============================================================
    // ERRORS
    // =============================================================
    error mainContractErr(string errName);

    // =============================================================
    // TASK LIFECYCLE FUNCTIONS (sesuai urutan contract acuan)
    // =============================================================

    // --- Create Task ---
    function ___createTask(
        mapping(uint256 => TaskData) storage tasks,
        uint256 taskCounter,
        string memory title,
        string memory githubURL,
        uint128 deadlineHours,
        uint128 maxRevision,
        address user,
        uint256 msgValue,
        uint256 projectValue
    ) external returns (uint256 taskId) {
        
        taskId = taskCounter;

        tasks[taskId] = TaskData({
            taskId: taskId,
            status: TaskStatus.Created,
            value: projectValue,
            creator: user,
            member: address(0),
            title: title,
            githubURL: githubURL,
            reward: msgValue,
            deadlineHours: deadlineHours,
            deadlineAt: 0,
            createdAt: block.timestamp,
            creatorStake: 0,
            memberStake: 0,
            maxRevision: maxRevision,
            isMemberStakeLocked: false,
            isCreatorStakeLocked: false,
            isRewardClaimed: false,
            exists: true
        });
        return taskId;
    }

    // --- Delete Task ---
    function ___deleteTask(
        mapping(uint256 => TaskData) storage tasks,
        uint256 taskId
    ) external {
        TaskData storage t = tasks[taskId];
        
        if (!t.exists) revert mainContractErr("TaskDoesNotExist");

        t.status = TaskStatus.Cancelled;
        t.isCreatorStakeLocked = false;
        t.exists = false;
    }

    // --- Request Join ---
    function ___requestJoinTask(
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        uint256 taskId,
        address user,
        uint256 stakeAmount
    ) external {

    JoinRequestData[] storage reqs = joinRequests[taskId];

    for (uint i = 0; i < reqs.length; i++) {
        if (reqs[i].applicant == user && reqs[i].isPending) {
            revert mainContractErr("AlreadyRequested");
        }
    }

    reqs.push(JoinRequestData({
        applicant: user,
        stakeAmount: stakeAmount,
        status: UserTask.Request,
        isPending: true,
        hasWithdrawn: false
    }));
}

    // --- Withdraw Join Request ---
    function ___withdrawJoinRequest(
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        uint256 taskId,
        address user
    ) external returns (uint256) {
        JoinRequestData[] storage reqs = joinRequests[taskId];
        
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].applicant == user && reqs[i].isPending && !reqs[i].hasWithdrawn) {
                reqs[i].isPending = false;
                reqs[i].status = UserTask.Cancelled;
                reqs[i].hasWithdrawn = true;
                uint256 stake = reqs[i].stakeAmount;
                reqs[i].stakeAmount = 0;
                return stake;
            }
        }
        revert mainContractErr("NoPendingRequest");
    }

    // --- Approve Join Request ---
    function ___approveJoinRequest(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        uint256 taskId,
        address applicant
    ) external {
        TaskData storage t = tasks[taskId];

        JoinRequestData[] storage requests = joinRequests[taskId];
        bool found = false;

        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].applicant == applicant && requests[i].isPending) {
                requests[i].isPending = false;
                requests[i].status = UserTask.Accepted;
                
                t.member = requests[i].applicant;
                t.memberStake = requests[i].stakeAmount;
                requests[i].stakeAmount = 0;
                requests[i].hasWithdrawn = true;
                t.isMemberStakeLocked = true;
                
                found = true;
                break;
            }
        }

        if (!found) revert mainContractErr("NoPendingRequest");

        t.deadlineAt = block.timestamp + (uint256(t.deadlineHours) * 1 hours);
        t.status = TaskStatus.InProgres;
    }

    // --- Reject Join Request ---
    function ___rejectJoinRequest(
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        uint256 taskId,
        address applicant
    ) external returns (uint256 stake) {
        JoinRequestData[] storage requests = joinRequests[taskId];
        bool found = false;

        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].applicant == applicant && requests[i].isPending) {
                requests[i].isPending = false;
                requests[i].status = UserTask.Rejected;
                stake = requests[i].stakeAmount;
                requests[i].stakeAmount = 0;
                requests[i].hasWithdrawn = true;
                found = true;
                return stake;
            }
        }
        
        if (!found) revert mainContractErr("NoPendingRequest");
    }

    // --- Submit Task ---
    function ___requestSubmitTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        uint256 taskId,
        string calldata pullRequestURL,
        string calldata note,
        address user
    ) external {
        TaskData storage t = tasks[taskId];
    
        if (t.status != TaskStatus.InProgres) revert mainContractErr("InvalidStatus");

        TaskSubmitData storage s = submits[taskId];
        if (s.sender != address(0) && s.status == SubmitStatus.Pending) {
            revert mainContractErr("SubmissionError");
        }

        submits[taskId] = TaskSubmitData({
            githubURL: pullRequestURL,
            sender: user,
            note: note,
            status: SubmitStatus.Pending,
            revisionTime: 0,
            newDeadline: t.deadlineAt
        });
    }

    // --- Resubmit Task ---
    function ___reSubmitTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        uint256 taskId,
        string calldata note,
        string calldata githubFixedURL
    ) external {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (s.status != SubmitStatus.RevisionNeeded) revert mainContractErr("InvalidStatus");

        if (s.revisionTime > t.maxRevision) {
            if (s.status == SubmitStatus.Pending) {
                revert mainContractErr("SubmissionError");
            } else {
                // Panggil fungsi approveTask yang sudah didefinisikan di awal
                ___approveTask(tasks, submits, taskId);
                return;
            }
        }

        s.note = note;
        s.status = SubmitStatus.Pending;
        s.githubURL = githubFixedURL;
    }

    // --- Request Revision ---
    function ___requestRevision(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        uint256 taskId,
        string calldata note,
        uint256 additionalDeadlineHours
    ) external {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (s.status != SubmitStatus.Pending) revert mainContractErr("InvalidStatus");

        uint256 additionalSeconds = (additionalDeadlineHours * 1 hours);

        s.status = SubmitStatus.RevisionNeeded;
        s.note = note;
        s.revisionTime++;
        t.deadlineAt = block.timestamp + additionalSeconds;

        if (s.revisionTime > t.maxRevision) {
            if (s.status == SubmitStatus.Pending) {
                revert mainContractErr("SubmissionError");
            } else {
                // Panggil fungsi approveTask yang sudah didefinisikan di awal
                ___approveTask(tasks, submits, taskId);
                return;
            }
        }
    }

    // --- Approve Task ---
    function ___approveTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        uint256 taskId
    ) public returns (uint256 memberGet, uint256 creatorGet) {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (t.status != TaskStatus.InProgres) revert mainContractErr("InvalidStatus");
        if (s.status != SubmitStatus.Pending) revert mainContractErr("SubmissionError");
        if (t.isRewardClaimed) revert mainContractErr("AlreadyClaimed");

        memberGet = t.reward + t.memberStake;
        creatorGet = t.creatorStake;

        t.isMemberStakeLocked = false;
        t.isCreatorStakeLocked = false;
        t.isRewardClaimed = true;
        t.status = TaskStatus.Completed;

        delete submits[taskId];
        return (memberGet, creatorGet);
    }
}