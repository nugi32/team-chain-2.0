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
    AddressUtils, 
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
        uint256 balance;              // User's fund balance in the protocol
        bool isRegistered;            // Registration status
        bool exists;                  // Existence flag for user profile
        string GitProfile;            // User's GitHub profile URL
    }
//
    // Mappings
    mapping(address => User) public Users;
    mapping(bytes32 => bool) public usedGitURL;

    // Events
    event userEvent(string eventName, address indexed userAddress);

    // Errors
    error userError(string errName);

    modifier ctcCall() {
        if(
            msg.sender != addressRegistry.__taskComponentsAddr().cancelModule &&
            msg.sender != addressRegistry.__taskComponentsAddr().joinModule &&
            msg.sender != addressRegistry.__taskComponentsAddr().submisionModule &&
            msg.sender != addressRegistry.__taskComponentsAddr().taskLifecycleModule &&
            msg.sender != addressRegistry.__taskComponentsAddr().taskControler
        ) revert userError("UnauthorizedCaller");
        _;
    }

    modifier onlyOwner {
        __onlyOwner(addressRegistry.__accessControlContract());
        _;
    }

    modifier onlyUser() {
        __onlyUser(addressRegistry.__accessControlContract());  
        _;
    }


    /**
     * @notice Initializes the UsersContract
     * @param _addressRegistry Address of the AddressRegistry contract
     */
    function initialize(address _addressRegistry) external initializer {
        if (_addressRegistry == address(0)) revert userError("ZeroAddress");
        
        addressRegistry = IAddressRegistry(_addressRegistry);
        
        __ReentrancyGuard_init();
        __Pausable_init();
        
        emit userEvent("contract_initialized", _addressRegistry);
    }

    /**
     * @notice SECURITY FIX C-1: Accept ETH deposits to serve as central vault
     * @dev Required for withdrawal mechanism to work - ETH must be stored somewhere
     */
    receive() external payable {
        // Accept ETH for user deposits, task rewards, and fund returns
    }

    /**
     * @notice Deposits ETH from user to their balance account
     * @param _user Address of the user making deposit
     * @dev SECURITY FIX C-1: Explicit deposit function for ETH flow control
     */
    function depositUserFund(address _user) external payable callerZeroAddr onlyUser nonReentrant {
        if (msg.value == 0) revert userError("ZeroAmount");
        if (_user == address(0)) revert userError("ZeroAddress");
        
        Users[_user].balance += msg.value;
        emit userEvent("FundsDeposited", _user);
    }
