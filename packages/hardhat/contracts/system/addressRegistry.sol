// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/addressUtils.sol";
import "../Pipe/AccesControlPipes.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AddressRegistry is
    AddressUtils,
    MainAccesControlPipes,
    Initializable,
    UUPSUpgradeable,
    PausableUpgradeable
{
    // =============================================================
    //                          STORAGE
    // =============================================================

    struct taskComponents {
        address dataContract;
        address cancelModule;
        address joinModule;
        address submisionModule;
        address taskLifecycleModule;
        address taskControler;
    }

    taskComponents public __taskComponentsAddr;

    address public __accessControlContract;
    address public __usersContract;
    address payable public __walletContract;
    address public __dataContract;
    
    bool private __secondInitializationCalled;

    // Reserved storage space for future upgrades
    uint256[50] private ___gap;

    // =============================================================
    //                          ERRORS
    // =============================================================

    error AddressRegistryErr(string errName);

    modifier onlyOwner {
        __onlyOwner(__accessControlContract);
        _;
    }

    modifier onlyOnce {
        if (__secondInitializationCalled) revert AddressRegistryErr("SecondInitializationAlreadyCalled");
        __secondInitializationCalled = true;
        _;
    }

    // =============================================================
    //                          EVENTS
    // =============================================================

    event AddressRegistryEvent(string eventName, address indexed value);

    event ContractReInitialized(
        address usersContract,
        address walletContract,
        address dataContract,
        taskComponents taskComponentsAddr
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
        address _accessControlContract
    ) public initializer {
        if (_accessControlContract == address(0)) revert AddressRegistryErr("All addresses must be non-zero");
        
        __accessControlContract = _accessControlContract;
    }

    function ____secondInitialization(
        address _usersContract,
        address payable _walletContract,
        address _dataContract,

        //struct components
        address _taskDataContract,
        address _cancelModule,
        address _joinModule,
        address _submissionModule,
        address _taskLifecycleModule,
        address _taskControler
    ) external onlyOwner onlyOnce {
        // This function can be used for any additional setup that needs to be done after the initial deployment and initialization.
        // For example, if there are circular dependencies between contracts, this can be used to set those up after all contracts are deployed.

    if (
        _usersContract == address(0) ||
        _walletContract == address(0) ||
        _dataContract == address(0)
    ) {
        revert AddressRegistryErr("All addresses must be non-zero");
    }

    __usersContract = _usersContract;
    __walletContract = _walletContract;
    __dataContract = _dataContract;

    if (
        _taskDataContract == address(0) ||
        _cancelModule == address(0) ||
        _joinModule == address(0) ||
        _submissionModule == address(0) ||
        _taskLifecycleModule == address(0) ||
        _taskControler == address(0)
    ) {
        revert AddressRegistryErr("All task component addresses must be non-zero");
    }

    __taskComponentsAddr = taskComponents({
        dataContract: _taskDataContract,
        cancelModule: _cancelModule,
        joinModule: _joinModule,
        submisionModule: _submissionModule,
        taskLifecycleModule: _taskLifecycleModule,
        taskControler: _taskControler
    });
    
        emit ContractReInitialized(
            _usersContract,
            _walletContract,
            _dataContract,
            __taskComponentsAddr
        );
        
    }

    // =============================================================
    //                  ADDRESS UPDATE FUNCTIONS
    // =============================================================
function updateCoreAddresses(
    address _accessControlContract,
    address _usersContract,
    address payable _walletContract,
    address _dataContract
)
    external
    onlyOwner
    callerZeroAddr
{
    if (
        _accessControlContract == address(0) ||
        _usersContract == address(0) ||
        _walletContract == address(0) ||
        _dataContract == address(0)
    ) revert AddressRegistryErr("All addresses must be non-zero");
    

    __accessControlContract = _accessControlContract;
    __usersContract = _usersContract;
    __walletContract = _walletContract;
    __dataContract = _dataContract;

    emit AddressRegistryEvent("CoreAddressesUpdated", msg.sender);
}

function updateTaskComponents(
    address _dataContract,
    address _cancelModule,
    address _joinModule,
    address _submisionModule,
    address _taskLifecycleModule,
    address _taskControler
)
    external
    onlyOwner
    callerZeroAddr
{
    if (
        _dataContract == address(0) ||
        _cancelModule == address(0) ||
        _joinModule == address(0) ||
        _submisionModule == address(0) ||
        _taskLifecycleModule == address(0) ||
        _taskControler == address(0)
    ) {
        revert AddressRegistryErr("All task component addresses must be non-zero");
    }

    __taskComponentsAddr = taskComponents({
        dataContract: _dataContract,
        cancelModule: _cancelModule,
        joinModule: _joinModule,
        submisionModule: _submisionModule,
        taskLifecycleModule: _taskLifecycleModule,
        taskControler: _taskControler
    });

    emit AddressRegistryEvent("TaskComponentsUpdated", msg.sender);
}
    // =============================================================
    //                        PAUSABLE
    // =============================================================

    /// @dev Pauses the contract.
    function pause() external onlyOwner {
        _pause();
        emit AddressRegistryEvent("ContractPaused", msg.sender);
    }

    /// @dev Unpauses the contract.
    function unpause() external onlyOwner {
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
        onlyOwner
    {}
}
