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
