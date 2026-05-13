import React from "react";
import {
  Users, Clock, MessageSquare, AlertTriangle, UserCheck,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Invitation {
  id: number;
  project: string;
  role: string;
  stake: string;
  by: string;
}

interface Deadline {
  id: string;
  project: string;
  risk: string;
  deadline: string;
}

interface RightSidebarProps {
  walletAddress: string;
  chain: string;
  availableBalance: number;
  activeStake: number;
  invitations: Invitation[];
  deadlines: Deadline[];
}

export default function RightSidebar({
  walletAddress,
  chain,
  availableBalance,
  activeStake,
  invitations,
  deadlines,
}: RightSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Wallet card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-300">{chain} Mainnet</span>
        </div>
        <div className="font-mono text-sm text-indigo-300 mb-3">{walletAddress}</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
            <p className="text-gray-500 mb-1">Available</p>
            <p className="font-mono font-semibold">{availableBalance} ETH</p>
          </div>
          <div className="rounded-xl bg-gray-950 border border-gray-800 p-2.5">
            <p className="text-gray-500 mb-1">Staked</p>
            <p className="font-mono font-semibold">{activeStake} ETH</p>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <SectionHeading
          icon={<Users className="w-3.5 h-3.5 text-gray-400" />}
          title="Invitations"
        />
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-gray-800 bg-gray-950 p-3 space-y-2"
            >
              <div>
                <p className="text-xs font-semibold text-white">{inv.project}</p>
                <p className="text-[10px] text-gray-500">
                  {inv.role} · from {inv.by}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 rounded-lg px-2 py-0.5">
                  Stake {inv.stake}
                </span>
                <div className="flex gap-1.5">
                  <button className="text-[10px] text-gray-500 hover:text-white border border-gray-700 rounded-lg px-2 py-1 transition-colors">
                    Decline
                  </button>
                  <button className="text-[10px] text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg px-2 py-1 transition-colors">
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <SectionHeading
          icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
          title="Upcoming Deadlines"
        />
        <div className="space-y-2">
          {deadlines.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={[
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    d.risk === "overdue"
                      ? "bg-red-400"
                      : d.risk === "at-risk"
                      ? "bg-amber-400"
                      : "bg-emerald-400",
                  ].join(" ")}
                />
                <span className="text-xs text-gray-300 truncate">{d.project}</span>
              </div>
              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                {d.deadline}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Reviews */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <SectionHeading
          icon={<MessageSquare className="w-3.5 h-3.5 text-gray-400" />}
          title="Pending Approvals"
        />
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>Cross-Chain Oracle awaiting 2 peer approvals to finalize.</p>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-gray-950 border border-gray-800 p-3">
            <UserCheck className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p>NFT Marketplace V2 review assigned to you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}