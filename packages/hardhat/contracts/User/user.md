// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/utils/addressUtils.sol";
import "../Pipe/AccesControlPipes.sol";

contract User is addressUtils, MainAccesControl {

    IStateVariable private stateVar;

        /// @notice User profile with reputation and activity tracking
    struct User {
        uint256 totalTasksCreated;    /// @dev Total tasks created by user
        uint256 totalTasksCompleted;  /// @dev Total tasks successfully completed
        uint256 totalTasksFailed;     /// @dev Total tasks failed or cancelled
        uint128 reputation;           /// @dev Reputation score (affects project valuation)
        uint128 age;                   /// @dev User age (must be 18-100)
        bool isRegistered;           /// @dev Registration status
        string name;                 /// @dev User display name
        string GitProfile;
    }

        /// @dev User address to User profile mapping
    mapping(address => User) public Users;
    mapping(bytes32 => bool) public usedGitURL;

        /**
     * @notice Registers a new user in the protocol
     * @param Name User's display name
     * @param Age User's age (must be between 18-100)
     * @dev Creates a new user profile with initial reputation and counters
     */
    function Register(string calldata Name, uint128 Age, string calldata githubURL, address user)
        external
        onlyUser
        callerZeroAddr
    {
        User storage u = Users[user]; 
        
        // Validate registration
        if (u.isRegistered) revert AlredyRegistered();
        bytes32 gitHash = keccak256(abi.encodePacked(githubURL));
        if (usedGitURL[gitHash]) revert GitProfileAlreadyUsed();

        // Initialize user profile
        u.reputation = 0;
        u.totalTasksCompleted = 0;
        u.totalTasksFailed = 0;
        u.isRegistered = true;
        u.name = Name;
        u.age = Age;
        u.GitProfile = githubURL;
        usedGitURL[gitHash] = true;

        emit UserRegistered(user, Name, Age);
    }

    /**
     * @notice Unregisters a user and deletes their profile data
     * @return confirmation Confirmation message
     * @dev Removes user from protocol and clears their data
     */
    function Unregister(address user)
        external
        onlyRegistered
        onlyUser
        callerZeroAddr
        returns (string memory)
    {
        User memory u = Users[user];
        bytes32 gitHash = keccak256(abi.encodePacked(u.GitProfile));
        usedGitURL[gitHash] = false;
        emit UserUnregistered(user, u.name, u.age);
        delete Users[user];
        return "Unregister Successfully";
    }

function __cancelByMeRep(address user, address Creator) external {}

function __revisionRep(address user, address Creator) external {}

function __taskAcceptRep(address user, address Creator) external {}

function __deadlineHitRep(address user, address Creator) external {}




function __taskCreate(address user) external {
    Users[user].totalTasksCreated ++;
}
function __taskComplete(address user, address Creator) external {
    Users[user].totalTasksCompleted ++;
    Users[Creator].totalTasksCompleted ++;
}
function __taskFail(address user, address Creator) external {
    Users[user].totalTasksFailed ++;
    Users[Creator].totalTasksFailed ++;
}


function __isRegistered(address user) external view returns (bool) {
    return Users[user].isRegistered;
}

}