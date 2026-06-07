"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Wallet, Bell, Shield,
  AlertTriangle, ChevronRight,
} from "lucide-react";

import ProfileSection from "@/components/settings/ProfileSection";
import DangerSection from "@/components/settings/DangerSection";

/*
import AccountSection from "@/components/settings/AccountSection";
import WalletSection from "@/components/settings/WalletSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import PrivacySection from "@/components/settings/PrivacySection";
 */

type Section = "profile" |
  //"account" | "wallet" | "notifications" | "privacy" | 
  "danger";

const NAV: { id: Section; icon: React.ReactNode; label: string; danger?: boolean }[] = [
  { id: "profile", icon: <User className="w-3.5 h-3.5" />, label: "Profile" },
  /*
  { id: "account",       icon: <Lock className="w-3.5 h-3.5" />,    label: "Account & Security" },
  { id: "wallet",        icon: <Wallet className="w-3.5 h-3.5" />,  label: "Wallet" },
  { id: "notifications", icon: <Bell className="w-3.5 h-3.5" />,    label: "Notifications" },
  { id: "privacy",       icon: <Shield className="w-3.5 h-3.5" />,  label: "Privacy" },
   */
  { id: "danger", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Danger Zone", danger: true },
];

const SECTION_MAP: Record<Section, React.ReactNode> = {
  profile: <ProfileSection />,
  /*
  account:       <AccountSection />,
  wallet:        <WalletSection />,
  notifications: <NotificationsSection />,
  privacy:       <PrivacySection />,
  */
  danger: <DangerSection />,
};

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your profile, security, and on-chain identity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="md:w-48 flex-shrink-0">
            <nav className="flex flex-row md:flex-col gap-0.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {NAV.map(({ id, icon, label, danger }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={[
                    "relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                    active === id
                      ? danger
                        ? "bg-red-500/10 text-red-400"
                        : "bg-gray-800 text-white"
                      : danger
                        ? "text-gray-600 hover:text-red-400 hover:bg-red-500/5"
                        : "text-gray-500 hover:text-gray-200 hover:bg-gray-900",
                  ].join(" ")}
                >
                  {active === id && (
                    <motion.div
                      layoutId="settings-nav-pill"
                      className={["absolute inset-0 rounded-xl", danger ? "bg-red-500/10" : "bg-gray-800"].join(" ")}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    {icon}
                    {label}
                  </span>
                  {active === id && (
                    <ChevronRight className="relative z-10 w-3 h-3 ml-auto hidden md:block text-gray-600" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content panel */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6"
              >
                {SECTION_MAP[active]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}