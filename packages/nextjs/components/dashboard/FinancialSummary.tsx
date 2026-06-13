import React, { useState } from "react";
import {
  Coins,
  Wallet,
  Lock,
  TrendingUp,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { parseEther } from "viem";

interface Transaction {
  id: number;
  label: string;
  amount: string;
  usd: string;
  time: string;
  out: boolean;
}

interface FinancialSummaryProps {
  availableBalance: number;
  activeStake: number;
  totalEarned: number;
  pendingRewards: number;
  transactions: Transaction[];
}

export default function FinancialSummary({
  availableBalance,
  activeStake,
  totalEarned,
  pendingRewards,
  transactions,
}: FinancialSummaryProps) {
  const { form, actions, loading } = useUsersContract();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(loading.isPending);

  const handleWithdraw = async () => {
    try {
      if (!withdrawAmount) return;

      setIsWithdrawing(true);

      const amountInWei = parseEther(withdrawAmount);
      form.setWithdrawAmount(amountInWei);

      await actions.handleWithdrawUserFund();
      setWithdrawAmount("");
    } catch (error: any) {
      console.error("Error withdrawing funds:", error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleWithdrawAll = async () => {
    try {
      setIsWithdrawing(true);
      await actions.handleWithdrawAllUserFund();
    } catch (error: any) {
      console.error("Error withdrawing all funds:", error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="md:col-span-1">
      <SectionHeading
        icon={<Coins className="w-3.5 h-3.5 text-gray-400" />}
        title="Financial Summary"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          {
            label: "Available",
            val: `${availableBalance} ETH`,
            icon: <Wallet className="w-3 h-3" />,
            color: "text-gray-300",
          },
          {
            label: "Staked",
            val: `${activeStake} ETH`,
            icon: <Lock className="w-3 h-3" />,
            color: "text-amber-400",
          },
          {
            label: "Earned",
            val: `${totalEarned} ETH`,
            icon: <TrendingUp className="w-3 h-3" />,
            color: "text-emerald-400",
          },
          {
            label: "Pending",
            val: `${pendingRewards} ETH`,
            icon: <Gift className="w-3 h-3" />,
            color: "text-indigo-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-3"
          >
            <div
              className={[
                "flex items-center gap-1.5 text-[10px] mb-1.5",
                s.color,
              ].join(" ")}
            >
              {s.icon}
              {s.label}
            </div>

            <p
              className={[
                "text-sm font-mono font-semibold",
                s.color,
              ].join(" ")}
            >
              {s.val}
            </p>
          </div>
        ))}
      </div>

      {/* Withdraw section */}
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
            onChange={(e) => setWithdrawAmount(e.target.value)}
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

      {/* Claim rewards */}
      <button className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 text-xs font-medium py-2.5 mb-3 flex items-center justify-center gap-2 transition-colors">
        <Gift className="w-3.5 h-3.5" />
        Claim {pendingRewards} ETH Rewards
      </button>

      {/* Recent transactions */}
      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
        Recent Transactions
      </p>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 divide-y divide-gray-800/70">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 hover:bg-gray-800/30 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={[
                  "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0",
                  tx.out
                    ? "bg-red-500/10"
                    : "bg-emerald-500/10",
                ].join(" ")}
              >
                {tx.out ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-300 truncate">
                  {tx.label}
                </p>
                <p className="text-[10px] text-gray-600">
                  {tx.time}
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 ml-2">
              <p
                className={[
                  "text-xs font-mono font-semibold",
                  tx.out
                    ? "text-red-400"
                    : "text-emerald-400",
                ].join(" ")}
              >
                {tx.amount}
              </p>

              <p className="text-[10px] text-gray-600">
                {tx.usd}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}