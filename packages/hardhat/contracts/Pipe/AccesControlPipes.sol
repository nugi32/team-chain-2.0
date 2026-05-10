// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../system/interfaces/IAccessControl.sol";

/// @title AccessControl (Upgradeable)
/// @notice Abstract contract providing access checks using a shared EmployeeAssignment contract.
abstract contract MainAccesControlPipes {

    // ===========================
    // Internal Access Functions
    // ===========================

    /// @notice Checks that caller is NOT an employee and NOT the owner
    function __onlyUser(address accessControlAddress) internal view {
        require(
            !IAccessControl(accessControlAddress).hasRole(msg.sender),
            "Is employee"
        );
        require(
            msg.sender != IAccessControl(accessControlAddress).owner(),
            "Caller is owner"
        );
    }

    /// @notice Checks that caller IS the owner
    function __onlyOwner(address accessControlAddress) internal view {
        require(
            msg.sender == IAccessControl(accessControlAddress).owner(),
            "Not owner"
        );
    }

    /// @notice Checks that caller IS an employee
    function __onlyEmployes(address accessControlAddress) internal view {
        require(
            IAccessControl(accessControlAddress).hasRole(msg.sender),
            "Not employee"
        );
    }
}