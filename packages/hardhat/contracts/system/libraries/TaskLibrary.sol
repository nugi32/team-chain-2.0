// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDataContract.sol";
import "../interfaces/IAddressRegistry.sol";
import "../interfaces/CTCcall/IUsers.sol";

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
    uint256 taskId;
    TaskStatus status;
    uint256 value;
    address creator;
    address member;
    string title;
    string githubURL;
    uint256 reward;
    uint32 deadlineHours;
    uint256 deadlineAt;
    uint256 createdAt;
    uint256 creatorStake;
    uint256 memberStake;
    uint8 maxRevision;
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
    address sender;
    string note;
    SubmitStatus status;
    uint8 revisionTime;
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
    error TaskNotExist();
    error NotTaskCreator();
    error NotTaskMember();
    error InvalidStatus();
    error InvalidStake();
    error NoPendingRequest();
    error AlreadyRequested();
    error SubmissionError();
    error ZeroAddress();
    error AlreadyClaimed();
    error NoMemberAssigned();
    error InvalidDeadline();
    error DeadlineNotExceeded();

    // =============================================================
    // CORE FUNCTIONS (dalam urutan yang benar)
    // =============================================================

    // --- Approve Task (diletakkan di awal agar bisa dipanggil fungsi lain) ---
    function approveTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        IAddressRegistry registry,
        uint256 taskId,
        address caller
    ) internal {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (!t.exists) revert TaskNotExist();
        if (t.creator != caller) revert NotTaskCreator();
        if (t.status != TaskStatus.InProgres) revert InvalidStatus();
        if (s.status != SubmitStatus.Pending) revert SubmissionError();
        if (t.isRewardClaimed) revert AlreadyClaimed();
        if (s.sender == address(0)) revert SubmissionError();

        uint256 memberGet = t.reward + t.memberStake;
        uint256 creatorGet = t.creatorStake;

        IUsers(registry.__usersContract()).__addUserBalance(t.member, memberGet);
        IUsers(registry.__usersContract()).__addUserBalance(t.creator, creatorGet);

        t.isMemberStakeLocked = false;
        t.isCreatorStakeLocked = false;
        t.isRewardClaimed = true;
        t.status = TaskStatus.Completed;

        if (IUsers(registry.__usersContract()).__isRegistered(t.member) && 
            IUsers(registry.__usersContract()).__isRegistered(t.creator)) {
            IUsers(registry.__usersContract()).__taskAcceptRep(t.member, t.creator);
        }

        IUsers(registry.__usersContract()).__taskCompleteCounter(t.member, t.creator);

        delete submits[taskId];

        emit TaskEvent(taskId, caller, "TaskApproved", memberGet, creatorGet);
    }

    // --- Create Task ---
    function createTask(
        mapping(uint256 => TaskData) storage tasks,
        IAddressRegistry registry,
        uint256 taskCounter,
        string memory title,
        string memory githubURL,
        uint32 deadlineHours,
        uint8 maxRevision,
        address user,
        uint256 msgValue
    ) external returns (uint256 taskId) {
        if (user == address(0)) revert ZeroAddress();
        
        taskId = taskCounter + 1;

        uint256 projectValue = _getProjectValue(
            registry,
            deadlineHours,
            maxRevision,
            msgValue,
            user
        );

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

        IUsers(registry.__usersContract()).__taskCreateCounter(user);

        emit TaskEvent(taskId, user, "TaskCreated", msgValue, 0);
        
        return taskId;
    }

    // --- Activate Task ---
    function activateTask(
        mapping(uint256 => TaskData) storage tasks,
        IAddressRegistry registry,
        uint256 taskId,
        address caller,
        uint256 msgValue
    ) external returns (uint256 feeCollected) {
        TaskData storage t = tasks[taskId];
        
        if (!t.exists) revert TaskNotExist();
        if (t.creator != caller) revert NotTaskCreator();
        if (t.status != TaskStatus.Created) revert InvalidStatus();
        
        uint256 requiredStake = _getCreatorStake(
            registry,
            t.deadlineHours,
            t.maxRevision,
            t.reward,
            t.creator
        );
        
        if (msgValue != requiredStake) revert InvalidStake();

        uint256 totalFee = (msgValue * IDataContract(registry.__dataContract()).__getFeePercentage()) / 100;
        uint256 finalStake = msgValue - totalFee;

        uint256 userBalance = IUsers(registry.__usersContract()).__getUserBalance(t.creator);

        if (userBalance >= finalStake) {
            // Cukup dari internal balance
            IUsers(registry.__usersContract()).__takeUserBalance(t.creator, finalStake);
        } else {
            // Ambil semua internal balance
            if (userBalance > 0) {
                IUsers(registry.__usersContract()).__takeUserBalance(t.creator, userBalance);
            }

            uint256 remainingStake = finalStake - userBalance;

            // remainingStake HARUS ditutup oleh msgValue
            // pastikan arsitektur contract Anda memang menyimpan ETH tersebut
            // biasanya tidak perlu apa-apa di sini karena ETH sudah ada di contract pemanggil
        }

        t.creatorStake = finalStake;


        t.status = TaskStatus.Active;
        t.isCreatorStakeLocked = true;
        
        emit TaskEvent(taskId, caller, "TaskActivated", msgValue, totalFee);
        
        return totalFee;
    }

    // --- Cancel Task ---
    function cancelByMe(
        mapping(uint256 => TaskData) storage tasks,
        IAddressRegistry registry,
        uint256 taskId,
        address user
    ) external {
        TaskData storage t = tasks[taskId];

        if (!t.exists) revert TaskNotExist();
        if (user != t.creator && user != t.member) revert("NotCounterparty");
        if (t.status != TaskStatus.InProgres) revert InvalidStatus();

        IDataContract dataContract = IDataContract(registry.__dataContract());
        IUsers users = IUsers(registry.__usersContract());

        if (user == t.member) {
            uint256 penaltyToCreator = (t.memberStake * dataContract.__getNegPenalty()) / 100;
            uint256 memberReturn = (t.memberStake * (100 - dataContract.__getNegPenalty())) / 100;

            users.__addUserBalance(t.creator, t.creatorStake + t.reward + penaltyToCreator);
            users.__addUserBalance(t.member, memberReturn);
        } else {
            if (t.member == address(0)) revert NoMemberAssigned();

            uint256 penaltyToMember = (t.creatorStake * dataContract.__getNegPenalty()) / 100;
            uint256 creatorReturn = (t.creatorStake * (100 - dataContract.__getNegPenalty()) / 100) + t.reward;

            users.__addUserBalance(t.member, t.memberStake + penaltyToMember);
            users.__addUserBalance(t.creator, creatorReturn);
        }

        t.isMemberStakeLocked = false;
        t.isCreatorStakeLocked = false;
        t.status = TaskStatus.Cancelled;

        _applyCancellationPenalty(registry, t.member, t.creator);
        
        users.__taskFailCounter(t.member, t.creator);

        emit TaskEvent(taskId, user, "TaskCancelled", 0, 0);
    }

    // --- Trigger Deadline ---
    function triggerDeadline(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        IAddressRegistry registry,
        uint256 taskId
    ) external {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (!t.exists) revert TaskNotExist();
        if (s.status == SubmitStatus.Pending) revert SubmissionError();
        if (t.status != TaskStatus.InProgres) revert InvalidStatus();
        if (t.deadlineAt == 0) revert InvalidDeadline();
        if (block.timestamp < t.deadlineAt) revert DeadlineNotExceeded();

        IDataContract dataContract = IDataContract(registry.__dataContract());
        IUsers users = IUsers(registry.__usersContract());

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

        _applyDeadlinePenalty(registry, t.member, t.creator);
        
        users.__taskFailCounter(t.creator, t.member);

        emit TaskEvent(taskId, address(0), "DeadlineTriggered", 0, 0);
    }

    // --- Request Join ---
    function requestJoinTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        IAddressRegistry registry,
        uint256 taskId,
        address user,
        uint256 msgValue
    ) external {
        TaskData storage t = tasks[taskId];
        
        if (!t.exists) revert TaskNotExist();
        if (t.status != TaskStatus.OpenRegistration) revert InvalidStatus();
        if (user == t.creator) revert("CannotJoinOwnTask");
        
        JoinRequestData[] storage reqs = joinRequests[taskId];
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].applicant == user && reqs[i].isPending) {
                revert AlreadyRequested();
            }
        }

        uint256 requiredStake = (t.reward * 
            IDataContract(registry.__dataContract()).__getMemberStakeFromRewardPercentage()) / 100;
        
        if (msgValue != requiredStake) revert InvalidStake();

        joinRequests[taskId].push(JoinRequestData({
            applicant: user,
            stakeAmount: msgValue,
            status: UserTask.Request,
            isPending: true,
            hasWithdrawn: false
        }));

        emit TaskEvent(taskId, user, "JoinRequested", msgValue, 0);
    }

    // --- Approve Join Request ---
    function approveJoinRequest(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        IAddressRegistry registry,
        uint256 taskId,
        address applicant,
        address caller
    ) external {
        TaskData storage t = tasks[taskId];
        
        if (!t.exists) revert TaskNotExist();
        if (t.creator != caller) revert NotTaskCreator();

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

        if (!found) revert NoPendingRequest();

        t.deadlineAt = block.timestamp + (uint256(t.deadlineHours) * 1 hours);
        t.status = TaskStatus.InProgres;

        emit TaskEvent(taskId, applicant, "JoinApproved", 0, 0);
    }

    // --- Reject Join Request ---
    function rejectJoinRequest(
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        IAddressRegistry registry,
        uint256 taskId,
        address applicant,
        address caller
    ) external {
        JoinRequestData[] storage requests = joinRequests[taskId];
        bool found = false;

        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].applicant == applicant && requests[i].isPending) {
                requests[i].isPending = false;
                requests[i].status = UserTask.Rejected;
                uint256 stake = requests[i].stakeAmount;
                requests[i].stakeAmount = 0;
                requests[i].hasWithdrawn = true;
                IUsers(registry.__usersContract()).__addUserBalance(applicant, stake);
                found = true;
                break;
            }
        }
        
        if (!found) revert NoPendingRequest();
        
        emit TaskEvent(taskId, applicant, "JoinRejected", 0, 0);
    }

    // --- Withdraw Join Request ---
    function withdrawJoinRequest(
        mapping(uint256 => JoinRequestData[]) storage joinRequests,
        IAddressRegistry registry,
        uint256 taskId,
        address user
    ) external {
        JoinRequestData[] storage reqs = joinRequests[taskId];
        
        for (uint i = 0; i < reqs.length; i++) {
            if (reqs[i].applicant == user && reqs[i].isPending && !reqs[i].hasWithdrawn) {
                reqs[i].isPending = false;
                reqs[i].status = UserTask.Cancelled;
                reqs[i].hasWithdrawn = true;
                uint256 stake = reqs[i].stakeAmount;
                reqs[i].stakeAmount = 0;
                IUsers(registry.__usersContract()).__addUserBalance(user, stake);
                emit TaskEvent(taskId, user, "JoinWithdrawn", stake, 0);
                return;
            }
        }
        revert NoPendingRequest();
    }

    // --- Submit Task ---
    function requestSubmitTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        IAddressRegistry registry,
        uint256 taskId,
        string calldata pullRequestURL,
        string calldata note,
        address user
    ) external {
        TaskData storage t = tasks[taskId];
        
        if (!t.exists) revert TaskNotExist();
        if (t.member != user) revert NotTaskMember();
        if (t.status != TaskStatus.InProgres) revert InvalidStatus();

        TaskSubmitData storage s = submits[taskId];
        if (s.sender != address(0) && s.status == SubmitStatus.Pending) {
            revert SubmissionError();
        }

        submits[taskId] = TaskSubmitData({
            githubURL: pullRequestURL,
            sender: user,
            note: note,
            status: SubmitStatus.Pending,
            revisionTime: 0,
            newDeadline: t.deadlineAt
        });

        emit TaskEvent(taskId, user, "TaskSubmitted", 0, 0);
    }

    // --- Resubmit Task ---
    function reSubmitTask(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        IAddressRegistry registry,
        uint256 taskId,
        string calldata note,
        string calldata githubFixedURL,
        address user
    ) external {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (!t.exists) revert TaskNotExist();
        if (s.sender == address(0)) revert SubmissionError();
        if (t.member != user) revert NotTaskMember();
        if (s.status != SubmitStatus.RevisionNeeded) revert InvalidStatus();

        if (s.revisionTime > t.maxRevision) {
            if (s.status == SubmitStatus.Pending) {
                revert SubmissionError();
            } else {
                // Panggil fungsi approveTask yang sudah didefinisikan di awal
                approveTask(tasks, submits, registry, taskId, t.creator);
                return;
            }
        }

        s.note = note;
        s.status = SubmitStatus.Pending;
        s.githubURL = githubFixedURL;

        emit TaskEvent(taskId, user, "TaskReSubmitted", 0, 0);
    }

    // --- Request Revision ---
    function requestRevision(
        mapping(uint256 => TaskData) storage tasks,
        mapping(uint256 => TaskSubmitData) storage submits,
        IAddressRegistry registry,
        uint256 taskId,
        string calldata note,
        uint256 additionalDeadlineHours
    ) external {
        TaskData storage t = tasks[taskId];
        TaskSubmitData storage s = submits[taskId];

        if (!t.exists) revert TaskNotExist();
        if (s.status != SubmitStatus.Pending) revert InvalidStatus();

        uint256 additionalSeconds = (additionalDeadlineHours * 1 hours);

        s.status = SubmitStatus.RevisionNeeded;
        s.note = note;
        s.revisionTime++;
        t.deadlineAt = block.timestamp + additionalSeconds;

        if (s.revisionTime > t.maxRevision) {
            if (s.status == SubmitStatus.Pending) {
                revert SubmissionError();
            } else {
                // Panggil fungsi approveTask yang sudah didefinisikan di awal
                approveTask(tasks, submits, registry, taskId, t.creator);
                return;
            }
        }

        IUsers users = IUsers(registry.__usersContract());
        IDataContract data = IDataContract(registry.__dataContract());

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

        emit TaskEvent(taskId, address(0), "RevisionRequested", s.revisionTime, t.deadlineAt);
    }

    // --- Delete Task ---
    function deleteTask(
        mapping(uint256 => TaskData) storage tasks,
        IAddressRegistry registry,
        uint256 taskId,
        address user
    ) external {
        TaskData storage t = tasks[taskId];
        
        if (!t.exists) revert TaskNotExist();

        t.status = TaskStatus.Cancelled;
        t.isCreatorStakeLocked = false;
        t.exists = false;

        IUsers(registry.__usersContract()).__addUserBalance(user, t.reward);
        if (t.creatorStake > 0) {
            IUsers(registry.__usersContract()).__addUserBalance(user, t.creatorStake);
        }

        emit TaskEvent(taskId, user, "TaskDeleted", 0, 0);
    }

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================
    
    function getMemberRequiredStake(
        mapping(uint256 => TaskData) storage tasks,
        IAddressRegistry registry,
        uint256 taskId
    ) external view returns (uint256) {
        TaskData storage t = tasks[taskId];
        if (!t.exists) revert TaskNotExist();
        return (t.reward * IDataContract(registry.__dataContract()).__getMemberStakeFromRewardPercentage()) / 100;
    }

    function getCounterPenalty(
        IAddressRegistry registry
    ) external view returns (uint64) {
        return uint64(100) - IDataContract(registry.__dataContract()).__getNegPenalty();
    }

    // =============================================================
    // INTERNAL HELPERS
    // =============================================================

    function _getProjectValue(
        IAddressRegistry registry,
        uint32 deadlineHours,
        uint8 maxRevision,
        uint256 rewardWei,
        address caller
    ) private view returns (uint256) {
        IDataContract data = IDataContract(registry.__dataContract());
        IUsers users = IUsers(registry.__usersContract());
        
        uint256 rewardEther = rewardWei / 1 ether;
        
        uint256 pos = (data.__getRewardScore() * rewardEther) + 
                      (data.__getRevisionScore() * maxRevision);
        
        uint256 neg = (data.__getReputationScore() * users.__getUserReputation(caller)) + 
                      (data.__getDeadlineScore() * deadlineHours);
        
        uint256 rawValue = (pos > neg) ? pos - neg : 0;
        
        return (rawValue * 1 ether) / 100;
    }

    function _getCreatorStake(
        IAddressRegistry registry,
        uint32 deadlineHours,
        uint8 maxRevision,
        uint256 rewardWei,
        address caller
    ) private view returns (uint256) {
        uint256 category = _getProjectValue(registry, deadlineHours, maxRevision, rewardWei, caller);
        
        return (category * IDataContract(registry.__dataContract())
            .__getCreatorStakeFromProjectValuePercentage()) / 100;
    }

    function _applyCancellationPenalty(
        IAddressRegistry registry,
        address member,
        address creator
    ) private {
        IUsers users = IUsers(registry.__usersContract());
        IDataContract data = IDataContract(registry.__dataContract());

        if (users.__isRegistered(member)) {
            uint256 rep = users.__getUserReputation(member);
            if (rep < data.__getCancelByMe()) {
                users.__penaltyIsBiggerThanReputation(member);
            } else {
                users.__cancelByMeRep(member);
            }
        }
    }

    function _applyDeadlinePenalty(
        IAddressRegistry registry,
        address member,
        address creator
    ) private {
        IUsers users = IUsers(registry.__usersContract());
        IDataContract data = IDataContract(registry.__dataContract());

        if (users.__isRegistered(member) && users.__isRegistered(creator)) {
            uint256 memberRep = users.__getUserReputation(member);
            uint256 creatorRep = users.__getUserReputation(creator);

            if (creatorRep < data.__getDeadlineHitCreator()) {
                users.__penaltyIsBiggerThanReputation(creator);
            }
            if (memberRep < data.__getDeadlineHitMember()) {
                users.__penaltyIsBiggerThanReputation(member);
            }

            users.__deadlineHitRep(member, creator);
        }
    }
}