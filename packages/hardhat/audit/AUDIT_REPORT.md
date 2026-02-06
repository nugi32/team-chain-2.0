# Audit Ringkas — System Contracts (exclude `contracts/User`)

Tanggal: 2026-02-06

Scope: semua file di `contracts/` kecuali `contracts/User/`

Ringkasan Temuan (tingkat prioritas ditandai: High / Medium / Low)

- Wallet initialization ordering — High
  - File: contracts/system/Wallet.sol
  - Issue: fungsi `__walletAddressInitializer` membaca `stateVariable.__getAccessControlAddress()` sebelum `stateVariable` di-set (menggunakan `stateVariable` yang belum diassign). Ini akan revert atau menghasilkan perilaku tak terduga saat address belum diinisialisasi.
  - Rekomendasi: set `stateVariable = IStateVariable(_stateVariable);` terlebih dahulu dan gunakan parameter yang diteruskan untuk validasi. Tambahkan cek `require(_stateVariable != address(0))` sebelum memanggil eksternal.

- Shared `onlyOnce` boolean (inisialisasi) — High
  - File: contracts/system/addressInitializer.sol & contracts/system/utils/addressUtils.sol
  - Issue: modifier `onlyOnce` menggunakan satu boolean `hasCalled` untuk seluruh kontrak. Karena beberapa fungsi inisialisasi memakai modifier ini, satu pemanggilan akan memblokir fungsi lain (mis-ordering inisialisasi).
  - Rekomendasi: gunakan flag terpisah (`hasInitializedAddresses`, `hasRunInitializeAll`) atau atur state machine inisialisasi yang eksplisit.

- Dependensi urutan inisialisasi (general) — Medium
  - File: beberapa (Wallet, StateVariable, addressInitializer)
  - Issue: banyak modifier dan pengecekan akses bergantung pada `stateVariable` atau `accessControl` telah ter-set; jika urutan inisialisasi salah, kontrak menjadi terkunci atau revert.
  - Rekomendasi: dokumentasikan urutan inisialisasi dan tambahkan `require`/error messages yang jelas; pertimbangkan inisialisasi atomic dalam satu fungsi atau pattern initializer yang memanggil tiap sub-initializer dalam urutan aman.

- ERC20 transfer handling (non-standard tokens) — Medium
  - File: contracts/system/Wallet.sol
  - Issue: menggunakan `IERC20.transfer(...)` dan memeriksa boolean return. Beberapa token legacy tidak mengembalikan bool dan akan break.
  - Rekomendasi: gunakan `SafeERC20` (OpenZeppelin) untuk kompatibilitas dan pengecekan yang aman.

- Batch transfer gas / DoS by gas — Medium
  - File: contracts/system/Wallet.sol
  - Issue: `batchTransferToken` menerima array dinamis tanpa batas panjang sehingga transaksi besar bisa gagal (gas) atau mengakibatkan partial failure.
  - Rekomendasi: batasi `tokens.length` maksimal, atau gunakan mekanisme off-chain + merkle/pull pattern.

- Inefektif / unnecessary checks — Low
  - File: contracts/system/utils/addressUtils.sol
  - Issue: modifier `callerZeroAddr` memeriksa `msg.sender == address(0)`; nilai ini tidak mungkin di EVM normal. Ini menambah kebingungan.
  - Rekomendasi: hapus atau ganti dengan cek relevan (mis. `tx.origin` usage atau pengecekan kontrak vs EOA jika memang dimaksudkan).

- UUPS upgradeability authorization coupling — Medium
  - File: contracts/system/Wallet.sol
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

Jika Anda setuju, saya bisa membuat patch berikut:
- Satu commit untuk memperbaiki `__walletAddressInitializer` order + menambahkan non-zero checks.
- Satu commit untuk mengganti `onlyOnce` tunggal dengan dua flag boolean eksplisit.
- Satu commit untuk mengganti transfer ERC20 dengan `SafeERC20`.

Pilih aksi yang Anda ingin saya lakukan sekarang: buat patch otomatis, atau hanya simpan laporan ini? File laporan dibuat di `audit/AUDIT_REPORT.md`.
