import React, { useState } from "react";
import SectionHeading from "./SectionHeading";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { formatEther, parseEther } from "viem";

type Tab = "withdraw" | "deposit";

export default function FinancialSummary() {
  const { user, form, actions, loading } = useUsersContract();
  const addRecentTransaction = useAddRecentTransaction();

  const [activeTab, setActiveTab] = useState<Tab>("withdraw");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

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

  const handleDeposit = async () => {
    try {
      if (!depositAmount) return;
      const amountInWei = parseEther(depositAmount);
      form.setDepositAmount(amountInWei);

      const tx = await actions.handleDeposit();

      if (tx) {
        addRecentTransaction({
          hash: tx,
          description: `Deposit ${depositAmount} ETH`,
          confirmations: 2,
        });
      }

      setDepositAmount("");
    } catch (error: any) {
      console.error("Error depositing funds:", error.message);
    }
  };

  return (
    <div className="w-full">
      <SectionHeading icon={<Wallet className="w-3.5 h-3.5 text-gray-400" />} title="Financials" />

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3">
        <div className="flex gap-1 mb-3 rounded-xl bg-gray-950 border border-gray-800 p-1">
          <button
            onClick={() => setActiveTab("withdraw")}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
              activeTab === "withdraw" ? "bg-gray-800 text-gray-100" : "text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            <ArrowUpRight className="w-3 h-3" />
            Withdraw
          </button>

          <button
            onClick={() => setActiveTab("deposit")}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
              activeTab === "deposit" ? "bg-gray-800 text-gray-100" : "text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            <ArrowDownLeft className="w-3 h-3" />
            Deposit
          </button>
        </div>

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="0.00 ETH"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                disabled={isDisabled}
                className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-blue-500 transition-colors placeholder:text-gray-700 disabled:opacity-50"
              />

              <button
                onClick={handleWithdraw}
                disabled={isDisabled || !withdrawAmount}
                className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/25 px-4 text-xs font-medium text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDisabled ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
                Withdraw
              </button>
            </div>

            <button
              onClick={handleWithdrawAll}
              disabled={isDisabled}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 text-xs font-medium py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isDisabled ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
              Withdraw All
            </button>
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === "deposit" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="0.00 ETH"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                disabled={isDisabled}
                className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-200 outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-700 disabled:opacity-50"
              />

              <button
                onClick={handleDeposit}
                disabled={isDisabled || !depositAmount}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/25 px-4 text-xs font-medium text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDisabled ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDownLeft className="w-3 h-3" />}
                Deposit
              </button>
            </div>

            <p className="text-[10px] text-gray-600 px-1">Deposits go directly into your protocol account balance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
