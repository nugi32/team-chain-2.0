1. Import

import { useState } from "react";
import { ethers } from "ethers";
import { useUsersContractService } from "@/utils/lib/smartContractWrapper/user/User";

2. Ambil function contract di dalam component

const {
  withdrawUserFund,
  withdrawAllUserFund,
} = useUsersContractService();

3. Tambah state

const [withdrawAmount, setWithdrawAmount] = useState("");
const [isWithdrawing, setIsWithdrawing] = useState(false);

4. Handler withdraw jumlah tertentu

const handleWithdraw = async () => {
  try {
    if (!withdrawAmount) return;

    setIsWithdrawing(true);

    const amountInWei =
      ethers.parseEther(withdrawAmount);

    const result =
      await withdrawUserFund(amountInWei);

    if (result.success) {
      setWithdrawAmount("");
    } else {
      alert(result.error);
    }
  } catch (error: any) {
    alert(error.message);
  } finally {
    setIsWithdrawing(false);
  }
};

5. Handler withdraw all

const handleWithdrawAll = async () => {
  try {
    setIsWithdrawing(true);

    const result =
      await withdrawAllUserFund();

    if (!result.success) {
      alert(result.error);
    }
  } catch (error: any) {
    alert(error.message);
  } finally {
    setIsWithdrawing(false);
  }
};

6. UI Withdraw section

Paste di bawah summary cards:

<div className="rounded-2xl border border-gray-800 bg-gray-900 p-3 mb-3">
  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2">
    Withdraw Funds
  </p>

  <div className="flex gap-2">
    <input
      type="number"
      min="0"
      step="0.0001"
      placeholder="0.10 ETH"
      value={withdrawAmount}
      onChange={(e) =>
        setWithdrawAmount(e.target.value)
      }
      className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-blue-500"
    />

    <button
      onClick={handleWithdraw}
      disabled={isWithdrawing || !withdrawAmount}
      className="rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 px-4 text-xs font-medium text-blue-300 transition-colors disabled:opacity-50"
    >
      WD
    </button>
  </div>

  <button
    onClick={handleWithdrawAll}
    disabled={isWithdrawing}
    className="w-full mt-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium py-2 transition-colors disabled:opacity-50"
  >
    Withdraw All
  </button>
</div>