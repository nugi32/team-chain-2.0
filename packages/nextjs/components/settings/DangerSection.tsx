"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ConfirmModal from "./ConfirmModal";

export default function DangerSection() {
  const [modal, setModal] = useState<null | "deactivate" | "delete" | "logout">(null);

  return (
    <div>
      <SectionHeading icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Danger Zone" />

      <div className="flex flex-col gap-3">
        {/* Logout */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/50">
          <div>
            <p className="text-xs font-medium text-gray-300">Sign out</p>
            <p className="text-[11px] text-gray-600 mt-0.5">Disconnect your session from this device.</p>
          </div>
          <button
            onClick={() => setModal("logout")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-800 hover:border-gray-700 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>

        {/* Deactivate *}
        <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div>
            <p className="text-xs font-medium text-amber-300">Deactivate account</p>
            <p className="text-[11px] text-amber-400/60 mt-0.5">Temporarily hides your profile. Tasks in progress are paused.</p>
          </div>
          <button
            onClick={() => setModal("deactivate")}
            className="px-3 py-2 rounded-xl border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            Deactivate
          </button>
        </div>

        {/* Delete */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div>
            <p className="text-xs font-medium text-red-400">Delete account</p>
            <p className="text-[11px] text-red-400/60 mt-0.5">
              Permanently removes your profile. On-chain history remains. Requires no active stakes.
            </p>
          </div>
          <button
            onClick={() => setModal("delete")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      <AnimatePresence>
        {modal === "logout" && (
          <ConfirmModal
            title="Sign out of Team Chain?"
            desc="You'll need to reconnect your wallet to access your account again."
            cta="Sign out"
            ctaClass="bg-gray-700 hover:bg-gray-600"
            onConfirm={() => setModal(null)}
            onClose={() => setModal(null)}
          />
        )}/*
        {modal === "deactivate" && (
          <ConfirmModal
            title="Deactivate your account?"
            desc="Your profile will be hidden and active task applications will be paused. You can reactivate at any time."
            cta="Deactivate"
            ctaClass="bg-amber-600 hover:bg-amber-500"
            onConfirm={() => setModal(null)}
            onClose={() => setModal(null)}
          />
        )}*/
        {modal === "delete" && (
          <ConfirmModal
            title="Permanently delete account?"
            desc="This cannot be undone. Your profile, reputation score, and off-chain data will be erased. On-chain activity remains on the blockchain."
            cta="Delete forever"
            ctaClass="bg-red-600 hover:bg-red-500"
            onConfirm={() => setModal(null)}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}