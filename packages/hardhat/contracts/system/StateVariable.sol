// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Pipe/AccesControlPipes.sol";
import "./interfaces/IAccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title stateVariable
 * @notice Contract for managing configurable system state variables, including weights,
 *         stake categories, reputation points, limits, and penalties.
 * @dev Uses AccessControl for permissioning and includes setters restricted to employees.
 */
contract stateVariable is MainAccesControlPipes, Pausable {

    // =============================================================
    // Struct Definitions
    // =============================================================

    /// @notice Percentage weights used to calculate reward, reputation, deadlines, and revision impact.
    struct ComponentWeightPercentage {
        uint64 rewardScore;
        uint64 reputationScore;
        uint64 deadlineScore;
        uint64 revisionScore;
    }

    /// @notice Reputation point values based on user actions.
    struct ReputationPoint {
        uint64 cancelByMe;
        uint64 revision;
        uint32 taskAcceptCreator;
        uint32 taskAcceptMember;
        uint32 deadlineHitCreator;
        uint32 deadlineHitMember;
    }

    /// @notice Global system variables, including limits and penalty percentages.
    struct StateVar {
        uint256 maxStake;
        uint256 maxReward;
        uint64 minRevisionTimeInHour;
        uint64 negPenalty;
        uint64 feePercentage;
        uint64 maxRevision;
    }

    /// @notice Predefined stake categories for classification.
    struct ProjectValueCategory {
        uint256 low;
        uint256 middleLow;
        uint256 middle;
        uint256 middleHigh;
        uint256 high;
        uint256 ultraHigh;
    }

    struct StakeUtil {
        uint128 memberStakePercentageFromReward;
        uint128 creatorStakePercentageFromProjectValue;
    }

    struct AddressUtil {
        address accessControlAddress;
        address systemWalletAddress;
        address stateVariableAddress;
    }


    // =============================================================
    // State Variables
    // =============================================================

    ComponentWeightPercentage public componentWeightPercentages;
    ReputationPoint public reputationPoints;
    StateVar public stateVariables;
    ProjectValueCategory public projectCategories;
    StakeUtil public stakeUtils;
    AddressUtil public addressUtils;
    
    // Variabel for save IAccessControl address
    address public accessControlAddress;


    // =============================================================
    // Events
    // =============================================================

    event ComponentWeightPercentagesChanged(
        uint64 rewardScore,
        uint64 reputationScore,
        uint64 deadlineScore,
        uint64 revisionScore
    );

    event ReputationPointsChanged(
        uint64 cancelByMe,
        uint64 revision,
        uint32 taskAcceptCreator,
        uint32 taskAcceptMember,
        uint32 deadlineHitCreator,
        uint32 deadlineHitMember
    );

    event StateVariablesChanged(
        uint256 maxStake,
        uint256 maxReward,
        uint64 minRevisionTimeInHour,
        uint64 negPenalty,
        uint64 feePercentage,
        uint64 maxRevision
    );
    
    event ProjectCategoriesChanged(
        uint256 low,
        uint256 middleLow,
        uint256 middle,
        uint256 middleHigh,
        uint256 high,
        uint256 ultraHigh
    );

    event StakeUtilsChanged(
        uint128 memberStakePercentageFromReward,
        uint128 creatorStakePercentageFromProjectValue
    );

    event AddressUtilsChanged(
        address accessControlAddress,
        address systemWalletAddress,
        address stateVariableAddress
    );

    event AccessControlChanged(address newAccessControl);
    event ContractPaused(address account);
    event ContractUnpaused(address account);


    // =============================================================
    // Errors
    // =============================================================

    error TotalMustBe100();
    error InvalidMaxStakeAmount();
    error FeeCannotBe100();
    error NegPenaltyCannotBe100();
    error InvalidStakePercentage();
    error InvalidCategoryOrder();
    error ZeroAddressNotAllowed();


    // =============================================================
    // Constructor
    // =============================================================

    /**
     * @notice Initializes the contract with default configuration values.
     * @dev Values that represent ETH must be passed in plain integers (e.g., 5 = 5 ETH).
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

        // Address Utils
        address _accessControlAddress,
        address _systemWalletAddress,
        address _stateVariableAddress
    ) {
        // Validate weight percentages total
        uint256 totalWeight = _rewardScore + _reputationScore + _deadlineScore + _revisionScore;
        if (totalWeight != 100) revert TotalMustBe100();

        // Validate percentages
        if (_feePercentage > 100) revert FeeCannotBe100();
        if (_negPenalty > 100) revert NegPenaltyCannotBe100();

        // Validate stake percentages
        if (_memberStakePercentageFromReward > 100 || _creatorStakePercentageFromProjectValue > 100) {
            revert InvalidStakePercentage();
        }

        // Validate project categories order
        if (_lowCategory >= _middleLowCategory || 
            _middleLowCategory >= _middleCategory || 
            _middleCategory >= _middleHighCategory || 
            _middleHighCategory >= _highCategory || 
            _highCategory >= _ultraHighCategory) {
            revert InvalidCategoryOrder();
        }

        // Validate addresses
        if (_accessControlAddress == address(0) || 
            _systemWalletAddress == address(0) || 
            _stateVariableAddress == address(0)) {
            revert ZeroAddressNotAllowed();
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

        // Initialize state variables
        stateVariables = StateVar({
            maxStake: _maxStakeInEther * 1 ether,
            maxReward: _maxRewardInEther * 1 ether,
            minRevisionTimeInHour: _minRevisionTimeInHour,
            negPenalty: _negPenalty,
            feePercentage: _feePercentage,
            maxRevision: _maxRevision
        });

        // Initialize project categories
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

        // Initialize address utils
        addressUtils = AddressUtil({
            accessControlAddress: _accessControlAddress,
            systemWalletAddress: _systemWalletAddress,
            stateVariableAddress: _stateVariableAddress
        });

        // Set access control addresses
        accessControl = IAccessControl(_accessControlAddress);
        accessControlAddress = _accessControlAddress;
    }

// =============================================================
// Exported Functions
// =============================================================

// -------------------------------------------------------------
// 1. Stake Utils Getters
// -------------------------------------------------------------

function __getMemberStakeFromRewardPercentage() external view returns (uint128) {
    return stakeUtils.memberStakePercentageFromReward;
}

function __getCreatorStakeFromProjectValuePercentage() external view returns (uint128) {
    return stakeUtils.creatorStakePercentageFromProjectValue;
}

// -------------------------------------------------------------
// 2. Address Utils Getters
// -------------------------------------------------------------

function __getAccessControlAddress() external view returns(address) {
    return addressUtils.accessControlAddress;
}

function __getSystemWalletAddress() external view returns(address) {
    return addressUtils.systemWalletAddress;
}

function __getStateVariableAddress() external view returns(address) {
    return addressUtils.stateVariableAddress;
}

// -------------------------------------------------------------
// 3. Component Weight Percentage Getters
// -------------------------------------------------------------

function __getRewardScore() external view returns (uint64) {
    return componentWeightPercentages.rewardScore;
}

function __getReputationScore() external view returns (uint64) {
    return componentWeightPercentages.reputationScore;
}

function __getDeadlineScore() external view returns (uint64) {
    return componentWeightPercentages.deadlineScore;
}

function __getRevisionScore() external view returns (uint64) {
    return componentWeightPercentages.revisionScore;
}

// -------------------------------------------------------------
// 4. Reputation Point Getters
// -------------------------------------------------------------

function __getCancelByMe() external view returns (uint64) {
    return reputationPoints.cancelByMe;
}

function __getRevisionPenalty() external view returns (uint64) {
    return reputationPoints.revision;
}

function __getTaskAcceptCreator() external view returns (uint32) {
    return reputationPoints.taskAcceptCreator;
}

function __getTaskAcceptMember() external view returns (uint32) {
    return reputationPoints.taskAcceptMember;
}

function __getDeadlineHitCreator() external view returns (uint32) {
    return reputationPoints.deadlineHitCreator;
}

function __getDeadlineHitMember() external view returns (uint32) {
    return reputationPoints.deadlineHitMember;
}

// -------------------------------------------------------------
// 5. State Variable Getters
// -------------------------------------------------------------

function __getMaxStake() external view returns (uint256) {
    return stateVariables.maxStake;
}

function __getMaxReward() external view returns (uint256) {
    return stateVariables.maxReward;
}

function __getMinRevisionTimeInHour() external view returns (uint64) {
    return stateVariables.minRevisionTimeInHour;
}

function __getNegPenalty() external view returns (uint64) {
    return stateVariables.negPenalty;
}

function __getFeePercentage() external view returns (uint64) {
    return stateVariables.feePercentage;
}

function __getMaxRevision() external view returns (uint64) {
    return stateVariables.maxRevision;
}

// -------------------------------------------------------------
// 6. Project Category Getters
// -------------------------------------------------------------

function __getCategoryLow() external view returns (uint256) {
    return projectCategories.low;
}

function __getCategoryMiddleLow() external view returns (uint256) {
    return projectCategories.middleLow;
}

function __getCategoryMiddle() external view returns (uint256) {
    return projectCategories.middle;
}

function __getCategoryMiddleHigh() external view returns (uint256) {
    return projectCategories.middleHigh;
}

function __getCategoryHigh() external view returns (uint256) {
    return projectCategories.high;
}

function __getCategoryUltraHigh() external view returns (uint256) {
    return projectCategories.ultraHigh;
}

    // =============================================================
    // Setter Functions (EMPLOYEES ONLY)
    // =============================================================

    /**
     * @notice Updates weight percentages used for scoring calculations.
     * @param _rewardScore Percentage weight for reward score.
     * @param _reputationScore Percentage weight for reputation score.
     * @param _deadlineScore Percentage weight for deadline score.
     * @param _revisionScore Percentage weight for revision score.
     * @dev Only callable by employees.
     */
    function setComponentWeightPercentages(
        uint64 _rewardScore,
        uint64 _reputationScore,
        uint64 _deadlineScore,
        uint64 _revisionScore
    ) external onlyEmployes(accessControlAddress) whenNotPaused {

        uint256 totalWeight = _rewardScore + _reputationScore + _deadlineScore + _revisionScore;
        if (totalWeight != 100) revert TotalMustBe100();

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
     * @dev Only employees can call this function.
     */
    function setReputationPoints(
        uint64 _cancelByMeRP,
        uint64 _revisionRP,
        uint32 _taskAcceptCreatorRP,
        uint32 _taskAcceptMemberRP,
        uint32 _deadlineHitCreatorRP,
        uint32 _deadlineHitMemberRP
    ) external onlyEmployes(accessControlAddress) whenNotPaused {

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
     * @dev All stake/reward values must be given in ETH units (converted internally).
     */
    function setStateVariables(
        uint256 _maxStakeInEther,
        uint256 _maxRewardInEther,
        uint64 _minRevisionTimeInHour,
        uint64 _negPenalty,
        uint64 _feePercentage,
        uint64 _maxRevision
    ) external onlyEmployes(accessControlAddress) whenNotPaused {

        if (_feePercentage > 100) revert FeeCannotBe100();
        if (_negPenalty > 100) revert NegPenaltyCannotBe100();

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
     */
    function setProjectCategories(
        uint256 _low,
        uint256 _middleLow,
        uint256 _middle,
        uint256 _middleHigh,
        uint256 _high,
        uint256 _ultraHigh
    ) external onlyEmployes(accessControlAddress) whenNotPaused {

        if (_low >= _middleLow || 
            _middleLow >= _middle || 
            _middle >= _middleHigh || 
            _middleHigh >= _high || 
            _high >= _ultraHigh) {
            revert InvalidCategoryOrder();
        }

        if (_ultraHigh > stateVariables.maxStake) revert InvalidMaxStakeAmount();

        projectCategories = ProjectValueCategory({
            low: _low * 1 ether,
            middleLow: _middleLow * 1 ether,
            middle: _middle * 1 ether,
            middleHigh: _middleHigh * 1 ether,
            high: _high * 1 ether,
            ultraHigh: _ultraHigh * 1 ether
        });

        emit ProjectCategoriesChanged(
            _low,
            _middleLow,
            _middle,
            _middleHigh,
            _high,
            _ultraHigh
        );
    }

    /**
     * @notice Updates stake utility percentages.
     */
    function setStakeUtils(
        uint128 _memberStakePercentageFromReward,
        uint128 _creatorStakePercentageFromProjectValue
    ) external onlyEmployes(accessControlAddress) whenNotPaused {
        if (_memberStakePercentageFromReward > 100 || _creatorStakePercentageFromProjectValue > 100) {
            revert InvalidStakePercentage();
        }

        stakeUtils = StakeUtil({
            memberStakePercentageFromReward: _memberStakePercentageFromReward,
            creatorStakePercentageFromProjectValue: _creatorStakePercentageFromProjectValue
        });

        emit StakeUtilsChanged(
            _memberStakePercentageFromReward,
            _creatorStakePercentageFromProjectValue
        );
    }

    /**
     * @notice Updates address utilities.
     */
    function setAddressUtils(
        address _accessControlAddress,
        address _systemWalletAddress,
        address _stateVariableAddress
    ) external onlyOwner(accessControlAddress) whenNotPaused {
        if (_accessControlAddress == address(0) || 
            _systemWalletAddress == address(0) || 
            _stateVariableAddress == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        addressUtils = AddressUtil({
            accessControlAddress: _accessControlAddress,
            systemWalletAddress: _systemWalletAddress,
            stateVariableAddress: _stateVariableAddress
        });

        // Update access control if changed
        if (_accessControlAddress != accessControlAddress) {
            accessControl = IAccessControl(_accessControlAddress);
            accessControlAddress = _accessControlAddress;
        }

        emit AddressUtilsChanged(
            _accessControlAddress,
            _systemWalletAddress,
            _stateVariableAddress
        );
    }

    /**
     * @notice Changes access control contract address.
     */
    function changeAccessControl(address _newAccessControl) external onlyOwner(accessControlAddress) whenNotPaused {
        if (_newAccessControl == address(0)) revert ZeroAddressNotAllowed();
        accessControl = IAccessControl(_newAccessControl);
        accessControlAddress = _newAccessControl;
        addressUtils.accessControlAddress = _newAccessControl;
        emit AccessControlChanged(_newAccessControl);
        emit AddressUtilsChanged(
            _newAccessControl,
            addressUtils.systemWalletAddress,
            addressUtils.stateVariableAddress
        );
    }

    /**
     * @notice Pauses the contract.
     */
    function pause() external onlyOwner(accessControlAddress) {
        _pause();
        emit ContractPaused(msg.sender);
    }

    /**
     * @notice Unpauses the contract.
     */
    function unpause() external onlyOwner(accessControlAddress) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

}