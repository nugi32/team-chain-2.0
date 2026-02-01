// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* =======================
        IMPORTS
======================= */
import "../Pipe/AccesControlPipes.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../system/utils/reetancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../system/utils/addressUtils.sol";
import "./interfaces/IStateVariable.sol";

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
    addressUtils
{
    /* =======================
            STORAGE
    ======================= */

    uint256 internal Total_Equity;
    IStateVariable public stateVariable;

    /// @dev Storage gap for upgrade safety
    uint256[50] private ___gap;

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

    /* =======================
        INITIALIZER
    ======================= */

    function initialize(address _accessControl) public initializer {
        if(_accessControl == address(0)) revert ZeroAddress();
        __ReentrancyGuard_init();
        accessControl = IAccessControl(_accessControl);
    }

    /* =======================
        ETH TRANSFER
    ======================= */

    function transfer(
        address payable _to,
        uint256 _amount
    )
        external
        onlyOwner(stateVariable.__getAccessControlAddress())
        nonReentrant
        callerZeroAddr
        whenNotPaused
    {
        if (_to == address(0)) revert ZeroAddress();
        if (address(this).balance < _amount) revert InsufficientFunds();

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
    )
        external
        onlyOwner(stateVariable.__getAccessControlAddress())
        nonReentrant
        callerZeroAddr
        whenNotPaused
    {
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        IERC20 erc20 = IERC20(token);
        if (erc20.balanceOf(address(this)) < amount)
            revert InsufficientFunds();

        bool success = erc20.transfer(to, amount);
        require(success, "ERC20 transfer failed");

        emit contract_transferred_token(token, to, amount);
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
        onlyOwner(stateVariable.__getAccessControlAddress())
        nonReentrant
        whenNotPaused
    {
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

            bool success = erc20.transfer(tos[i], amounts[i]);
            require(success, "ERC20 transfer failed");

            emit contract_transferred_token(
                tokens[i],
                tos[i],
                amounts[i]
            );
        }
    }

    /* =======================
        VIEW FUNCTIONS
    ======================= */

    function tokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /* =======================
        ACCESS CONTROL
    ======================= */

    function changeAccessControl(address _newAccesControl)
        external
        onlyOwner(stateVariable.__getAccessControlAddress())
    {
        if(_newAccesControl == address(0)) revert ZeroAddress();
        accessControl = IAccessControl(_newAccesControl);
        emit AccessControlChanged(_newAccesControl);
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
        emit contract_received_fund(msg.sender, msg.value);
    }

    fallback() external payable {
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
