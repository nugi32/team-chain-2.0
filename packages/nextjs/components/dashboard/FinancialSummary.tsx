import React, { useState } from "react";
import { Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { formatEther, parseEther } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

export default function FinancialSummary() {
  const { user, form, actions, loading } = useUsersContract();
  const addRecentTransaction = useAddRecentTransaction();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const availableBalance = user.balance ? formatEther(user.balance as bigint) : "0.0";
  const isDisabled = loading.isPending;

  const handleWithdraw = async () => {
    try {
      if (!withdrawAmount) return;
      const amountInWei = parseEther(withdrawAmount);
      form.setWithdrawAmount(amountInWei);

      const tx = await actions.handleWithdrawUserFund();

      if (tx) {
        addRecentTransaction({
          hash: tx,
          description: `Withdraw ${withdrawAmount} ETH`,
          confirmations: 2,
        });
      }

      setWithdrawAmount("");
    } catch (error: any) {
      console.error("Error withdrawing funds:", error.message);
    }
  };

  const handleWithdrawAll = async () => {
    try {
      const tx = await actions.handleWithdrawAllUserFund();

      if (tx) {
        addRecentTransaction({
          hash: tx,
          description: `Withdraw All — ${availableBalance} ETH`,
          confirmations: 2,
        });
      }
    } catch (error: any) {
      console.error("Error withdrawing all funds:", error.message);
    }
  };

  return (
    <div className="md:col-span-1">
      <SectionHeading
        icon={<Wallet className="w-3.5 h-3.5 text-gray-400" />}
        title="Financials"
      />

      {/* Available Balance Card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 mb-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-3">
          Available Balance
        </p>

        <div className="flex items-end justify-between">
          {loading.balance ? (
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
          ) : (
            <p className="text-2xl font-mono font-semibold text-gray-100 leading-none">
              {availableBalance}
              <span className="text-sm text-gray-500 ml-1.5 font-sans font-normal">
                ETH
              </span>
            </p>
          )}

          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3 space-y-2">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">
          Withdraw Funds
        </p>

        {/* Amount Input + Withdraw Button */}
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.0001"
            placeholder="0.00 ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={isDisabled}
            className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-blue-500 transition-colors placeholder:text-gray-700 disabled:opacity-50"
          />

          <button
            onClick={handleWithdraw}
            disabled={isDisabled || !withdrawAmount}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/25 px-4 text-xs font-medium text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDisabled ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ArrowUpRight className="w-3 h-3" />
            )}
            Withdraw
          </button>
        </div>

        {/* Withdraw All Button */}
        <button
          onClick={handleWithdrawAll}
          disabled={isDisabled}
          className="w-full rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 text-xs font-medium py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {isDisabled ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ArrowUpRight className="w-3 h-3" />
          )}
          Withdraw All
        </button>
      </div>
    </div>
  );
}