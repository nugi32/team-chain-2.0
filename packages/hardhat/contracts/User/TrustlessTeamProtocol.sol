// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/utils/addressUtils.sol";
import "../system/utils/ReentrancyGuard.sol";
import "../Pipe/AccesControlPipes.sol";
import "../system/interfaces/IDataContract.sol";
import "../system/interfaces/IAddressRegistry.sol";
import "../system/interfaces/CTCcall/IUsers.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title TrustlessTeamProtocol v2 (Patched, documented)
 * @author nugi
 * @notice Protocol to create tasks, allow registration/joining, staking and pull-pay reward flows with reputation.
 * @dev Upgradeable contract (UUPS). Uses AccesControl for owner/employee/user roles.
 *
 * Key design points:
 *  - Pull payments: users call withdraw() to claim funds.
 *  - Creator provides reward (in ETH), plus creatorStake and fee in msg.value when creating task.
 *  - Member stakes when requesting to join (stake is returned/used depending on outcome).
 *  - Deadlines are handled via timestamp `deadlineAt`.
 *  - Reputation points and counters are tracked per-user.
 *  - Fee (protocol share) stored in `feeCollected` and withdrawn manually by employees.
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
    // ENUMS
    // =============================================================

    /// @notice Task lifecycle status
    enum TaskStatus { 
        NonExistent, 
        Created, 
        Active, 
        OpenRegistration, 
        InProgres, 
        Completed, 
        Cancelled 
    }

    /// @notice Join/submission state per user relative to a task
    enum UserTask { 
        None, 
        Request, 
        Accepted, 
        Rejected, 
        Cancelled 
    }

    /// @notice Submission status for task deliverables
    enum SubmitStatus { 
        NoneStatus, 
        Pending, 
        RevisionNeeded, 
        Accepted 
    }

    // =============================================================
    // STRUCTS
    // =============================================================

    /// @notice Core task data structure
    struct Task {
        uint256 taskId;              /// @dev Unique task identifier
        TaskStatus status;           /// @dev Current task status
        uint256 value;             /// @dev Calculated task value category
        address creator;             /// @dev Task creator address
        address member;              /// @dev Assigned member address
        string title;                /// @dev Task title
        string githubURL;            /// @dev Original GitHub URL/reference
        uint256 reward;              /// @dev Reward amount in wei
        uint32 deadlineHours;        /// @dev Deadline duration in hours
        uint256 deadlineAt;          /// @dev Unix timestamp when deadline expires
        uint256 createdAt;           /// @dev Task creation timestamp
        uint256 creatorStake;        /// @dev Creator's stake amount in wei
        uint256 memberStake;         /// @dev Member's stake amount in wei
        uint8 maxRevision;           /// @dev Maximum allowed revisions
        bool isMemberStakeLocked;    /// @dev Member stake lock status
        bool isCreatorStakeLocked;   /// @dev Creator stake lock status
        bool isRewardClaimed;        /// @dev Reward distribution status
        bool exists;                 /// @dev Task existence flag
    }

    /// @notice Applicant join request for a task
    struct JoinRequest {
        address applicant;           /// @dev Applicant address
        uint256 stakeAmount;         /// @dev Stake amount provided
        UserTask status;             /// @dev Request status
        bool isPending;              /// @dev Pending approval flag
        bool hasWithdrawn;           /// @dev Stake withdrawal status
    }

    /// @notice Task submission record
    struct TaskSubmit {
        string githubURL;            /// @dev Submission GitHub URL
        address sender;              /// @dev Submitter address
        string note;                 /// @dev Submission notes/description
        SubmitStatus status;         /// @dev Submission status
        uint8 revisionTime;          /// @dev Current revision count
        uint256 newDeadline;         /// @dev Extended deadline timestamp
    }

    // =============================================================
    // STATE VARIABLES
    // =============================================================

    /// @dev Task ID to submission mapping
    mapping(uint256 => TaskSubmit) public TaskSubmits;

    /// @dev Task ID to Task mapping
    mapping(uint256 => Task) public Tasks;

    /// @dev Task ID to join requests array mapping
    mapping(uint256 => JoinRequest[]) public joinRequests;

    /// @dev Sequential task counter
    uint256 public taskCounter;

    /// @dev Accumulated protocol fees
    uint256 public feeCollected;

    IAddressRegistry public addressRegistry;

    /// @dev Storage gap for future upgrades
    uint256[40] private ___gap;

