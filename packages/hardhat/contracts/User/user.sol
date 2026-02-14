// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/utils/addressUtils.sol";
import "../system/utils/ReentrancyGuard.sol";
import "../Pipe/AccesControlPipes.sol";
import "../system/interfaces/IStateVariable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UsersContract is systemAddressUtils, Initializable, UUPSUpgradeable, PausableUpgradeable,MainAccesControlPipes, SystemReentrancyGuard {

    IStateVariable private stateVar;

        /// @notice User profile with reputation and activity tracking
    struct User {
        uint256 totalTasksCreated;    /// @dev Total tasks created by user
        uint256 totalTasksCompleted;  /// @dev Total tasks successfully completed
        uint256 totalTasksFailed;     /// @dev Total tasks failed or cancelled
        uint256 reputation;           /// @dev Reputation score (affects project valuation)
        uint256 age;      
        uint256 balance;             /// @dev User age (must be 18-100)
        bool isRegistered;           /// @dev Registration status
        bool isActive;
        string name;                 /// @dev User display name
        string GitProfile;
    }

        /// @dev User address to User profile mapping
    mapping(address => User) public Users;
    mapping(bytes32 => bool) public usedGitURL;

    event userEvent(string eventName, address userAddress, string userName, uint256 eventValue);

    error userErros(string errName);

        /**
     * @notice Registers a new user in the protocol
     * @param _name User's display name
     * @param _age User's age (must be between 18-100)
     * @dev Creates a new user profile with initial reputation and counters
     */
    function Register(string calldata _name, uint256 _age, string calldata _githubURL, address _user)
        external
        onlyUser(stateVar.__getAccessControlAddress())
        callerZeroAddr
    {
        User storage u = Users[_user]; 
        
        // Validate registration
        if (u.isRegistered) revert userErros("AlredyRegistered");
        bytes32 gitHash = keccak256(abi.encodePacked(_githubURL));
        if (usedGitURL[gitHash]) revert userErros("GitProfileAlreadyUsed");

        // Initialize user profile
        u.reputation = 0;
        u.totalTasksCompleted = 0;
        u.totalTasksFailed = 0;
        u.balance = 0;
        u.isRegistered = true;
        u.name = _name;
        u.age = _age;
        u.GitProfile = _githubURL;
        u.isActive = true;
        usedGitURL[gitHash] = true;

        emit userEvent("UserRegistered", _user, _name, _age);
    }

    /**
     * @notice Unregisters a user and deletes their profile data
     * @return confirmation Confirmation message
     * @dev Removes user from protocol and clears their data
     */
    function Unregister(address _user)
        external
        onlyUser(stateVar.__getAccessControlAddress())
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

    function withdrawUserFund(address _user, uint256 _amount) external nonReentrant callerZeroAddr onlyUser(stateVar.__getAccessControlAddress()) {
        User storage u = Users[_user];
        if (u.balance < _amount) revert userErros("InsufficientFunds");
        u.balance -= _amount;
        payable(_user).transfer(_amount);
    }

    function withdrawAllUserFund(address _user) external nonReentrant callerZeroAddr onlyUser(stateVar.__getAccessControlAddress()) {
        User storage u = Users[_user];
        uint256 amount = u.balance;
        if (amount == 0) revert userErros("InsufficientFunds");
        u.balance = 0;
        payable(_user).transfer(amount);
        
    }


    /* =======================
        UUPS AUTH
    ======================= */

    function _authorizeUpgrade(address)
        internal
        view
        override
        onlyOwner(stateVar.__getAccessControlAddress())
    {
        if (address(accessControl) == address(0)) revert userErros("ZeroAddress");
        if (msg.sender != accessControl.owner()) revert userErros("Not owner");
    }


    /* =======================
        Exported Functions
    ======================= */

/* =======================
   USER FIELD GETTERS
======================= */

function getTotalTasksCreated(address _user)
    external
    view
    returns (uint256)
{
    return Users[_user].totalTasksCreated;
}

function getTotalTasksCompleted(address _user)
    external
    view
    returns (uint256)
{
    return Users[_user].totalTasksCompleted;
}

function getTotalTasksFailed(address _user)
    external
    view
    returns (uint256)
{
    return Users[_user].totalTasksFailed;
}

function getUserReputation(address _user)
    external
    view
    returns (uint256)
{
    return Users[_user].reputation;
}

function getUserAge(address _user)
    external
    view
    returns (uint256)
{
    return Users[_user].age;
}

function getUserBalance(address _user)
    external
    view
    returns (uint256)
{
    return Users[_user].balance;
}

function __isRegistered(address _user) public view returns (bool) {
    return Users[_user].isRegistered;
}

function getIsActive(address _user)
    external
    view
    returns (bool)
{
    return Users[_user].isActive;
}

function getUserName(address _user)
    external
    view
    returns (string memory)
{
    return Users[_user].name;
}

function getUserGitProfile(address _user)
    external
    view
    returns (string memory)
{
    return Users[_user].GitProfile;
}



/* Setters funct */

function __taskCreateCounter(address _user) external {
    Users[_user].totalTasksCreated ++;
}
function __taskCompleteCounter(address _user, address _creator) external {
    Users[_user].totalTasksCompleted ++;
    Users[_creator].totalTasksCompleted ++;
}
function __taskFailCounter(address _user, address _creator) external {
    Users[_user].totalTasksFailed ++;
    Users[_creator].totalTasksFailed ++;
}

function __addUserBalance(address _user, uint256 _amount) external {
    Users[_user].balance += _amount;
}

function __cancelByMeRep(address _user) external {
    Users[_user].reputation -= (stateVar.__getCancelByMe());
}

function __revisionRep(address _user, address _creator) external {
    Users[_user].reputation -= (stateVar.__getRevisionPenalty());
    Users[_creator].reputation -= (stateVar.__getRevisionPenalty());
}

function __taskAcceptRep(address _user, address _creator) external {
    Users[_user].reputation += (stateVar.__getTaskAcceptMember());
    Users[_creator].reputation += (stateVar.__getTaskAcceptCreator());
}

function __deadlineHitRep(address _user, address _creator) external {
    Users[_user].reputation -= (stateVar.__getDeadlineHitMember());
    Users[_creator].reputation -= (stateVar.__getDeadlineHitCreator());
}
    
}