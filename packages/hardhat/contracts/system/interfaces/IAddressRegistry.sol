// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IAddressRegistry
/// @notice Interface for reading stored contract addresses
interface IAddressRegistry {

    struct taskComponents {
        address dataContract;
        address cancelModule;
        address joinModule;
        address submisionModule;
        address taskLifecycleModule;
        address taskControler;
    }

    /// @return The AccessControl contract address
    function __accessControlContract() external view returns (address);

    /// @return The Users contract address
    function __usersContract() external view returns (address);

    /// @return The Main contract address
    function __mainContract() external view returns (address);

    /// @return The Wallet contract address
    function __walletContract() external view returns (address payable);

    /// @return The Data contract address
    function __dataContract() external view returns (address);

    /// @return The TaskData contract address
    function __taskDataContract() external view returns (address);

    /// @return The TaskData contract caller address
    function __taskDataContractCaller() external view returns (address);

    /// @return The TaskComponents struct containing all task-related module addresses
    function __taskComponentsAddr() external view returns (taskComponents memory);
}
