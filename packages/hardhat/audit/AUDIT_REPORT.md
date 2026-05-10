# Audit Report — Full Contract Scan

Date: 2026-04-08
Scope: all Solidity files under `packages/hardhat/contracts/`

## Summary
- Critical: 2
- High: 2
- Medium: 3
- Low: 3

## Critical issues
- `UsersContract.ctcCall` authorization logic is broken.
  - File: `contracts/User/user.sol`
  - Issue: the modifier is written as `if (msg.sender != a || msg.sender != b || ...) revert`, which always evaluates to `true` when there is more than one comparison. As a result, all protected setter functions such as `__addUserBalance`, `__takeUserBalance`, and reputation update calls will revert.
  - Impact: the entire task flow cannot update user balances or reputation, making the system unusable.

- `TaskLifecycleLogic.__deleteTask` calls the wrong contract address for cancellation.
  - File: `contracts/mainSystem/module/TaskLifecycleLogic.sol`
  - Issue: the function uses `addressRegistry.__dataContract()` instead of `addressRegistry.__taskComponentsAddr().cancelModule` for the cancel logic call.
  - Impact: task deletion resolves to the data contract address instead of the cancellation module, causing incorrect behavior or a revert.

## High issues
- `TaskController.createTask` emits a hardcoded task ID of `0`.
  - File: `contracts/mainSystem/controller/TaskController.sol`
  - Issue: the `ControllerEvent("TaskCreated", 0, _user)` event does not reflect the real task ID returned by the lifecycle logic.
  - Impact: logs are misleading for off-chain indexing and post-deploy monitoring.

- `AddressRegistry.updateCoreAddresses` has unused function parameters.
  - File: `contracts/system/addressRegistry.sol`
  - Issue: `_taskDataContract` and `_taskDataContractCaller` are accepted by the function signature but never stored.
  - Impact: this is a maintenance issue and causes confusion when wiring registry state.

## Medium issues
- `JoinRequestLogic.__requestJoinTask` refunds excess ETH using `.transfer()`.
  - File: `contracts/mainSystem/module/JoinRequestLogic.sol`
  - Issue: legacy transfer semantics can fail for contract recipients.
  - Recommendation: change the refund path to `call` with a success check.

- `AddressUtils.callerZeroAddr` is not meaningful in EVM execution.
  - File: `contracts/system/utils/addressUtils.sol`
  - Issue: checking `msg.sender == address(0)` is effectively unreachable in normal transactions.
  - Recommendation: remove the modifier or replace it with a real threat model.

- Logic module initialization order is brittle.
  - Files: `AddressRegistry`, `TaskController`, `taskData`, `UsersContract`, `System_wallet`
  - Issue: contracts rely on `AddressRegistry` being fully configured before runtime; missing or out-of-order wiring can lock functionality.
  - Recommendation: preserve deployment order and add explicit post-deploy registry setup.

## Low issues
- `TaskData.__getJoinRequestByUser` requires `hasPendingRequest` and may be inconsistent after status updates.
  - File: `contracts/mainSystem/taskData.sol`
  - Observation: the lookup uses a pending-request mapping, which is fine, but future refactors should validate mapping consistency on deletes.

- Some code comments and event names are outdated or inconsistent.
  - Recommendation: clean up `emit` strings and align event payloads with actual state changes.

- `AccessControlPipes` external access checks are valid, but each call incurs a cross-contract call.
  - Impact: small gas overhead and dependency on access control availability.

## Deployment notes
- A new full-system deployment script was added at `packages/hardhat/deploy/full-system.ts`.
- The wrapper `packages/hardhat/scripts/runHardhatDeployWithPK.ts` now defaults to `--tags FullSystem` when no deploy tags are specified.
- The deploy script deploys and wires:
  - `AccessControl`
  - `AddressRegistry`
  - `taskData`
  - `UsersContract`
  - `System_wallet`
  - `dataContract`
  - `TaskLifecycleLogic`
  - `SubmissionLogic`
  - `JoinRequestLogic`
  - `CancellationLogic`
  - `TaskController`

## Recommended fixes before production
1. Repair `UsersContract.ctcCall` modifier logic to allow valid caller addresses.
2. Fix cancellation routing in `TaskLifecycleLogic.__deleteTask`.
3. Add a regression test that covers the registry wiring and user balance updates.
4. Consider simplifying the registry initialization interface to reduce deployment fragility.
  - Issue: `_authorizeUpgrade` menggunakan `onlyOwner(stateVariable.__getAccessControlAddress())`. Jika `stateVariable` belum diset, upgradeability bisa terkunci; juga bergantung pada external call.
  - Rekomendasi: simpan `upgradeAdmin` address saat inisialisasi atau gunakan `accessControlAddress` langsung (yang diinisialisasi terlebih dahulu) untuk mengurangi dependency pada call eksternal.

