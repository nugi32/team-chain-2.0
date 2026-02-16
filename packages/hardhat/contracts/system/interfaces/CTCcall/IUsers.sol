// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IUsers
 * @notice Interface for UsersContract getter and setter functions
 */
interface IUsers {
    /* =======================
        USER FIELD GETTERS
    ======================= */

    function __getTotalTasksCreated(address _user) external view returns (uint256);
    function __getTotalTasksCompleted(address _user) external view returns (uint256);
    function __getTotalTasksFailed(address _user) external view returns (uint256);
    function __getUserReputation(address _user) external view returns (uint256);
    function __getUserAge(address _user) external view returns (uint256);
    function __getUserBalance(address _user) external view returns (uint256);
    function __isRegistered(address _user) external view returns (bool);
    function __getIsActive(address _user) external view returns (bool);
    function __getUserName(address _user) external view returns (string memory);
    function __getUserGitProfile(address _user) external view returns (string memory);

    /* =======================
        SETTER FUNCTIONS
    ======================= */

    function __taskCreateCounter(address _user) external;
    function __taskCompleteCounter(address _user, address _creator) external;
    function __taskFailCounter(address _user, address _creator) external;
    function __addUserBalance(address _user, uint256 _amount) external;
    function __cancelByMeRep(address _user) external;
    function __revisionRep(address _user, address _creator) external;
    function __taskAcceptRep(address _user, address _creator) external;
    function __deadlineHitRep(address _user, address _creator) external;
}