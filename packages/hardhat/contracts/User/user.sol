// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/utils/addressUtils.sol";
import "../system/utils/ReentrancyGuard.sol";
import "../Pipe/AccesControlPipes.sol";
import "../system/interfaces/IDataContract.sol";
import "../system/interfaces/IAddressRegistry.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UsersContract is 
    systemAddressUtils, 
    Initializable, 
    UUPSUpgradeable, 
    PausableUpgradeable,
    MainAccesControlPipes, 
    SystemReentrancyGuard 
{
    // State Variables
    IAddressRegistry private addressRegistry;

    /**
     * @notice User profile structure with reputation and activity tracking
     * @dev Stores all relevant information about a protocol user
     */
    struct User {
        uint256 totalTasksCreated;    // Total tasks created by user
        uint256 totalTasksCompleted;  // Total tasks successfully completed
        uint256 totalTasksFailed;     // Total tasks failed or cancelled
        uint256 reputation;           // Reputation score (affects project valuation)
        uint256 age;                  // User age (must be 18-100)
        uint256 balance;              // User's fund balance in the protocol
        bool isRegistered;            // Registration status
        bool isActive;                // Account active status
        string name;                  // User display name
        string GitProfile;            // User's GitHub profile URL
    }

    // Mappings
    mapping(address => User) public Users;
    mapping(bytes32 => bool) public usedGitURL;

    // Events
    event userEvent(
        string eventName, 
        address indexed userAddress, 
        string userName, 
        uint256 eventValue
    );

    // Errors
    error userErros(string errName);

    /**
     * @notice Initializes the UsersContract
     * @param _addressRegistry Address of the AddressRegistry contract
     */
    function initialize(address _addressRegistry) external initializer {
        if (_addressRegistry == address(0)) revert userErros("ZeroAddress");
        
        addressRegistry = IAddressRegistry(_addressRegistry);
        
        __ReentrancyGuard_init();
        __Pausable_init();
        
        emit userEvent("contract_initialized", _addressRegistry, "", 0);
    }

    /**
     * @notice Registers a new user in the protocol
     * @param _name User's display name
     * @param _age User's age (must be between 18-100)
     * @param _githubURL User's GitHub profile URL
     * @param _user Address of the user to register
     * @dev Creates a new user profile with initial reputation and counters
     */
    function Register(
        string calldata _name, 
        uint256 _age, 
        string calldata _githubURL, 
        address _user
    ) external onlyUser(addressRegistry.__accessControlContract()) callerZeroAddr {
        User storage u = Users[_user];

        // Validate registration
        if (u.isRegistered) revert userErros("AlreadyRegistered");
        
        bytes32 gitHash = keccak256(abi.encodePacked(_githubURL));
        if (usedGitURL[gitHash]) revert userErros("GitProfileAlreadyUsed");

        // Initialize user profile
        u.reputation = 0;
        u.totalTasksCompleted = 0;
        u.totalTasksFailed = 0;
        u.balance = 0;
        u.isRegistered = true;
        u.isActive = true;
        u.name = _name;
        u.age = _age;
        u.GitProfile = _githubURL;
        
        usedGitURL[gitHash] = true;

        emit userEvent("UserRegistered", _user, _name, _age);
    }

    /**
     * @notice Unregisters a user and deletes their profile data
     * @param _user Address of the user to unregister
     * @return confirmation Confirmation message
     * @dev Removes user from protocol and clears their data
     */
    function Unregister(address _user)
        external
        onlyUser(addressRegistry.__accessControlContract())
        callerZeroAddr
        returns (string memory)
    {
        if (!__isRegistered(_user)) revert userErros("UserNotRegistered");
        
        User memory u = Users[_user];
        u.isActive = false;
        
        emit userEvent("UserUnregistered", _user, u.name, u.age);
        delete Users[_user];
        
        return "Unregister Successfully";
    }

    /**
     * @notice Withdraws a specific amount from user's balance
     * @param _user Address of the user
     * @param _amount Amount to withdraw
     */
    function withdrawUserFund(
        address _user, 
        uint256 _amount
    ) external nonReentrant callerZeroAddr onlyUser(addressRegistry.__accessControlContract()) {
        User storage u = Users[_user];
        
        if (u.balance < _amount) revert userErros("InsufficientFunds");
        
        u.balance -= _amount;
        payable(_user).transfer(_amount);
    }

    /**
     * @notice Withdraws all funds from user's balance
     * @param _user Address of the user
     */
    function withdrawAllUserFund(
        address _user
    ) external nonReentrant callerZeroAddr onlyUser(addressRegistry.__accessControlContract()) {
        User storage u = Users[_user];
        uint256 amount = u.balance;
        
        if (amount == 0) revert userErros("InsufficientFunds");
        
        u.balance = 0;
        payable(_user).transfer(amount);
    }

    /**
     * @notice Updates the AddressRegistry contract address
     * @param _newAddressRegistry New AddressRegistry address
     */
    function __changeAddressRegistry(address _newAddressRegistry) 
        external 
        onlyOwner(addressRegistry.__accessControlContract()) 
    {
        if (_newAddressRegistry == address(0)) revert userErros("ZeroAddress");
        
        addressRegistry = IAddressRegistry(_newAddressRegistry);
        
        emit userEvent("address_registry_changed", _newAddressRegistry, "", 0);
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner(addressRegistry.__accessControlContract()) {
        _pause();
        emit userEvent("contract_paused", msg.sender, "", 0);
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner(addressRegistry.__accessControlContract()) {
        _unpause();
        emit userEvent("contract_unpaused", msg.sender, "", 0);
    }

    /* =======================
        UUPS AUTH
    ======================= */

    /**
     * @dev Authorizes contract upgrade
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal view override onlyOwner(addressRegistry.__accessControlContract()) {}

    /* =======================
        USER FIELD GETTERS
    ======================= */

    /**
     * @notice Gets total tasks created by user
     * @param _user Address of the user
     * @return uint256 Total tasks created
     */
    function __getTotalTasksCreated(address _user) external view returns (uint256) {
        return Users[_user].totalTasksCreated;
    }

    /**
     * @notice Gets total tasks completed by user
     * @param _user Address of the user
     * @return uint256 Total tasks completed
     */
    function __getTotalTasksCompleted(address _user) external view returns (uint256) {
        return Users[_user].totalTasksCompleted;
    }

    /**
     * @notice Gets total tasks failed by user
     * @param _user Address of the user
     * @return uint256 Total tasks failed
     */
    function __getTotalTasksFailed(address _user) external view returns (uint256) {
        return Users[_user].totalTasksFailed;
    }

    /**
     * @notice Gets user's reputation score
     * @param _user Address of the user
     * @return uint256 Reputation score
     */
    function __getUserReputation(address _user) external view returns (uint256) {
        return Users[_user].reputation;
    }

    /**
     * @notice Gets user's age
     * @param _user Address of the user
     * @return uint256 User age
     */
    function __getUserAge(address _user) external view returns (uint256) {
        return Users[_user].age;
    }

    /**
     * @notice Gets user's balance
     * @param _user Address of the user
     * @return uint256 User balance
     */
    function __getUserBalance(address _user) external view returns (uint256) {
        return Users[_user].balance;
    }

    /**
     * @notice Checks if user is registered
     * @param _user Address of the user
     * @return bool Registration status
     */
    function __isRegistered(address _user) public view returns (bool) {
        return Users[_user].isRegistered;
    }

    /**
     * @notice Gets user's active status
     * @param _user Address of the user
     * @return bool Active status
     */
    function __getIsActive(address _user) external view returns (bool) {
        return Users[_user].isActive;
    }

    /**
     * @notice Gets user's display name
     * @param _user Address of the user
     * @return string memory User name
     */
    function __getUserName(address _user) external view returns (string memory) {
        return Users[_user].name;
    }

    /**
     * @notice Gets user's GitHub profile URL
     * @param _user Address of the user
     * @return string memory GitHub URL
     */
    function __getUserGitProfile(address _user) external view returns (string memory) {
        return Users[_user].GitProfile;
    }

    /* =======================
        SETTER FUNCTIONS
    ======================= */

    /**
     * @notice Increments user's task created counter
     * @param _user Address of the user
     */
    function __taskCreateCounter(address _user) external {
        Users[_user].totalTasksCreated++;
    }

    /**
     * @notice Increments task completion counters for both user and creator
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __taskCompleteCounter(address _user, address _creator) external {
        Users[_user].totalTasksCompleted++;
        Users[_creator].totalTasksCompleted++;
    }

    /**
     * @notice Increments task failure counters for both user and creator
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __taskFailCounter(address _user, address _creator) external {
        Users[_user].totalTasksFailed++;
        Users[_creator].totalTasksFailed++;
    }

    /**
     * @notice Adds funds to user's balance
     * @param _user Address of the user
     * @param _amount Amount to add
     */
    function __addUserBalance(address _user, uint256 _amount) external {
        Users[_user].balance += _amount;
    }

    /**
     * @notice Deducts cancellation penalty from user's reputation
     * @param _user Address of the user
     */
    function __cancelByMeRep(address _user) external {
        Users[_user].reputation -= IDataContract(addressRegistry.__dataContract()).__getCancelByMe();
    }

    /**
     * @notice Deducts revision penalty from both user and creator's reputation
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __revisionRep(address _user, address _creator) external {
        uint256 penalty = IDataContract(addressRegistry.__dataContract()).__getRevisionPenalty();
        
        Users[_user].reputation -= penalty;
        Users[_creator].reputation -= penalty;
    }

    /**
     * @notice Adds task acceptance rewards to both user and creator's reputation
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __taskAcceptRep(address _user, address _creator) external {
        IDataContract dataContract = IDataContract(addressRegistry.__dataContract());
        
        Users[_user].reputation += dataContract.__getTaskAcceptMember();
        Users[_creator].reputation += dataContract.__getTaskAcceptCreator();
    }

    /**
     * @notice Deducts deadline hit penalties from both user and creator's reputation
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __deadlineHitRep(address _user, address _creator) external {
        IDataContract dataContract = IDataContract(addressRegistry.__dataContract());
        
        Users[_user].reputation -= dataContract.__getDeadlineHitMember();
        Users[_creator].reputation -= dataContract.__getDeadlineHitCreator();
    }

    function __penaltyIsBiggerThanReputation(address _user) external {
        Users[_user].reputation = 0;
    }
}