- Access control external calls (gas/availability) — Low
  - File: contracts/Pipe/AccesControlPipes.sol
  - Issue: setiap modifier memanggil eksternal (`IAccessControl(...).hasRole(...)` dan `.owner()`) setiap kali; itu normal tapi perlu dokumentasi bahwa panggilan ini bergantung pada availability kontrak access control.
  - Rekomendasi: cache `accessControl` address ketika relevan; minimal tambahkan catatan pada README deploy mengenai urutan dan dependensi kontrak.

- Reentrancy guard — Low
  - File: contracts/system/utils/reetancyGuard.sol
  - Status: implementasi berbasis storage slot terlihat serupa dengan OZ pattern. Fungsi transfer ETH dan token di-guard dengan `nonReentrant`.
  - Rekomendasi: tetap gunakan Checks-Effects-Interactions untuk fungsi yang mengubah state internal sebelum melakukan panggilan eksternal.

Catatan tambahan
- Tidak ditemukan `delegatecall`, `tx.origin`, `selfdestruct`, atau `assembly` di scope (selain import Proxy ERC1967). Ini positif.

Saran Perbaikan Singkat (prioritas tinggi diterapkan dulu)
- Perbaiki urutan assignment di `__walletAddressInitializer` di `contracts/system/Wallet.sol`.
- Ubah `onlyOnce` menjadi flag per-fungsi di `contracts/system/addressInitializer.sol`.
- Tambahkan `SafeERC20` dan gunakan `SafeERC20.safeTransfer` di `Wallet.sol`.
- Batasi ukuran batch atau ubah pola distribusi token.
- Dokumentasikan urutan deploy dan inisialisasi di `README` (atau deploy script) sehingga operator tahu langkah aman.

File yang diperiksa (ringkasan):
- contracts/system/Wallet.sol
- contracts/system/StateVariable.sol
- contracts/system/addressInitializer.sol
- contracts/Pipe/AccesControlPipes.sol
- contracts/system/AccesControl.sol
- contracts/system/utils/reetancyGuard.sol
- contracts/system/utils/addressUtils.sol
- contracts/system/utils/ProxyImports.sol

---

# Comprehensive Security Audit Report - Full Scope

Date: March 24, 2026

Scope: All Solidity contracts in `/packages/hardhat/contracts/`, including User contracts and mainSystem.

## Summary of Findings
- **Critical Issues:** 2
- **High Issues:** 1
- **Medium Issues:** 3
- **Low Issues:** 2
- **Informational:** 1

## Critical Issues

### 1. Incorrect Contract Address in TaskLifecycleLogic.__deleteTask
**Location:** `TaskLifecycleLogic.sol:113`
**Description:** The code calls `ICancellationLogic(addressRegistry.__dataContract()).__cancelByMe(_taskId, _user);` but `addressRegistry.__dataContract()` is the dataContract address, not cancelModule.
**Impact:** Task deletion fails or calls wrong function, leading to fund loss or incorrect state.
**Recommendation:** Change to `ICancellationLogic(addressRegistry.__taskComponentsAddr().cancelModule).__cancelByMe(_taskId, _user);`

### 2. Missing Access Control on User Contract Setter Functions
**Location:** `user.sol` - All `__*` setter functions
**Description:** Functions like `__addUserBalance` are external without access control, allowing anyone to manipulate balances.
**Impact:** Arbitrary balance and reputation manipulation.
**Recommendation:** Add modifier: `modifier onlyAuthorized() { require(msg.sender == addressRegistry.__taskComponentsAddr().taskControler, "Unauthorized"); _; }`

## High Issues

### 1. Potential Reentrancy in User Withdraw Functions
**Location:** `user.sol` withdraw functions
**Description:** Uses `.transfer()` which can fail.
**Impact:** Failed withdrawals.
**Recommendation:** Use `.call()` with success check.

## Medium Issues

### 1. Gas Inefficient Loop in JoinRequestLogic
**Location:** `JoinRequestLogic.sol:60-66`
**Description:** Loop over all requests for duplicate check.
**Impact:** High gas costs.
**Recommendation:** Use mapping for pending requests.

### 2. Lack of Input Validation in DataContract Constructor
**Location:** `dataContract.sol` constructor
**Description:** No individual percentage validation.
**Impact:** Invalid configs.
**Recommendation:** Add `require(_feePercentage <= 100);`

### 3. Unsafe External Call in Wallet Contract
**Location:** `Wallet.sol:67`
**Description:** `.call()` without success check.
**Impact:** Silent failures.
**Recommendation:** Check success.

## Low Issues

### 1. Use of Deprecated .transfer()
**Recommendation:** Migrate to `.call()`.

### 2. Missing Events in Setters
**Recommendation:** Add events.

## Informational

### 1. Improve Documentation
**Recommendation:** Add NatSpec comments.

## Conclusion
Fix critical issues before deployment. The system has good patterns but needs access control fixes.
