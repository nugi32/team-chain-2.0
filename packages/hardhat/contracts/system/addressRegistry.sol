// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/addressUtils.sol";
import "../Pipe/AccesControlPipes.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AddressRegistry is
    systemAddressUtils,
    MainAccesControlPipes,
    Initializable,
    UUPSUpgradeable,
    PausableUpgradeable
{
    // =============================================================
    //                          STORAGE
    // =============================================================

    address public accessControlContract;
    address public usersContract;
    address public mainContract;
    address payable public walletContract;
    address public dataContract;

    // Reserved storage space for future upgrades
    uint256[50] private ___gap;

    // =============================================================
    //                          ERRORS
    // =============================================================

    error AddressRegistryErr(string errName);

    // =============================================================
    //                          EVENTS
    // =============================================================

    event AddressRegistryEvent(string eventName, address indexed value);

    event ContractInitialized(
        address accessControlContract,
        address usersContract,
        address mainContract,
        address walletContract,
        address dataContract
    );

    // =============================================================
    //                      INTERNAL HELPERS
    // =============================================================

    /// @dev Returns true if the provided address is zero.
    function __isZeroAdr(address _addr) internal pure returns (bool) {
        return _addr == address(0);
    }

    // =============================================================
    //                      INITIALIZER
    // =============================================================

    /// @dev Initializes the registry with required contract addresses.
    /// Can only be called once.
    function initialize(
        address _accessControlContract,
        address _usersContract,
        address _mainContract,
        address payable _walletContract,
        address _dataContract
    ) public initializer {
        if (
            _accessControlContract == address(0) ||
            _usersContract == address(0) ||
            _mainContract == address(0) ||
            _walletContract == address(0) ||
            _dataContract == address(0)
        ) {
            revert AddressRegistryErr("All addresses must be non-zero");
        }

        accessControlContract = _accessControlContract;
        usersContract = _usersContract;
        mainContract = _mainContract;
        walletContract = _walletContract;
        dataContract = _dataContract;

        emit ContractInitialized(
            _accessControlContract,
            _usersContract,
            _mainContract,
            _walletContract,
            _dataContract
        );
    }

    // =============================================================
    //                  ADDRESS UPDATE FUNCTIONS
    // =============================================================

    /// @dev Updates AccessControl contract address.
    function changeAccessControlAddr(address _newAccessControl)
        external
        onlyOwner(accessControlContract)
        callerZeroAddr
    {
        if (__isZeroAdr(_newAccessControl)) {
            revert AddressRegistryErr("New address cannot be zero");
        }

        accessControlContract = _newAccessControl;

        emit AddressRegistryEvent(
            "AccessControlAddressChanged",
            _newAccessControl
        );
    }

    /// @dev Updates Users contract address.
    function changeUsersAddr(address _newUsers)
        external
        onlyOwner(accessControlContract)
        callerZeroAddr
    {
        if (__isZeroAdr(_newUsers)) {
            revert AddressRegistryErr("New address cannot be zero");
        }

        usersContract = _newUsers;

        emit AddressRegistryEvent("UsersAddressChanged", _newUsers);
    }

    /// @dev Updates Main contract address.
    function changeMainAddr(address _newMain)
        external
        onlyOwner(accessControlContract)
        callerZeroAddr
    {
        if (__isZeroAdr(_newMain)) {
            revert AddressRegistryErr("New address cannot be zero");
        }

        mainContract = _newMain;

        emit AddressRegistryEvent("MainAddressChanged", _newMain);
    }

    /// @dev Updates Wallet contract address.
    function changeWalletAddr(address payable _newWallet)
        external
        onlyOwner(accessControlContract)
        callerZeroAddr
    {
        if (__isZeroAdr(_newWallet)) {
            revert AddressRegistryErr("New address cannot be zero");
        }

        walletContract = _newWallet;

        emit AddressRegistryEvent("WalletAddressChanged", _newWallet);
    }

    /// @dev Updates Data contract address.
    function changeDataAddr(address _newData)
        external
        onlyOwner(accessControlContract)
        callerZeroAddr
    {
        if (__isZeroAdr(_newData)) {
            revert AddressRegistryErr("New address cannot be zero");
        }

        dataContract = _newData;

        emit AddressRegistryEvent("DataAddressChanged", _newData);
    }

    // =============================================================
    //                        PAUSABLE
    // =============================================================

    /// @dev Pauses the contract.
    function pause() external onlyOwner(accessControlContract) {
        _pause();
        emit AddressRegistryEvent("ContractPaused", msg.sender);
    }

    /// @dev Unpauses the contract.
    function unpause() external onlyOwner(accessControlContract) {
        _unpause();
        emit AddressRegistryEvent("ContractUnpaused", msg.sender);
    }

    // =============================================================
    //                    UUPS AUTHORIZATION
    // =============================================================

    /// @dev Authorizes contract upgrades (UUPS pattern).
    function _authorizeUpgrade(address)
        internal
        view
        override
        onlyOwner(accessControlContract)
    {}
}