//   // =============================================================
    // EVENTS
    // =============================================================

    // Payments / system events
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
//
    // =============================================================
    // INITIALIZER
    // =============================================================


    function initialize(
        address _registryAddress
    ) public initializer {
        // Validate input addresses
        if (_registryAddress == address(0)) revert systemError("ZeroAddress");

        // Initialize parent contracts
        //__UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Set up access control and state variables
        addressRegistry = IAddressRegistry(_registryAddress);

        taskCounter = 0;
        feeCollected = 0;
    }

    // =============================================================
    // TASK LIFECYCLE - CREATION & ACTIVATION
    // =============================================================

    /**
     * @notice Creates a new task with initial parameters
     * @param Title Task title/description
     * @param GithubURL Reference GitHub URL for the task
     * @param DeadlineHours Deadline duration in hours
     * @param MaximumRevision Maximum number of allowed revisions
     * @dev Creates task in Created status, requires reward amount in msg.value
     */
    function createTask(
        string memory Title,
        string memory GithubURL,
        uint32 DeadlineHours,
        uint8 MaximumRevision,
        address user
    ) external payable whenNotPaused onlyRegistered nonReentrant  onlyUser(addressRegistry.__accessControlContract()) {
        if (user == address(0)) revert systemError("ZeroAddress");
        
        // Increment and get new task ID
        taskCounter++;
        uint256 taskId = taskCounter;

        // Create new task
        Tasks[taskId] = Task({
            taskId: taskId,
            status: TaskStatus.Created,
            value: ___getProjectValue(DeadlineHours, MaximumRevision, msg.value, user),
            creator: user,
            member: address(0),
            title: Title,
            githubURL: GithubURL,
            reward: msg.value,
            deadlineHours: DeadlineHours,
            deadlineAt: 0, // Set when member is assigned
            createdAt: block.timestamp,
            creatorStake: 0,
            memberStake: 0,
            maxRevision: MaximumRevision,
            isMemberStakeLocked: false,
            isCreatorStakeLocked: false,
            isRewardClaimed: false,
            exists: true
        });

        // Update creator statistics
        IUsers(addressRegistry.__usersContract()).__taskCreateCounter(user);

        emit userEvent("TaskCreated", taskId, user, msg.value, 0, 0, Title, 0);
    }

     function deleteTask(uint256 taskId, address user) external nonReentrant onlyRegistered {
        if (!Tasks[taskId].exists) revert systemError("TaskDoesNotExist");
        
        Task storage t = Tasks[taskId];

        t.status = TaskStatus.Cancelled;
        t.isCreatorStakeLocked = false;
        t.exists = false;

        IUsers(addressRegistry.__usersContract()).__addUserBalance(user, t.reward);
        if (t.creatorStake > 0) {
            IUsers(addressRegistry.__usersContract()).__addUserBalance(user, t.creatorStake);
        }
        emit userEvent("TaskDeleted", taskId, user, 0, 0, 0, "", 0);
    }

    /**
     * @notice Activates a task by providing creator stake
     * @param taskId ID of the task to activate
     * @dev Moves task to Active status, requires calculated creator stake in msg.value
     */
    function activateTask(uint256 taskId) external payable taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        Task storage t = Tasks[taskId];
        
        // Validate task state and stake amount
        if (t.status != TaskStatus.Created) revert systemError("TaskNotOpen");
        if (msg.value != ___getCreatorStake(t.deadlineHours, t.maxRevision, t.reward, t.creator)) revert systemError("StakeMismatch");

        // Calculate and deduct protocol fee
        uint256 totalFee = (msg.value * IDataContract(addressRegistry.__dataContract()).__getFeePercentage()) / 100;
        t.creatorStake = msg.value - totalFee;
        
        // Update task state
        t.status = TaskStatus.Active;
        t.isCreatorStakeLocked = true;
        feeCollected += totalFee;
        
        emit userEvent("TaskActive", taskId, t.creator, 0, 0, 0, "", 0);
    }

    // =============================================================
    // TASK LIFECYCLE - REGISTRATION & JOINING
    // =============================================================

    /**
     * @notice Opens task for member registration
     * @param taskId ID of the task to open for registration
     * @dev Changes task status to OpenRegistration allowing join requests
     */
    function openRegistration(uint256 taskId) external taskExists(taskId) onlyTaskCreator(taskId) whenNotPaused {
        Task storage t = Tasks[taskId];
        if (t.status != TaskStatus.Active) revert systemError("TaskNotOpen");
        t.status = TaskStatus.OpenRegistration;
        emit userEvent("RegistrationOpened", taskId, t.creator, 0, 0, 0, "", 0);
    }

    /**
     * @notice Closes task registration
     * @param taskId ID of the task to close registration for
     * @dev Returns task to Active status, preventing new join requests
     */
    function closeRegistration(uint256 taskId) external taskExists(taskId) onlyTaskCreator(taskId) whenNotPaused {
        Task storage t = Tasks[taskId];
        if (t.status != TaskStatus.OpenRegistration) revert systemError("TaskNotOpen");
        t.status = TaskStatus.Active;
        emit userEvent("RegistrationClosed", taskId, t.creator, 0, 0, 0, "", 0);
    }

    /**
     * @notice Requests to join a task by providing required stake
     * @param taskId ID of the task to join
     * @dev Requires exact member stake amount in msg.value, creates pending join request
     */
    function requestJoinTask(uint256 taskId, address user) external payable taskExists(taskId) whenNotPaused onlyRegistered  onlyUser(addressRegistry.__accessControlContract()) {
        if (user == address(0)) revert systemError("ZeroAddress");
        
        Task storage t = Tasks[taskId];
        JoinRequest[] storage reqs = joinRequests[taskId];

        // Check for duplicate pending requests
        for (uint256 i = 0; i < reqs.length; ++i) {
            if (reqs[i].applicant == user && reqs[i].isPending) revert systemError("AlreadyRequestedJoin");
        }

        // Validate task state and permissions
        if (t.status != TaskStatus.OpenRegistration) revert systemError("TaskNotOpen");
        if (user == t.creator) revert systemError("TaskNotOpen");

        // Validate stake amount
        uint256 memberStake = getMemberRequiredStake(taskId);
        if ( IDataContract(addressRegistry.__dataContract()).__getMaxStake() < memberStake) revert systemError("StakeHitLimit");
        if (msg.value != memberStake) revert systemError("InsufficientStake");

        // Create new join request
        joinRequests[taskId].push(JoinRequest({
            applicant: user,
            stakeAmount: msg.value,
            status: UserTask.Request,
            isPending: true,
            hasWithdrawn: false
        }));

        emit userEvent("JoinRequested", taskId, user, msg.value, 0, 0, "", 0);
    }

    /**
     * @notice Withdraws a pending join request and returns stake
     * @param taskId ID of the task to withdraw join request from
     * @dev Returns stake to user's withdrawable balance
     */
    function withdrawJoinRequest(uint256 taskId, address user) external nonReentrant onlyRegistered {
        JoinRequest[] storage reqs = joinRequests[taskId];
        
        // Find and process pending request
        for (uint256 i = 0; i < reqs.length; ++i) {
            if (reqs[i].applicant == user && reqs[i].isPending && !reqs[i].hasWithdrawn) {
                reqs[i].isPending = false;
                reqs[i].status = UserTask.Cancelled;
                reqs[i].hasWithdrawn = true;
                uint256 stake = reqs[i].stakeAmount;
                reqs[i].stakeAmount = 0;
                IUsers(addressRegistry.__usersContract()).__addUserBalance(user, stake);
                emit userEvent("JoinrequestCancelled", taskId, user, stake, 0, 0, "", 0);
                return;
            }
        }
        revert systemError("NoPendingRequest");
    }

    /**
     * @notice Approves a join request and assigns member to task
     * @param taskId ID of the task
     * @dev Locks member stake, sets deadline, and moves task to InProgress status
     */
    function approveJoinRequest(uint256 taskId, address applicant) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        JoinRequest[] storage requests = joinRequests[taskId];
        Task storage t = Tasks[taskId];
        bool found = false;

        // Find and approve the request
        for (uint256 i = 0; i < requests.length; ++i) {
            if (requests[i].applicant == applicant && requests[i].isPending) {
                requests[i].isPending = false;
                requests[i].status = UserTask.Accepted;
                
                // Assign member and lock stakes
                t.member = requests[i].applicant;
                t.memberStake = requests[i].stakeAmount;
                requests[i].stakeAmount = 0;
                requests[i].hasWithdrawn = true;
                t.isMemberStakeLocked = true;
                found = true;
                break;
            }
        }
        if (!found) revert systemError("NoPendingRequest");

        // Set task deadline and update status
        t.deadlineAt = block.timestamp + (uint256(t.deadlineHours) * 1 hours);
        t.status = TaskStatus.InProgres;

        emit userEvent("JoinApproved", taskId, t.member, 0, 0, 0, "", 0);
    }

    /**
     * @notice Rejects a join request and returns stake to applicant
     * @param taskId ID of the task
     * @param _applicant Address of the applicant to reject
     * @dev Returns stake to applicant's withdrawable balance
     */
    function rejectJoinRequest(uint256 taskId, address _applicant) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant whenNotPaused {
        JoinRequest[] storage requests = joinRequests[taskId];
        bool found = false;

        // Find and reject the request
        for (uint256 i = 0; i < requests.length; ++i) {
            if (requests[i].applicant == _applicant && requests[i].isPending) {
                requests[i].isPending = false;
                requests[i].status = UserTask.Rejected;
                uint256 stake = requests[i].stakeAmount;
                requests[i].stakeAmount = 0;
                requests[i].hasWithdrawn = true;
                IUsers(addressRegistry.__usersContract()).__addUserBalance(_applicant, stake);
                found = true;
                break;
            }
        }
        if (!found) revert systemError("NoPendingRequest");
        
        emit userEvent("JoinRejected", taskId, _applicant, 0, 0, 0, "", 0);
    }

    // =============================================================
    // TASK CANCELLATION
    // =============================================================

    /**
     * @notice Cancels a task by either party with penalty distribution
     * @param taskId ID of the task to cancel
     * @dev Applies penalties based on who initiates cancellation and updates reputation
     */
    function cancelByMe(uint256 taskId, address user) external taskExists(taskId) nonReentrant  onlyUser(addressRegistry.__accessControlContract()) whenNotPaused {
        if (user == address(0)) revert systemError("ZeroAddress");
        
        Task storage t = Tasks[taskId];

        // Validate permissions and state
        if (user != t.creator && user != t.member) revert systemError("NotCounterparty");
        if (t.status != TaskStatus.InProgres) revert systemError("TaskNotOpen");

        if (user == t.member) {
            // Member cancellation: member loses portion of stake to creator
            uint256 penaltyToCreator = (t.memberStake * IDataContract(addressRegistry.__dataContract()).__getNegPenalty()) / 100;
            uint256 memberReturn = (t.memberStake * __getCounterPenalty() / 100);

            // Distribute funds
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, t.creatorStake + t.reward + penaltyToCreator);
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, memberReturn);

            // Unlock stakes
            t.isMemberStakeLocked = false;
            t.isCreatorStakeLocked = false;
        } else {
            // Creator cancellation: creator loses portion of stake to member
            if (t.member == address(0)) revert systemError("CancelOnlyWhenMemberAssigned");

            uint256 penaltyToMember = (t.creatorStake * IDataContract(addressRegistry.__dataContract()).__getNegPenalty()) / 100;
            uint256 creatorReturn = (t.creatorStake * __getCounterPenalty() / 100) + t.reward;

            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, t.memberStake + penaltyToMember);
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, creatorReturn);

            t.isMemberStakeLocked = false;
            t.isCreatorStakeLocked = false;
        }

        // Update task status
        t.status = TaskStatus.Cancelled;

        // Apply reputation penalty
        if (IUsers(addressRegistry.__usersContract()).__isRegistered(t.member)) {
            uint256 userReputation = IUsers(addressRegistry.__usersContract()).__getUserReputation(t.member);
            if (userReputation < IDataContract(addressRegistry.__dataContract()).__getCancelByMe()) {
                IUsers(addressRegistry.__usersContract()).__penaltyIsBiggerThanReputation(t.member);
            } else {
                IUsers(addressRegistry.__usersContract()).__cancelByMeRep(t.member);
            }
        }

        // Update failure counter
        IUsers(addressRegistry.__usersContract()).__taskFailCounter(t.member, t.creator);

        emit userEvent("TaskCancelledByMe", taskId, user, 0, 0, 0, "", 0);
    }

    // =============================================================
    // SUBMISSION & APPROVAL FLOW
    // =============================================================

    /**
     * @notice Submits task completion by member
     * @param taskId ID of the task
     * @param PullRequestURL GitHub URL of the submission
     * @param Note Description/notes about the submission
     * @dev Creates submission record in Pending status for creator review
     */
    function requestSubmitTask(uint256 taskId, string calldata PullRequestURL, string calldata Note, address user)
        external
        taskExists(taskId)
        onlyTaskMember(taskId)
        whenNotPaused
        onlyUser(addressRegistry.__accessControlContract())
    {
        if (user == address(0)) revert systemError("ZeroAddress");
        
        Task storage t = Tasks[taskId];
        
        // Validate task state and input
        if (t.status != TaskStatus.InProgres) revert systemError("TaskNotOpen");
        if (t.member != user) revert systemError("NotTaskMember");

        TaskSubmit storage s = TaskSubmits[taskId];
        if (s.sender != address(0) && s.status == SubmitStatus.Pending) revert systemError("SubmissionAlreadyPending");

        // Create submission record
        TaskSubmits[taskId] = TaskSubmit({
            githubURL: PullRequestURL,
            sender: user,
            note: Note,
            status: SubmitStatus.Pending,
            revisionTime: 0,
            newDeadline: t.deadlineAt
        });

        emit userEvent("TaskSubmitted", taskId, user, 0, 0, 0, PullRequestURL, 0);
    }

    /**
     * @notice Resubmits task after revision request
     * @param taskId ID of the task
     * @param Note Updated submission notes
     * @param GithubFixedURL Updated GitHub URL
     * @dev Updates submission and returns it to Pending status
     */
    function reSubmitTask(uint256 taskId, string calldata Note, string calldata GithubFixedURL, address user)
        external
        taskExists(taskId)
        onlyTaskMember(taskId)
        whenNotPaused
        onlyUser(addressRegistry.__accessControlContract())
    {
        if (user == address(0)) revert systemError("ZeroAddress");
        
        Task storage t = Tasks[taskId];
        TaskSubmit storage s = TaskSubmits[taskId];

        // Validate submission state
        if (s.sender == address(0)) revert systemError("NoSubmision");
        if (t.member != user) revert systemError("NotTaskMember");
        if (s.status != SubmitStatus.RevisionNeeded) revert systemError("TaskNotOpen");

        // Auto-approve if revision limit exceeded
        if (s.revisionTime > t.maxRevision) {
            if (s.status == SubmitStatus.Pending) {
                revert systemError("AlreadyInPending");
            } else {
                __approveTask(taskId);
                return;
            }
        }

        // Validate input and update submission
        s.note = Note;
        s.status = SubmitStatus.Pending;
        s.githubURL = GithubFixedURL;

        emit userEvent("TaskReSubmitted", taskId, user, 0, 0, 0, GithubFixedURL, 0);
    }

    /**
     * @notice Requests revision for a submission
     * @param taskId ID of the task
     * @param Note Revision instructions/feedback
     * @param additionalDeadlineHours Additional hours for revised deadline
     * @dev Extends deadline and applies reputation penalties to both parties
     */
    function requestRevision(uint256 taskId, string calldata Note, uint256 additionalDeadlineHours)
        external
        whenNotPaused
    {
        Task storage t = Tasks[taskId];
        TaskSubmit storage s = TaskSubmits[taskId];

        // Validate state and input
        if (!t.exists) revert systemError("TaskDoesNotExist");
        if (s.status != SubmitStatus.Pending) revert systemError("TaskNotOpen");

        // Calculate new deadline
        uint256 additionalSeconds = (additionalDeadlineHours * 1 hours);

        // Update submission state
        s.status = SubmitStatus.RevisionNeeded;
        s.note = Note;
        s.revisionTime++;
        t.deadlineAt = block.timestamp + additionalSeconds;

        // Auto-approve if revision limit exceeded
        if (s.revisionTime > t.maxRevision) {
            if (s.status == SubmitStatus.Pending) {
                revert systemError("AlreadyInPending");
            } else {
                __approveTask(taskId);
                return;
            }
        }

        // Apply reputation penalties for revision
        if (IUsers(addressRegistry.__usersContract()).__isRegistered(t.member) && IUsers(addressRegistry.__usersContract()).__isRegistered(t.creator)) {
            uint256 userReputation = IUsers(addressRegistry.__usersContract()).__getUserReputation(t.member);
            uint256 creatorReputation = IUsers(addressRegistry.__usersContract()).__getUserReputation(t.creator);

            if (creatorReputation < IDataContract(addressRegistry.__dataContract()).__getRevisionPenalty()) {
                IUsers(addressRegistry.__usersContract()).__penaltyIsBiggerThanReputation(t.creator);
            }

            if (userReputation < IDataContract(addressRegistry.__dataContract()).__getRevisionPenalty()) {
                IUsers(addressRegistry.__usersContract()).__penaltyIsBiggerThanReputation(t.member);
            }
                IUsers(addressRegistry.__usersContract()).__revisionRep(t.member, t.creator);
            
        }

        emit userEvent("RevisionRequested", taskId, address(0), s.revisionTime, t.deadlineAt, 0, Note, 0);
    }

    /**
     * @notice Approves task completion and distributes rewards
     * @param taskId ID of the task to approve
     * @dev External wrapper for internal approval function
     */
    function approveTask(uint256 taskId)
        external
        taskExists(taskId)
        onlyTaskCreator(taskId)
        nonReentrant
        whenNotPaused
    {
        __approveTask(taskId);
    }

    // =============================================================
    // DEADLINE HANDLING
    // =============================================================

    /**
     * @notice Triggers deadline consequences for expired tasks
     * @param taskId ID of the task to trigger deadline for
     * @dev Can be called by anyone, distributes stakes with penalties
     */
    function triggerDeadline(uint256 taskId) public taskExists(taskId) whenNotPaused nonReentrant {
        Task storage t = Tasks[taskId];
        TaskSubmit storage s = TaskSubmits[taskId];

        // Validate deadline conditions
        if (s.status == SubmitStatus.Pending) revert systemError("AlreadyInPending");
        if (t.status != TaskStatus.InProgres) revert systemError("TaskNotOpen");
        if (t.deadlineAt == 0) revert systemError("InvalidDeadline");
        if (block.timestamp < t.deadlineAt) revert systemError("DeadlineNotExceeded");

        // Distribute stakes with penalties
        if (t.member != address(0) && t.memberStake > 0) {
            uint256 toMember = (t.memberStake * IDataContract(addressRegistry.__dataContract()).__getNegPenalty()) / 100;
            uint256 toCreator = (t.memberStake * __getCounterPenalty() / 100);

            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, toMember);
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, toCreator + t.creatorStake + t.reward);

            // Unlock stakes
            t.isMemberStakeLocked = false;
            t.isCreatorStakeLocked = false;
        } else {
            // No member assigned, return funds to creator
            IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, t.creatorStake + t.reward);
            t.isMemberStakeLocked = false;
            t.isCreatorStakeLocked = false;
        }

        // Apply reputation penalties
        if (IUsers(addressRegistry.__usersContract()).__isRegistered(t.member) && IUsers(addressRegistry.__usersContract()).__isRegistered(t.creator)) {
            uint256 memberReputation = IUsers(addressRegistry.__usersContract()).__getUserReputation(t.member);
            uint256 creatorReputation = uint256(IUsers(addressRegistry.__usersContract()).__getUserReputation(t.creator));

            if  (creatorReputation < IDataContract(addressRegistry.__dataContract()).__getDeadlineHitCreator()) {
                IUsers(addressRegistry.__usersContract()).__penaltyIsBiggerThanReputation(t.creator);
            }
            if (memberReputation < IDataContract(addressRegistry.__dataContract()).__getDeadlineHitMember()) {
                IUsers(addressRegistry.__usersContract()).__penaltyIsBiggerThanReputation(t.member);
            }

            IUsers(addressRegistry.__usersContract()).__deadlineHitRep(t.member, t.creator);
        }

        // Update task state and counters
        t.status = TaskStatus.Cancelled;
        IUsers(addressRegistry.__usersContract()).__taskFailCounter(t.creator, t.member);

        emit userEvent("DeadlineTriggered", taskId, address(0), 0, 0, 0, "", 0);
    }












    // =============================================================
    // INTERNAL HELPERS
    // =============================================================


    function ___getProjectValue(
        uint32 DeadlineHours,
        uint8 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) internal view returns (uint256) {
        
        // Convert reward to ether units for calculation
        uint256 rewardEtherUnits = rewardWei / 1 ether;
        
        // Calculate positive factors (reward and revisions)
        uint256 pos = (IDataContract(addressRegistry.__dataContract()).__getRewardScore() * rewardEtherUnits) + ((IDataContract(addressRegistry.__dataContract()).__getRevisionScore() * MaximumRevision));
        
        // Calculate negative factors (reputation and deadline)
        uint256 neg = (IDataContract(addressRegistry.__dataContract()).__getReputationScore() * IUsers(addressRegistry.__usersContract()).__getUserReputation(Caller)) + (IDataContract(addressRegistry.__dataContract()).__getDeadlineScore() * DeadlineHours);
        
        uint256 rawValue;

        // Calculate raw value (ensure non-negative)
        if (pos <= neg) {    
            rawValue = 0;
        } else {
            rawValue = pos - neg;
        }
        
        // Normalize value
        uint256 _value = (rawValue * 1 ether) / 100;
        return _value;
    }

    function ___getCreatorStake(
        uint32 DeadlineHours,
        uint8 MaximumRevision,
        uint256 rewardWei,
        address Caller
    ) public view returns (uint256) {
        uint256 category = ___getProjectValue(DeadlineHours, MaximumRevision, rewardWei, Caller);

        uint256 creatorStake = (category * IDataContract(addressRegistry.__dataContract()).__getCreatorStakeFromProjectValuePercentage()) / 100;
        
        return creatorStake;
    }

    /**
     * @notice Calculates required member stake for a task
     * @param taskId ID of the task
     * @return Required member stake amount in wei
     */
    function getMemberRequiredStake(uint256 taskId) public view taskExists(taskId) returns (uint256) {
        Task storage t = Tasks[taskId];
        return (t.reward * IDataContract(addressRegistry.__dataContract()).__getMemberStakeFromRewardPercentage()) / 100;
    }

    /**
     * @notice Internal function to approve task and distribute rewards
     * @param taskId ID of the task to approve
     * @dev Distributes rewards, updates reputation, and completes task lifecycle
     */
    function __approveTask(uint256 taskId) internal {
        Task storage t = Tasks[taskId];
        TaskSubmit storage s = TaskSubmits[taskId];

        // Validate task and submission state
        if (t.status != TaskStatus.InProgres) revert systemError("TaskNotOpen");
        if (s.status != SubmitStatus.Pending) revert systemError("TaskNotSubmittedYet");
        if (t.isRewardClaimed == true) revert systemError("AlredyClaimed");
        if (s.sender == address(0)) revert systemError("NoSubmision");

        // Calculate payout amounts
        uint256 memberGet = t.reward + t.memberStake;
        uint256 creatorGet = t.creatorStake;

        // Credit withdrawable balances
        IUsers(addressRegistry.__usersContract()).__addUserBalance(t.member, memberGet);
        IUsers(addressRegistry.__usersContract()).__addUserBalance(t.creator, creatorGet);

        // Update task state
        t.isMemberStakeLocked = false;
        t.isCreatorStakeLocked = false;
        t.isRewardClaimed = true;
        t.status = TaskStatus.Completed;

        // Update reputation
        if (IUsers(addressRegistry.__usersContract()).__isRegistered(t.member) && IUsers(addressRegistry.__usersContract()).__isRegistered(t.creator)) {
            IUsers(addressRegistry.__usersContract()).__taskAcceptRep(t.member, t.creator);
        }


        // Update completion counters
        IUsers(addressRegistry.__usersContract()).__taskCompleteCounter(t.member, t.creator);

        // Clear submission data
        s.githubURL = "";
        s.sender = address(0);
        s.note = "";
        s.status = SubmitStatus.Accepted;
        s.revisionTime = 0;
        s.newDeadline = 0;

        emit userEvent("TaskApproved", taskId, address(0), 0, 0, 0, "", 0);
    }

    /**
     * @notice Calculates counter penalty percentage
     * @return Counter penalty percentage (100 - negative penalty)
     * @dev Used to calculate the portion returned to the non-penalized party
     */
    function __getCounterPenalty() internal view returns (uint64) {
        return uint32(100) - IDataContract(addressRegistry.__dataContract()).__getNegPenalty();
    }

    // =============================================================
    // VIEW FUNCTIONS
    // =============================================================

    /**
     * @notice Checks joint request count
     * @return Length of arr
     */
    function getJoinRequestCount(uint256 taskId) external view returns (uint256) {
        return joinRequests[taskId].length;
    }

    // =============================================================
    // OWNER     FUNCTIONS
    // =============================================================

    /**
     * @notice Withdraws accumulated protocol fees to system wallet
     * @dev Only callable by employees, transfers collected fees to systemWallet
     */
    function withdrawToSystemWallet() external onlyOwner(addressRegistry.__accessControlContract())  nonReentrant whenNotPaused {
        uint256 amount = feeCollected;
        feeCollected = 0;
        (bool ok, ) = addressRegistry.__walletContract().call{value: amount}("");
        if (!ok) revert systemError("WithdrawFailed");
        
        emit systemChangedEvent("withdrawToSystemWallet", address(0), amount);
    }

    /**
     * @notice Pauses contract functionality
     * @dev Only callable by employees, prevents most state-changing functions
     */
    function pause(address caller) external onlyOwner(addressRegistry.__accessControlContract())  {
        if (caller == address(0)) revert systemError("ZeroAddress");
        _pause();
        emit systemChangedEvent("contract paused", caller, 0);
    }

    /**
     * @notice Unpauses contract functionality
     * @dev Only callable by employees, restores normal operation
     */
    function unpause(address caller) external onlyOwner(addressRegistry.__accessControlContract())  {
        if (caller == address(0)) revert systemError("ZeroAddress");
        _unpause();
        emit systemChangedEvent("contract Unpaused", caller, 0);
    }

    // =============================================================
    // FALLBACK FUNCTIONS
    // =============================================================

    /**
     * @notice Receive function - rejects all direct ETH transfers
     */
    receive() external payable {
        revert systemError("DirectEtherTransferNotAllowed");
    }

    /**
     * @notice Fallback function - rejects all unrecognized calls
     */
    fallback() external payable {
        revert systemError("FunctionNotFound");
    }

    // =============================================================
    // UPGRADE AUTHORIZATION
    // =============================================================

    /**
     * @notice Authorizes contract upgrades
     * @param newImplementation Address of the new implementation contract
     * @dev Only callable by owner, implements UUPS upgrade pattern
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner(addressRegistry.__accessControlContract())  whenNotPaused {
        if (newImplementation == address(0)) revert systemError("ZeroAddress");
    }
}