//
    /**
     * @notice Registers a new user in the protocol
     * @param _githubURL User's GitHub profile URL
     * @param _user Address of the user to register
     * @dev Creates a new user profile with initial reputation and counters
     */
    function Register(
        string calldata _githubURL, 
        address _user
    ) external onlyUser callerZeroAddr {

        User storage u = Users[_user];

        if(Users[_user].exists && Users[_user].isRegistered == false) {
            u.isRegistered = true;
            emit userEvent("UserRestoredData", _user);
        } else {
        if (u.isRegistered) revert userError("AlreadyRegistered");
        
        bytes32 gitHash = keccak256(abi.encodePacked(_githubURL));
        if (usedGitURL[gitHash]) revert userError("GitProfileAlreadyUsed");

        // Initialize user profile
        u.reputation = 0;
        u.totalTasksCompleted = 0;
        u.totalTasksFailed = 0;
        u.balance = 0;
        u.isRegistered = true;
        u.GitProfile = _githubURL;
        u.exists = true;
        
        usedGitURL[gitHash] = true;

        emit userEvent("UserRegistered", _user);
        }
    }

    /**
     * @notice Unregisters a user and deletes their profile data
     * @param _user Address of the user to unregister
     * @return confirmation Confirmation message
     * @dev Removes user from protocol and clears their data
     */
    function Unregister(address _user)
        external
        onlyUser
        callerZeroAddr
        returns (string memory)
    {
        if (!__isRegistered(_user)) revert userError("UserNotRegistered");
        
        Users[_user].isRegistered = false;
        
        emit userEvent("UserUnregistered", _user);
        
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
    ) external nonReentrant callerZeroAddr onlyUser {
        User storage u = Users[_user];
        
        if (u.balance < _amount) revert userError("InsufficientFunds");
        
        u.balance -= _amount;
        (bool success, ) = payable(_user).call{value: _amount}("");
        if (!success) revert userError("TransferFailed");
    }

    /**
     * @notice Withdraws all funds from user's balance
     * @param _user Address of the user
     */
    function withdrawAllUserFund(
        address _user
    ) external nonReentrant callerZeroAddr onlyUser {
        User storage u = Users[_user];
        uint256 _amount = u.balance;
        
        if (_amount == 0) revert userError("InsufficientFunds");
        
        u.balance = 0;
        (bool success, ) = payable(_user).call{value: _amount}("");
        if (!success) revert userError("TransferFailed");
    }

    /**
     * @notice Transfers protocol fees to a designated wallet
     * @param _amount Amount of fees to transfer
     * @param _wallet Destination wallet address
     * @dev SECURITY FIX NEW-H-1: Allows protocol fees (physically stored here) to be withdrawn
     * @dev Only callable via ctcCall from TaskController
     */
    function transferFeeToWallet(
        uint256 _amount,
        address payable _wallet
    ) external nonReentrant ctcCall {
        if (_wallet == address(0)) revert userError("ZeroAddress");
        if (_amount == 0) revert userError("ZeroAmount");
        
        // Check that the contract has sufficient balance for fees
        if (address(this).balance < _amount) revert userError("InsufficientFeesAvailable");
        
        (bool success, ) = _wallet.call{value: _amount}("");
        if (!success) revert userError("TransferFailed");
    }

    /**
     * @notice Updates the AddressRegistry contract address
     * @param _newAddressRegistry New AddressRegistry address
     */
    function __changeAddressRegistry(address _newAddressRegistry) 
        external 
        onlyOwner
    {
        if (_newAddressRegistry == address(0)) revert userError("ZeroAddress");
        
        addressRegistry = IAddressRegistry(_newAddressRegistry);
        
        emit userEvent("address_registry_changed", _newAddressRegistry);
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
        emit userEvent("contract_paused", msg.sender);
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
        emit userEvent("contract_unpaused", msg.sender);
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
    ) internal view override onlyOwner {}

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
    function __taskCreateCounter(address _user) external ctcCall {
        Users[_user].totalTasksCreated++;
    }

    /**
     * @notice Increments task completion counters for both user and creator
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __taskCompleteCounter(address _user, address _creator) external ctcCall {
        Users[_user].totalTasksCompleted++;
        Users[_creator].totalTasksCompleted++;
    }

    /**
     * @notice Increments task failure counters for both user and creator
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __taskFailCounter(address _user, address _creator) external ctcCall {
        Users[_user].totalTasksFailed++;
        Users[_creator].totalTasksFailed++;
    }

    /**
     * @notice Adds funds to user's balance
     * @param _user Address of the user
     * @param _amount Amount to add
     */
    function __addUserBalance(address _user, uint256 _amount) external ctcCall {
        Users[_user].balance += _amount;
    }

    /**
     * @notice Removes funds from user's balance
     * @param _user Address of the user
     * @param _amount Amount to remove
     */
    function __takeUserBalance(address _user, uint256 _amount) external ctcCall {
        if (Users[_user].balance < _amount) revert userError("InsufficientBalance");
        Users[_user].balance -= _amount;
    }

    /**
     * @notice Deducts cancellation penalty from user's reputation
     * @param _user Address of the user
     * @dev SECURITY FIX C-3: Use safe subtraction to prevent underflow
     */
    function __cancelByMeRep(address _user) external ctcCall {
        uint256 penalty = IDataContract(addressRegistry.__dataContract()).__getCancelByMe();
        uint256 currentRep = Users[_user].reputation;
        // SECURITY FIX C-3: Safe subtraction - reputation cannot go below 0
        Users[_user].reputation = currentRep > penalty ? currentRep - penalty : 0;
    }

    /**
     * @notice Deducts revision penalty from both user and creator's reputation
     * @param _user Address of the member
     * @param _creator Address of the creator
     * @dev SECURITY FIX C-3: Use safe subtraction to prevent underflow
     */
    function __revisionRep(address _user, address _creator) external ctcCall {
        uint256 penalty = IDataContract(addressRegistry.__dataContract()).__getRevisionPenalty();
        
        // SECURITY FIX C-3: Safe subtraction for both user and creator
        uint256 memberRep = Users[_user].reputation;
        Users[_user].reputation = memberRep > penalty ? memberRep - penalty : 0;
        
        uint256 creatorRep = Users[_creator].reputation;
        Users[_creator].reputation = creatorRep > penalty ? creatorRep - penalty : 0;
    }

    /**
     * @notice Adds task acceptance rewards to both user and creator's reputation
     * @param _user Address of the member
     * @param _creator Address of the creator
     */
    function __taskAcceptRep(address _user, address _creator) external ctcCall {
        IDataContract dataContract = IDataContract(addressRegistry.__dataContract());
        
        Users[_user].reputation += dataContract.__getTaskAcceptMember();
        Users[_creator].reputation += dataContract.__getTaskAcceptCreator();
    }

    /**
     * @notice Deducts deadline hit penalties from both user and creator's reputation
     * @param _user Address of the member
     * @param _creator Address of the creator
     * @dev SECURITY FIX C-3: Use safe subtraction to prevent underflow
     */
    function __deadlineHitRep(address _user, address _creator) external ctcCall{
        IDataContract dataContract = IDataContract(addressRegistry.__dataContract());
        
        // SECURITY FIX C-3: Safe subtraction for member
        uint256 memberRep = Users[_user].reputation;
        uint256 memberPenalty = dataContract.__getDeadlineHitMember();
        Users[_user].reputation = memberRep > memberPenalty ? memberRep - memberPenalty : 0;
        
        // SECURITY FIX C-3: Safe subtraction for creator
        uint256 creatorRep = Users[_creator].reputation;
        uint256 creatorPenalty = dataContract.__getDeadlineHitCreator();
        Users[_creator].reputation = creatorRep > creatorPenalty ? creatorRep - creatorPenalty : 0;
    }

    function __penaltyIsBiggerThanReputation(address _user) external ctcCall {
        Users[_user].reputation = 0;
    }
}