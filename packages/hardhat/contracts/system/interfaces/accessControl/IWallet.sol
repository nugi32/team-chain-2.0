// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWallet {
    function __changeWalletAccessControl(address _newAccesControl) external;
    function __walletAddressInitializer(address _stateVariable, address _accessControl) external;
}