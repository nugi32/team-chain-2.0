// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Utils
import "../Pipe/AccesControlPipes.sol";
import "./utils/addressUtils.sol";

// OpenZeppelin
import "@openzeppelin/contracts/utils/Pausable.sol";

// Interfaces
import "./interfaces/IAddressRegistry.sol";

/**
 * @title StateVariable
 * @notice Contract for managing configurable system state variables, including weights,
 *         stake categories, reputation points, limits, and penalties.
 * @dev Uses AccessControl for permissioning and includes setters restricted to employees.
 *      All monetary values are stored in wei unless specified otherwise.
 */
contract dataContract is MainAccesControlPipes, Pausable, AddressUtils {
    
    // =============================================================
    // Struct Definitions
    // =============================================================

    /**
     * @notice Percentage weights used to calculate reward, reputation, deadlines, and revision impact.
     * @dev All values should sum to 100.
     */
    struct ComponentWeightPercentage {
        uint64 rewardScore;      // Weight for reward component in scoring
        uint64 reputationScore;  // Weight for reputation component in scoring
        uint64 deadlineScore;    // Weight for deadline component in scoring
        uint64 revisionScore;    // Weight for revision component in scoring
    }

    /**
     * @notice Reputation point values based on user actions.
     * @dev Different actions award different reputation points.
     */
    struct ReputationPoint {
        uint64 cancelByMe;           // Points deducted when user cancels their own task
        uint64 revision;             // Points deducted when revision is requested
        uint32 taskAcceptCreator;    // Points awarded to creator when task is accepted
        uint32 taskAcceptMember;     // Points awarded to member when accepting task
        uint32 deadlineHitCreator;   // Points awarded to creator for meeting deadline
        uint32 deadlineHitMember;    // Points awarded to member for meeting deadline
    }

    /**
     * @notice Global system variables, including limits and penalty percentages.
     */
    struct StateVar {
        uint256 maxStake;             // Maximum allowed stake amount (in wei)
        uint256 maxReward;            // Maximum allowed reward amount (in wei)
        uint64 minRevisionTimeInHour; // Minimum time allowed for revisions (in hours)
        uint64 negPenalty;            // Negative penalty percentage (0-99)
        uint64 feePercentage;         // Platform fee percentage (0-99)
        uint64 maxRevision;           // Maximum number of revisions allowed
    }

    /**
     * @notice Predefined stake categories for project classification.
     * @dev Values are stored in wei, strictly ascending order.
     */
    struct ProjectValueCategory {
        uint256 low;          // Low category threshold
        uint256 middleLow;    // Middle-low category threshold
        uint256 middle;       // Middle category threshold
        uint256 middleHigh;   // Middle-high category threshold
        uint256 high;         // High category threshold
        uint256 ultraHigh;    // Ultra-high category threshold
    }

    /**
     * @notice Stake utility percentages for members and creators.
     */
    struct StakeUtil {
        uint128 memberStakePercentageFromReward;   // Member's stake as % of reward
        uint128 creatorStakePercentageFromProjectValue; // Creator's stake as % of project value
    }

    // =============================================================
    // State Variables
    // =============================================================

    ComponentWeightPercentage public componentWeightPercentages;
    ReputationPoint public reputationPoints;
    StateVar public stateVariables;
    ProjectValueCategory public projectCategories;
    StakeUtil public stakeUtils;

    IAddressRegistry public addressRegistry;

    // =============================================================
    // Events
    // =============================================================

    /**
     * @notice Emitted when component weight percentages are updated.
     */
    event ComponentWeightPercentagesChanged(
        uint64 rewardScore,
        uint64 reputationScore,
        uint64 deadlineScore,
        uint64 revisionScore
    );

    /**
     * @notice Emitted when reputation points are updated.
     */
    event ReputationPointsChanged(
        uint64 cancelByMe,
        uint64 revision,
        uint32 taskAcceptCreator,
        uint32 taskAcceptMember,
        uint32 deadlineHitCreator,
        uint32 deadlineHitMember
    );

    /**
     * @notice Emitted when global state variables are updated.
     */
    event StateVariablesChanged(
        uint256 maxStake,
        uint256 maxReward,
        uint64 minRevisionTimeInHour,
        uint64 negPenalty,
        uint64 feePercentage,
        uint64 maxRevision
    );

    /**
     * @notice Emitted when project categories are updated.
     */
    event ProjectCategoriesChanged(
        uint256 low,
        uint256 middleLow,
        uint256 middle,
        uint256 middleHigh,
        uint256 high,
        uint256 ultraHigh
    );

    /**
     * @notice Emitted when stake utilities are updated.
     */
    event StakeUtilsChanged(
        uint128 memberStakePercentageFromReward,
        uint128 creatorStakePercentageFromProjectValue
    );

    /**
     * @notice Emitted when address registry is updated.
     */
    event AddressRegistryChanged(address indexed newAddressRegistry);

    /**
     * @notice Emitted when contract is paused.
     */
    event ContractPaused(address indexed account);

    /**
     * @notice Emitted when contract is unpaused.
     */
    event ContractUnpaused(address indexed account);

    // =============================================================
    // Errors
    // =============================================================

    error StateVariableErr(string errName);
    error InvalidAddress(string errName);

    modifier onlyOwner {
        __onlyOwner(addressRegistry.__accessControlContract());
        _;
    }

    modifier onlyEmployes() {
        __onlyEmployes(addressRegistry.__accessControlContract());  
        _;
    }


    // =============================================================
    // Constructor
    // =============================================================

    /**
     * @notice Initializes the contract with default configuration values.
     * @dev Values that represent ETH must be passed in ether units (e.g., 5 = 5 ETH).
     *      All values are internally converted to wei where appropriate.
     * 
     * @param _rewardScore Weight percentage for reward component
     * @param _reputationScore Weight percentage for reputation component
     * @param _deadlineScore Weight percentage for deadline component
     * @param _revisionScore Weight percentage for revision component
     * @param _cancelByMeRP Reputation points for task cancellation
     * @param _revisionRP Reputation points for revision request
     * @param _taskAcceptCreatorRP Reputation points for creator when task accepted
     * @param _taskAcceptMemberRP Reputation points for member when accepting task
     * @param _deadlineHitCreatorRP Reputation points for creator meeting deadline
     * @param _deadlineHitMemberRP Reputation points for member meeting deadline
     * @param _maxStakeInEther Maximum stake amount in ether
     * @param _maxRewardInEther Maximum reward amount in ether
     * @param _minRevisionTimeInHour Minimum revision time in hours
     * @param _negPenalty Negative penalty percentage
     * @param _feePercentage Platform fee percentage
     * @param _maxRevision Maximum number of revisions
     * @param _lowCategory Low category threshold in ether
     * @param _middleLowCategory Middle-low category threshold in ether
     * @param _middleCategory Middle category threshold in ether
     * @param _middleHighCategory Middle-high category threshold in ether
     * @param _highCategory High category threshold in ether
     * @param _ultraHighCategory Ultra-high category threshold in ether
     * @param _memberStakePercentageFromReward Member stake as % of reward
     * @param _creatorStakePercentageFromProjectValue Creator stake as % of project value
     * @param _addressRegistryContract Address registry contract address
     */
    constructor(
        // Weight Percentages
        uint64 _rewardScore,
        uint64 _reputationScore,
        uint64 _deadlineScore,
        uint64 _revisionScore,

        // Reputation Points
        uint64 _cancelByMeRP,
        uint64 _revisionRP,
        uint32 _taskAcceptCreatorRP,
        uint32 _taskAcceptMemberRP,
        uint32 _deadlineHitCreatorRP,
        uint32 _deadlineHitMemberRP,

        // State Variables
        uint256 _maxStakeInEther,
        uint256 _maxRewardInEther,
        uint64 _minRevisionTimeInHour,
        uint64 _negPenalty,
        uint64 _feePercentage,
        uint64 _maxRevision,

        // Project Categories
        uint256 _lowCategory,
        uint256 _middleLowCategory,
        uint256 _middleCategory,
        uint256 _middleHighCategory,
        uint256 _highCategory,
        uint256 _ultraHighCategory,

        // Stake Utils
        uint128 _memberStakePercentageFromReward,
        uint128 _creatorStakePercentageFromProjectValue,

        // Address Initializer Contract
        address _addressRegistryContract
    ) {
        // Validate weight percentages total
        uint256 totalWeight = _rewardScore + _reputationScore + _deadlineScore + _revisionScore;
        if (totalWeight != 100) revert StateVariableErr("Total weight must be 100");

        // Validate category against max stake
        if (_ultraHighCategory > _maxStakeInEther) {
            revert StateVariableErr("Ultra high category exceeds max stake amount");
        }

        // Validate percentages
        if (_feePercentage >= 100) revert StateVariableErr("Fee percentage cannot be 100");
        if (_negPenalty >= 100) revert StateVariableErr("Negative penalty cannot be 100");
        if (_maxRewardInEther > _maxStakeInEther) revert StateVariableErr("Max reward exceeds max stake amount");

        // Validate stake percentages
        if (_memberStakePercentageFromReward >= 100 || _creatorStakePercentageFromProjectValue >= 100) {
            revert StateVariableErr("Stake percentage cannot be 100");
        }

        // Validate project categories order
        if (_lowCategory >= _middleLowCategory || 
            _middleLowCategory >= _middleCategory || 
            _middleCategory >= _middleHighCategory || 
            _middleHighCategory >= _highCategory || 
            _highCategory >= _ultraHighCategory) {
            revert StateVariableErr("Invalid project category order");
        }

        if (_addressRegistryContract == address(0)) {
            revert InvalidAddress("Address registry contract is zero address");
        }

        // Initialize component weight percentages
        componentWeightPercentages = ComponentWeightPercentage({
            rewardScore: _rewardScore,
            reputationScore: _reputationScore,
            deadlineScore: _deadlineScore,
            revisionScore: _revisionScore
        });

        // Initialize reputation points
        reputationPoints = ReputationPoint({
            cancelByMe: _cancelByMeRP,
            revision: _revisionRP,
            taskAcceptCreator: _taskAcceptCreatorRP,
            taskAcceptMember: _taskAcceptMemberRP,
            deadlineHitCreator: _deadlineHitCreatorRP,
            deadlineHitMember: _deadlineHitMemberRP
        });

        // Initialize state variables (convert to wei)
        stateVariables = StateVar({
            maxStake: _maxStakeInEther * 1 ether,
            maxReward: _maxRewardInEther * 1 ether,
            minRevisionTimeInHour: _minRevisionTimeInHour,
            negPenalty: _negPenalty,
            feePercentage: _feePercentage,
            maxRevision: _maxRevision
        });

        // Initialize project categories (convert to wei)
        projectCategories = ProjectValueCategory({
            low: _lowCategory * 1 ether,
            middleLow: _middleLowCategory * 1 ether,
            middle: _middleCategory * 1 ether,
            middleHigh: _middleHighCategory * 1 ether,
            high: _highCategory * 1 ether,
            ultraHigh: _ultraHighCategory * 1 ether
        });

        // Initialize stake utils
        stakeUtils = StakeUtil({
            memberStakePercentageFromReward: _memberStakePercentageFromReward,
            creatorStakePercentageFromProjectValue: _creatorStakePercentageFromProjectValue
        });

        addressRegistry = IAddressRegistry(_addressRegistryContract);
    }

    // =============================================================
    // Exported Functions - Getters
    // =============================================================

    // -------------------------------------------------------------
    // 1. Stake Utils Getters
    // -------------------------------------------------------------

    /**
     * @notice Returns the member stake percentage from reward.
     * @return uint128 Member stake percentage
     */
    function __getMemberStakeFromRewardPercentage() external view returns (uint128) {
        return stakeUtils.memberStakePercentageFromReward;
    }

    /**
     * @notice Returns the creator stake percentage from project value.
     * @return uint128 Creator stake percentage
     */
    function __getCreatorStakeFromProjectValuePercentage() external view returns (uint128) {
        return stakeUtils.creatorStakePercentageFromProjectValue;
    }

    // -------------------------------------------------------------
    // 2. Component Weight Percentage Getters
    // -------------------------------------------------------------

    /**
     * @notice Returns the reward score weight percentage.
     * @return uint64 Reward score weight
     */
    function __getRewardScore() external view returns (uint64) {
        return componentWeightPercentages.rewardScore;
    }

    /**
     * @notice Returns the reputation score weight percentage.
     * @return uint64 Reputation score weight
     */
    function __getReputationScore() external view returns (uint64) {
        return componentWeightPercentages.reputationScore;
    }

    /**
     * @notice Returns the deadline score weight percentage.
     * @return uint64 Deadline score weight
     */
    function __getDeadlineScore() external view returns (uint64) {
        return componentWeightPercentages.deadlineScore;
    }

    /**
     * @notice Returns the revision score weight percentage.
     * @return uint64 Revision score weight
     */
    function __getRevisionScore() external view returns (uint64) {
        return componentWeightPercentages.revisionScore;
    }

    // -------------------------------------------------------------
    // 3. Reputation Point Getters
    // -------------------------------------------------------------

    /**
     * @notice Returns reputation points for task cancellation.
     * @return uint64 Cancellation reputation points
     */
    function __getCancelByMe() external view returns (uint64) {
        return reputationPoints.cancelByMe;
    }

    /**
     * @notice Returns reputation penalty for revision.
     * @return uint64 Revision reputation penalty
     */
    function __getRevisionPenalty() external view returns (uint64) {
        return reputationPoints.revision;
    }

    /**
     * @notice Returns reputation points for creator when task is accepted.
     * @return uint32 Creator task acceptance reputation points
     */
    function __getTaskAcceptCreator() external view returns (uint32) {
        return reputationPoints.taskAcceptCreator;
    }

    /**
     * @notice Returns reputation points for member when accepting task.
     * @return uint32 Member task acceptance reputation points
     */
    function __getTaskAcceptMember() external view returns (uint32) {
        return reputationPoints.taskAcceptMember;
    }

    /**
     * @notice Returns reputation points for creator when meeting deadline.
     * @return uint32 Creator deadline hit reputation points
     */
    function __getDeadlineHitCreator() external view returns (uint32) {
        return reputationPoints.deadlineHitCreator;
    }

    /**
     * @notice Returns reputation points for member when meeting deadline.
     * @return uint32 Member deadline hit reputation points
     */
    function __getDeadlineHitMember() external view returns (uint32) {
        return reputationPoints.deadlineHitMember;
    }

    // -------------------------------------------------------------
    // 4. State Variable Getters
    // -------------------------------------------------------------

    /**
     * @notice Returns the maximum stake amount in wei.
     * @return uint256 Maximum stake amount
     */
    function __getMaxStake() external view returns (uint256) {
        return stateVariables.maxStake;
    }

    /**
     * @notice Returns the maximum reward amount in wei.
     * @return uint256 Maximum reward amount
     */
    function __getMaxReward() external view returns (uint256) {
        return stateVariables.maxReward;
    }

    /**
     * @notice Returns the minimum revision time in hours.
     * @return uint64 Minimum revision time
     */
    function __getMinRevisionTimeInHour() external view returns (uint64) {
        return stateVariables.minRevisionTimeInHour;
    }

    /**
     * @notice Returns the negative penalty percentage.
     * @return uint64 Negative penalty percentage
     */
    function __getNegPenalty() external view returns (uint64) {
        return stateVariables.negPenalty;
    }

    /**
     * @notice Returns the platform fee percentage.
     * @return uint64 Fee percentage
     */
    function __getFeePercentage() external view returns (uint64) {
        return stateVariables.feePercentage;
    }

    /**
     * @notice Returns the maximum number of revisions allowed.
     * @return uint64 Maximum revisions
     */
    function __getMaxRevision() external view returns (uint64) {
        return stateVariables.maxRevision;
    }

    // -------------------------------------------------------------
    // 5. Project Category Getters
    // -------------------------------------------------------------

    /**
     * @notice Returns the low category threshold in wei.
     * @return uint256 Low category threshold
     */
    function __getCategoryLow() external view returns (uint256) {
        return projectCategories.low;
    }

    /**
     * @notice Returns the middle-low category threshold in wei.
     * @return uint256 Middle-low category threshold
     */
    function __getCategoryMiddleLow() external view returns (uint256) {
        return projectCategories.middleLow;
    }

    /**
     * @notice Returns the middle category threshold in wei.
     * @return uint256 Middle category threshold
     */
    function __getCategoryMiddle() external view returns (uint256) {
        return projectCategories.middle;
    }

    /**
     * @notice Returns the middle-high category threshold in wei.
     * @return uint256 Middle-high category threshold
     */
    function __getCategoryMiddleHigh() external view returns (uint256) {
        return projectCategories.middleHigh;
    }

    /**
     * @notice Returns the high category threshold in wei.
     * @return uint256 High category threshold
     */
    function __getCategoryHigh() external view returns (uint256) {
        return projectCategories.high;
    }

    /**
     * @notice Returns the ultra-high category threshold in wei.
     * @return uint256 Ultra-high category threshold
     */
    function __getCategoryUltraHigh() external view returns (uint256) {
        return projectCategories.ultraHigh;
    }

    // =============================================================
    // Setter Functions (EMPLOYEES ONLY)
    // =============================================================

    /**
     * @notice Updates weight percentages used for scoring calculations.
     * @dev All percentages must sum to 100. Only callable by employees when contract is not paused.
     * 
     * @param _rewardScore Percentage weight for reward score
     * @param _reputationScore Percentage weight for reputation score
     * @param _deadlineScore Percentage weight for deadline score
     * @param _revisionScore Percentage weight for revision score
     */
    function setComponentWeightPercentages(
        uint64 _rewardScore,
        uint64 _reputationScore,
        uint64 _deadlineScore,
        uint64 _revisionScore
    ) external onlyEmployes whenNotPaused {
        uint256 totalWeight = _rewardScore + _reputationScore + _deadlineScore + _revisionScore;
        if (totalWeight != 100) revert StateVariableErr("Total weight must be 100");

        componentWeightPercentages = ComponentWeightPercentage({
            rewardScore: _rewardScore,
            reputationScore: _reputationScore,
            deadlineScore: _deadlineScore,
            revisionScore: _revisionScore
        });

        emit ComponentWeightPercentagesChanged(
            _rewardScore,
            _reputationScore,
            _deadlineScore,
            _revisionScore
        );
    }

    /**
     * @notice Updates all reputation point values.
     * @dev Only employees can call this function when contract is not paused.
     * 
     * @param _cancelByMeRP Reputation points for task cancellation
     * @param _revisionRP Reputation points for revision
     * @param _taskAcceptCreatorRP Reputation points for creator on task acceptance
     * @param _taskAcceptMemberRP Reputation points for member on task acceptance
     * @param _deadlineHitCreatorRP Reputation points for creator meeting deadline
     * @param _deadlineHitMemberRP Reputation points for member meeting deadline
     */
    function setReputationPoints(
        uint64 _cancelByMeRP,
        uint64 _revisionRP,
        uint32 _taskAcceptCreatorRP,
        uint32 _taskAcceptMemberRP,
        uint32 _deadlineHitCreatorRP,
        uint32 _deadlineHitMemberRP
    ) external onlyEmployes whenNotPaused {
        reputationPoints = ReputationPoint({
            cancelByMe: _cancelByMeRP,
            revision: _revisionRP,
            taskAcceptCreator: _taskAcceptCreatorRP,
            taskAcceptMember: _taskAcceptMemberRP,
            deadlineHitCreator: _deadlineHitCreatorRP,
            deadlineHitMember: _deadlineHitMemberRP
        });

        emit ReputationPointsChanged(
            _cancelByMeRP,
            _revisionRP,
            _taskAcceptCreatorRP,
            _taskAcceptMemberRP,
            _deadlineHitCreatorRP,
            _deadlineHitMemberRP
        );
    }

    /**
     * @notice Updates global system variables such as max stake, penalties, and reward limits.
     * @dev All stake/reward values must be given in ether units (converted internally to wei).
     *      Only employees can call this function when contract is not paused.
     * 
     * @param _maxStakeInEther Maximum stake amount in ether
     * @param _maxRewardInEther Maximum reward amount in ether
     * @param _minRevisionTimeInHour Minimum revision time in hours
     * @param _negPenalty Negative penalty percentage
     * @param _feePercentage Platform fee percentage
     * @param _maxRevision Maximum number of revisions
     */
    function setStateVariables(
        uint256 _maxStakeInEther,
        uint256 _maxRewardInEther,
        uint64 _minRevisionTimeInHour,
        uint64 _negPenalty,
        uint64 _feePercentage,
        uint64 _maxRevision
    ) external onlyEmployes whenNotPaused {
        if (_feePercentage >= 100) revert StateVariableErr("Fee percentage cannot be 100");
        if (_negPenalty >= 100) revert StateVariableErr("Negative penalty cannot be 100");
        if (_maxRewardInEther > _maxStakeInEther) revert StateVariableErr("Max reward exceeds max stake amount");

        stateVariables = StateVar({
            maxStake: _maxStakeInEther * 1 ether,
            maxReward: _maxRewardInEther * 1 ether,
            minRevisionTimeInHour: _minRevisionTimeInHour,
            negPenalty: _negPenalty,
            feePercentage: _feePercentage,
            maxRevision: _maxRevision
        });

        emit StateVariablesChanged(
            _maxStakeInEther * 1 ether,
            _maxRewardInEther * 1 ether,
            _minRevisionTimeInHour,
            _negPenalty,
            _feePercentage,
            _maxRevision
        );
    }

    /**
     * @notice Updates project category values used for classification.
     * @dev All values must be in strictly ascending order and cannot exceed max stake.
     *      Values are provided in ether units and converted internally to wei.
     *      Only employees can call this function when contract is not paused.
     * 
     * @param _low Low category threshold in ether
     * @param _middleLow Middle-low category threshold in ether
     * @param _middle Middle category threshold in ether
     * @param _middleHigh Middle-high category threshold in ether
     * @param _high High category threshold in ether
     * @param _ultraHigh Ultra-high category threshold in ether
     */
    function setProjectCategories(
        uint256 _low,
        uint256 _middleLow,
        uint256 _middle,
        uint256 _middleHigh,
        uint256 _high,
        uint256 _ultraHigh
    ) external onlyEmployes whenNotPaused {
        // Zero-value sanity check
        if (_low == 0 || _middleLow == 0 || _middle == 0 || _middleHigh == 0 || _high == 0 || _ultraHigh == 0) {
            revert StateVariableErr("Project category value cannot be zero");
        }

        // Strict ascending order validation
        if (_low >= _middleLow ||
            _middleLow >= _middle ||
            _middle >= _middleHigh ||
            _middleHigh >= _high ||
            _high >= _ultraHigh
        ) {
            revert StateVariableErr("Invalid project category order");
        }

        // Convert to wei
        uint256 lowWei = _low * 1 ether;
        uint256 middleLowWei = _middleLow * 1 ether;
        uint256 middleWei = _middle * 1 ether;
        uint256 middleHighWei = _middleHigh * 1 ether;
        uint256 highWei = _high * 1 ether;
        uint256 ultraHighWei = _ultraHigh * 1 ether;

        // Enforce system-wide economic ceilings
        uint256 maxStake = stateVariables.maxStake;
        if (lowWei > maxStake ||
            middleLowWei > maxStake ||
            middleWei > maxStake ||
            middleHighWei > maxStake ||
            highWei > maxStake ||
            ultraHighWei > maxStake
        ) {
            revert StateVariableErr("Category exceeds max stake amount");
        }

        // Commit state
        projectCategories = ProjectValueCategory({
            low: lowWei,
            middleLow: middleLowWei,
            middle: middleWei,
            middleHigh: middleHighWei,
            high: highWei,
            ultraHigh: ultraHighWei
        });

        emit ProjectCategoriesChanged(_low, _middleLow, _middle, _middleHigh, _high, _ultraHigh);
    }

    /**
     * @notice Updates stake utility percentages.
     * @dev Percentages must be less than 100. Only employees can call when contract is not paused.
     * 
     * @param _memberStakePercentageFromReward Member stake as percentage of reward
     * @param _creatorStakePercentageFromProjectValue Creator stake as percentage of project value
     */
    function setStakeUtils(
        uint128 _memberStakePercentageFromReward,
        uint128 _creatorStakePercentageFromProjectValue
    ) external onlyEmployes whenNotPaused {
        if (_memberStakePercentageFromReward >= 100 || _creatorStakePercentageFromProjectValue >= 100) {
            revert StateVariableErr("Stake percentage cannot be 100");
        }

        stakeUtils = StakeUtil({
            memberStakePercentageFromReward: _memberStakePercentageFromReward,
            creatorStakePercentageFromProjectValue: _creatorStakePercentageFromProjectValue
        });

        emit StakeUtilsChanged(_memberStakePercentageFromReward, _creatorStakePercentageFromProjectValue);
    }

    /**
     * @notice Changes the address registry contract.
     * @dev Only owner can call this function when contract is not paused.
     * 
     * @param _newRegistryAddress New address registry contract address
     */
    function changeRegistryAddress(address _newRegistryAddress) 
        external 
        onlyOwner
        whenNotPaused 
    {
        if (_newRegistryAddress == address(0)) revert InvalidAddress("Address registry contract is zero address");
        addressRegistry = IAddressRegistry(_newRegistryAddress);
        emit AddressRegistryChanged(_newRegistryAddress);
    }

    /**
     * @notice Pauses the contract.
     * @dev Only owner can call this function.
     */
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }

    /**
     * @notice Unpauses the contract.
     * @dev Only owner can call this function.
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
}