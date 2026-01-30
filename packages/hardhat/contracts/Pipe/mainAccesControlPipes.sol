// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Access Control Helper for Upgradeable Contracts
/// @notice Provides standardized ownership and employee access modifiers based on a central EmployeeAssignment contract.
/// @dev This contract is intended to be inherited by other upgradeable contracts.
/// It relies on an external `IEmployeeAssignment` contract to determine ownership and roles.
interface IAccessControl {
    /// @notice Returns the address of the contract owner.
    function owner() external view returns (address);

    /// @notice Checks if an account has a specific role.
    /// @param account The address of the account to check.
    /// @return bool True if the account has the given role, false otherwise.
    function hasRole(address account) external view returns (bool);
}

/// @title AccessControl (Upgradeable)
/// @notice Abstract contract providing access modifiers using a shared EmployeeAssignment contract.
/// @dev Uses OpenZeppelin Initializable for upgradeable pattern.
abstract contract MainAccesControl {
    /// @notice Reference to the central EmployeeAssignment contract.
    IAccessControl public accessControl;

    // ===========================
    // Access Modifiers
    // ===========================

    /// @notice Restricts function access to users who do not have the "Employe" role.
    modifier onlyUser() {
        require(!accessControl.hasRole(msg.sender), "Is employee");
        require(msg.sender != accessControl.owner(), "Caller is owner");
        _;
    }
    
    /// @notice Restricts function access to only the contract owner.
    modifier onlyOwner() {
        require(msg.sender == accessControl.owner(), "Not owner");
        _;
    }

    /// @notice Restricts calls from the zero address.
    modifier callerZeroAddr() {
        require(msg.sender != address(0), "caller is cant be zero addr !");
        _;
    }
}
