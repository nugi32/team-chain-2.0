// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* =======================
        IMPORTS
======================= */
import "../Pipe/AccesControlPipes.sol";
import "../system/utils/ReentrancyGuard.sol";
import "../system/utils/addressUtils.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IStateVariable.sol";

/* =======================
        CONTRACT
======================= */

/// @title System Wallet
/// @notice Upgradeable system wallet supporting ETH & multiple ERC20 tokens
/// @author nugi
contract systemWallet is
    MainAccesControlPipes,
    UUPSUpgradeable,
    PausableUpgradeable,
    SystemReentrancyGuard,
    systemAddressUtils
{

    using SafeERC20 for IERC20;
    /* =======================
            STORAGE
    ======================= */ 

    uint256 internal contractBalance;
    IStateVariable public stateVariable;
    address public stateVar;
    address public addressInitializerContract;

    /// @dev Storage gap for upgrade safety
    uint256[50] private ___gap;
//
    /* =======================
            EVENTS
    ======================= */

    event contract_transfered_fund(address indexed to, uint256 indexed amount);
    event contract_received_fund(address indexed from, uint256 indexed amount);

    event contract_transferred_token(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    event AccessControlChanged(address newAccessControl);
    event ContractPaused(address indexed caller);
    event ContractUnpaused(address indexed caller);

    /* =======================
            ERRORS
    ======================= */

    error InsufficientFunds();
    error ZeroAddress();
//
    /* =======================
        INITIALIZER
    ======================= */

    function initialize() public initializer {
        __ReentrancyGuard_init();
    }

function __walletAddressInitializer(
    address _stateVariable,
    address _accessControl
) external ctcCall(addressInitializerContract) onlyOnce {

    if (_stateVariable == address(0) || _accessControl == address(0)) {
        revert ZeroAddress();
    }

    stateVar = _stateVariable;
    stateVariable = IStateVariable(_stateVariable);
    accessControl = IAccessControl(_accessControl);
}


    /* =======================
        ETH TRANSFER
    ======================= */
//
function transfer(
    address payable _to,
    uint256 _amount
) external onlyOwner(stateVariable.__getAccessControlAddress()) nonReentrant whenNotPaused {
    if (_to == address(0)) revert ZeroAddress();
    if (address(this).balance < _amount) revert InsufficientFunds();

    // Update state SEBELUM call (Checks-Effects-Interactions pattern)
    contractBalance -= _amount;

    (bool success, ) = _to.call{value: _amount}("");
    require(success, "ETH transfer failed");

    emit contract_transfered_fund(_to, _amount);
}

    /* =======================
        ERC20 TRANSFER
    ======================= */
function transferToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner(stateVariable.__getAccessControlAddress()) nonReentrant whenNotPaused {
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        IERC20 erc20 = IERC20(token);
        if (erc20.balanceOf(address(this)) < amount) revert InsufficientFunds();

        contractBalance -= amount;

        erc20.safeTransfer(to, amount);  // ✓ Aman untuk semua token

        emit contract_transferred_token(token, to, amount);
    }

    function batchTransferToken(
        address[] calldata tokens,
        address[] calldata tos,
        uint256[] calldata amounts
    ) external onlyOwner(stateVariable.__getAccessControlAddress()) nonReentrant whenNotPaused {
        uint256 length = tokens.length;
        require(
            length == tos.length && length == amounts.length,
            "Length mismatch"
        );

        for (uint256 i = 0; i < length; i++) {
            if (tokens[i] == address(0) || tos[i] == address(0))
                revert ZeroAddress();

            IERC20 erc20 = IERC20(tokens[i]);
            if (erc20.balanceOf(address(this)) < amounts[i])
                revert InsufficientFunds();

            contractBalance -= amounts[i];

            erc20.safeTransfer(tos[i], amounts[i]);  // ✓ Aman

            emit contract_transferred_token(tokens[i], tos[i], amounts[i]);
        }
    }
    /* =======================
        VIEW FUNCTIONS
    ======================= */

    function tokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
//
    /* =======================
        ACCESS CONTROL
    ======================= */

    function __changeWalletAccessControl(address _newAccesControl)
        external
        ctcCall(stateVar)
    {
        if(_newAccesControl == address(0)) revert ZeroAddress();
        accessControl = IAccessControl(_newAccesControl);
        emit AccessControlChanged(_newAccesControl);
    }

    function changeStateVariable(address _newStateVariable)
        external
        onlyOwner(stateVariable.__getAccessControlAddress())
    {
        if(_newStateVariable == address(0)) revert ZeroAddress();
        stateVariable = IStateVariable(_newStateVariable);
        emit AccessControlChanged(_newStateVariable);
    }

    /* =======================
        PAUSE CONTROL
    ======================= */

    function pause() external onlyOwner(stateVariable.__getAccessControlAddress()) {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyOwner(stateVariable.__getAccessControlAddress()) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    /* =======================
        RECEIVE / FALLBACK
    ======================= */

    receive() external payable {
        contractBalance += msg.value;
        emit contract_received_fund(msg.sender, msg.value);
    }

    fallback() external payable {
        contractBalance += msg.value;
        emit contract_received_fund(msg.sender, msg.value);
    }

    /* =======================
        UUPS AUTH
    ======================= */

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner(stateVariable.__getAccessControlAddress())
    {}
}