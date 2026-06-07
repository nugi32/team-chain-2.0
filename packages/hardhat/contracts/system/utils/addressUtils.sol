// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract AddressUtils {

    error addressUtilsEror(string message);

    modifier callerZeroAddr() {
        if (msg.sender == address(0)) revert addressUtilsEror("Caller cannot be zero address");
        _;
    }
}