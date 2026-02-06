// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/interfaces/IAccessControl.sol";

/// @title AccessControl (Upgradeable)
/// @notice Abstract contract providing access modifiers using a shared EmployeeAssignment contract.
/// @dev Uses OpenZeppelin Initializable for upgradeable pattern.
abstract contract MainAccesControlPipes {
    /// @notice Reference to the central EmployeeAssignment contract.
    IAccessControl public accessControl;

    // ===========================
    // Access Modifiers
    // ===========================

    /// @notice Restricts function access to users who do not have the "Employe" role.
    modifier onlyUser(address accessControlAddress) {
        require(!IAccessControl(accessControlAddress).hasRole(msg.sender), "Is employee");
        require(msg.sender != IAccessControl(accessControlAddress).owner(), "Caller is owner");
        _;
    }
    
    /// @notice Restricts function access to only the contract owner.
    modifier onlyOwner(address accessControlAddress) {
        require(msg.sender == IAccessControl(accessControlAddress).owner(), "Not owner");
        _;
    }

    modifier onlyEmployes(address accessControlAddress) {
        require(IAccessControl(accessControlAddress).hasRole(msg.sender), "Not employee");
        _;
    }
}
