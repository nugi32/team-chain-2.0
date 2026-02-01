// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract addressUtils {

    error addressUtilsEror(string message);

    modifier callerZeroAddr() {
        if (msg.sender == address(0)) revert addressUtilsEror("Caller cannot be zero address");
        _;
    }

    modifier ctcCall(address ctcAddress) {
        if (msg.sender != ctcAddress) revert addressUtilsEror("Caller is not authorized contract");
        _;
    }
}