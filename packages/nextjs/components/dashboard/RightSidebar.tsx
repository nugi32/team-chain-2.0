import React from "react";
import { useDashboardRightSidebarData } from "@/utils/lib/dashboard";
import { formatEther } from "viem";

export default function RightSidebar({id}: {id: string}) {
  const { networkName, walletAddress, user } = useDashboardRightSidebarData(id);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-300">
            {networkName}
          </span>
        </div>

        <div className="font-mono text-sm text-indigo-300 mb-3 truncate">
          {walletAddress}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
            <p className="text-gray-500 mb-1">Available</p>
            <p className="font-mono font-semibold">
              {formatEther(user?.balance ?? 0n)} ETH
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}