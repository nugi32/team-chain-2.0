import React from "react";
import FinancialSummary from "./FinancialSummary";
import { useDashboardRightSidebarData } from "@/utils/lib/dashboard";

export default function RightSidebar({ id }: { id: string }) {
  const { networkName, walletAddress } = useDashboardRightSidebarData(id);

  return (
    <div className="space-y-4">
      {/* Network + Wallet Card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-300">{networkName}</span>
        </div>

        <div className="font-mono text-sm text-indigo-300 truncate">{walletAddress}</div>
      </div>

      {/* Financials — balance + withdraw/deposit tabs */}
      <FinancialSummary />
    </div>
  );
}
