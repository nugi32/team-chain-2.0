// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./utils/addressUtils.sol";

import "./interfaces/accessControl/IWallet.sol";
import "./interfaces/accessControl/IUser.sol";
import "./interfaces/accessControl/IMain.sol";

contract addressInitializer is systemAddressUtils{

    error addressInitializerError(string message);

    struct deployedAddresses {
        address accessControl;
        address systemWallet;
        address stateVariable;
        address mainContract;
        address userContract;
    }

    deployedAddresses public addresses;
    address public owner;

    IWallet public walletContract;
    IUser public userContract;
    IMain public mainContract;

    constructor() {
        owner = msg.sender;
    }   

    modifier onlyOwner() {
        if (msg.sender != owner) revert addressInitializerError("Caller is not the owner");
        _;
    }

    function __addressDataInitializer(
        address _accessControl,
        address _systemWallet,
        address _stateVariable,
        address _mainContract,
        address _userContract
    ) external onlyOnce callerZeroAddr onlyOwner {

        if (_accessControl == address(0) || 
            _systemWallet == address(0) || 
            _stateVariable == address(0) ||
            _mainContract == address(0) ||  
            _userContract == address(0)
            ) {
            revert addressInitializerError("One or more addresses are zero addresses");
        }

        addresses.accessControl = _accessControl;
        addresses.systemWallet = _systemWallet;
        addresses.stateVariable = _stateVariable;
        addresses.mainContract = _mainContract;
        addresses.userContract = _userContract;
    }

    function initializeAll() external onlyOwner callerZeroAddr onlyOnce {

        walletContract = IWallet(addresses.systemWallet);
        userContract = IUser(addresses.userContract);
        mainContract = IMain(addresses.mainContract);

        walletContract.__walletAddressInitializer(
            addresses.stateVariable,
            addresses.accessControl
        );

    }   
}