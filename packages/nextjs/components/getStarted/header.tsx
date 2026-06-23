"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

/* ─────────────────────────────────────
   GET STARTED HEADER
────────────────────────────────────── */
export const GetStartedHeader = () => {
  return (
    <header className="relative border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Subtle indigo dot-grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Scanning gradient line — sweeps left-to-right along the bottom edge */}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-[40%] pointer-events-none"
        style={{
          background: "linear-gradient(to right, transparent, #6366f1, #a78bfa, transparent)",
        }}
        animate={{ x: ["-100%", "350%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Team Chain</span>
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] text-amber-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Testnet
          </div>
        </Link>

        {/* ── Wallet button + pulsing rings ── */}
        <div className="relative flex-shrink-0">
          {/* Inner ring */}
          <motion.div
            className="absolute -inset-1.5 rounded-2xl border border-indigo-500/20 pointer-events-none"
            animate={{ opacity: [0.8, 0.15, 0.8], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Outer ring */}
          <motion.div
            className="absolute -inset-3 rounded-3xl border border-indigo-500/[0.08] pointer-events-none"
            animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
          />

          <div className="relative flex items-center rounded-xl border border-gray-800 bg-gray-900 px-2 py-1">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
