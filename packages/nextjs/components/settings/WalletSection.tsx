"use client";

import React, { useState } from "react";
import { Wallet, Copy, Check, ExternalLink, Zap, X } from "lucide-react";
import SectionHeading from "./SectionHeading";

export default function WalletSection() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "0x4a2F...d91C";
  const fullAddress = "0x4a2Fc8e3d1b7A0c9E5f2D3b4a1e6c7d8f9e0d91C";

  const copy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div>
      <SectionHeading icon={<Wallet className="w-3.5 h-3.5" />} label="Wallet" />

      {/* Connected wallet */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-gray-300">Connected</span>
          </div>
          <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">Mainnet</span>
        </div>
        <p className="text-xs text-gray-400 mb-1">Wallet address</p>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-indigo-300 flex-1 break-all">{walletAddress}</code>
          <button
            onClick={copy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={`https://etherscan.io/address/${fullAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Etherscan
          </a>
        </div>
      </div>

      {/* On-chain profile notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6 flex gap-3">
        <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-amber-300 mb-1">On-chain profile update</p>
          <p className="text-[11px] text-amber-400/70 leading-relaxed">
            Saving your profile commits data to the blockchain. A small gas fee (est. ~0.0003 ETH) will be charged. Your wallet will prompt for confirmation.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Reputation", value: "847" },
          { label: "Tasks completed", value: "23" },
          { label: "Stake locked", value: "1.4 ETH" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-3 text-center">
            <p className="text-base font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-[10px] text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Disconnect */}
      <button className="w-full py-2.5 rounded-xl border border-gray-800 hover:border-red-500/30 hover:bg-red-500/5 text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5">
        <X className="w-3 h-3" /> Disconnect wallet
      </button>
    </div>
  );
}