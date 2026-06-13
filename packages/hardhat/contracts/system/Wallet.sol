// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* =======================
        IMPORTS
======================= */
import "../Pipe/AccesControlPipes.sol";
import "./utils/ReentrancyGuard.sol";
import "./utils/addressUtils.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IAddressRegistry.sol";
import "./interfaces/IDataContract.sol";

/* =======================
        CONTRACT
======================= */

/// @title System Wallet
/// @notice Upgradeable system wallet supporting ETH & multiple ERC20 tokens
/// @author nugi
contract System_wallet is
    MainAccesControlPipes,
    UUPSUpgradeable,
    PausableUpgradeable,
    SystemReentrancyGuard,
    AddressUtils
{
    using SafeERC20 for IERC20;

    /* =======================
            STORAGE
    ======================= */
    IAddressRegistry public addressRegistry;

    /// @dev Storage gap for upgrade safety
    uint256[50] private ___gap;

//
    /* =======================
            EVENTS
    ======================= */

    event walletContractEvent(string eventName, address indexed param1, uint256 indexed param2);

    /* =======================
            ERRORS
    ======================= */

    error InsufficientFunds();
    error ZeroAddress();

    modifier onlyOwner {
        __onlyOwner(addressRegistry.__accessControlContract());
        _;
    }

//
    /* =======================
        INITIALIZER
    ======================= */

    function initialize(address _addressRegistry) external initializer {
        if (_addressRegistry == address(0)) revert ZeroAddress();
        addressRegistry = IAddressRegistry(_addressRegistry);
        __ReentrancyGuard_init();
        __Pausable_init();
        emit walletContractEvent("contract initialized", _addressRegistry, 0);
    }

    /* =======================
        ETH TRANSFER
    ======================= */
//
    function transfer(
        address payable _to,
        uint256 _amount
    )
        external
        onlyOwner
        nonReentrant
        callerZeroAddr
        whenNotPaused
    {
        if (_to == address(0)) revert ZeroAddress();
        if (address(this).balance < _amount) revert InsufficientFunds();

        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");

        emit walletContractEvent("contract_transfered_fund", _to, _amount);
    }

    /* =======================
        ERC20 TRANSFER
    ======================= */

    function transferToken(
        address token,
        address to,
        uint256 amount
    )
        external
        onlyOwner
        nonReentrant
        callerZeroAddr
        whenNotPaused
    {
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        IERC20 erc20 = IERC20(token);
        if (erc20.balanceOf(address(this)) < amount)
            revert InsufficientFunds();

        erc20.safeTransfer(to, amount);

        emit walletContractEvent("contract_transferred_token", token, amount);
    }

    /* =======================
        BATCH ERC20 TRANSFER
    ======================= */

    function batchTransferToken(
        address[] calldata tokens,
        address[] calldata tos,
        uint256[] calldata amounts
    )
        external
        onlyOwner
        nonReentrant
        callerZeroAddr
        whenNotPaused
    {
        uint256 length = tokens.length;
        require(
            length == tos.length && length == amounts.length,
            "Length mismatch"
        );

        // Prevent excessively large batch operations which may run out of gas
        require(length > 0 && length <= 100, "Invalid batch size");

        for (uint256 i = 0; i < length; i++) {
            if (tokens[i] == address(0) || tos[i] == address(0))
                revert ZeroAddress();

            IERC20 erc20 = IERC20(tokens[i]);
            if (erc20.balanceOf(address(this)) < amounts[i])
                revert InsufficientFunds();

            erc20.safeTransfer(tos[i], amounts[i]);

            emit walletContractEvent("contract_transferred_token", tokens[i], amounts[i]);
        }
    }

    /* =======================
        VIEW FUNCTIONS
    ======================= */

    function tokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function ethBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /* =======================
        ACCESS CONTROL
    ======================= */

    function __changeAddressRegistry(address _newAddressRegistry) external onlyOwner {
        if (_newAddressRegistry == address(0)) revert ZeroAddress();
        addressRegistry = IAddressRegistry(_newAddressRegistry);
        emit walletContractEvent("address_registry_changed", _newAddressRegistry, 0);
    }

    /* =======================
        PAUSE CONTROL
    ======================= */

    function pause() external onlyOwner {
        _pause();
        emit walletContractEvent("contract_paused", msg.sender, 0);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit walletContractEvent("contract_unpaused", msg.sender, 0);
    }

    /* =======================
        RECEIVE / FALLBACK
    ======================= */

    receive() external payable {
        emit walletContractEvent("contract_received_fund", msg.sender, msg.value);
    }

    fallback() external payable {
        emit walletContractEvent("contract_received_fund", msg.sender, msg.value);
    }

    /* =======================
        UUPS AUTH
    ======================= */

    function _authorizeUpgrade(address)
        internal
        view
        override
        onlyOwner
    {}
}