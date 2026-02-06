// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract systemAddressUtils {

    bool hasCalled;

    error addressUtilsEror(string message);

    modifier callerZeroAddr() {
        if (msg.sender == address(0)) revert addressUtilsEror("Caller cannot be zero address");
        _;
    }

    modifier ctcCall(address ctcAddress) {
        if (msg.sender != ctcAddress) revert addressUtilsEror("Caller is not authorized contract");
        _;
    }

    modifier onlyOnce() {
        if (hasCalled) revert addressUtilsEror("Function can only be called once");
        hasCalled = true;
        _;
    }
}