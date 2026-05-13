"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import Field from "./Field";
import Input from "./Input";
import Toggle from "./Toggle";
import SaveBar from "./SaveBar";

export default function AccountSection() {
  const [email, setEmail] = useState("john@example.com");
  const [showCurrent, setShowCurrent] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twoFA, setTwoFA] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setDirty(false);
  };

  return (
    <div>
      <SectionHeading icon={<Lock className="w-3.5 h-3.5" />} label="Account & Security" />

      {/* Email */}
      <div className="mb-8 pb-8 border-b border-gray-800">
        <Field label="Email address" hint="Used for notifications and account recovery only.">
          <Input
            value={email}
            onChange={(v) => { setEmail(v); setDirty(true); }}
            type="email"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      {/* Password */}
      <div className="mb-8 pb-8 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-300 mb-4">Change password</p>
        <div className="flex flex-col gap-4">
          <Field label="Current password">
            <div className="flex items-center rounded-xl border border-gray-800 bg-gray-900 focus-within:border-indigo-500/50 transition-colors overflow-hidden">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setDirty(true); }}
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-gray-200 outline-none"
                placeholder="••••••••"
              />
              <button onClick={() => setShowCurrent((p) => !p)} className="pr-3 text-gray-600 hover:text-gray-400 transition-colors">
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="New password">
              <Input value={newPw} onChange={(v) => { setNewPw(v); setDirty(true); }} type="password" placeholder="••••••••" />
            </Field>
            <Field label="Confirm new password">
              <Input value={confirmPw} onChange={(v) => { setConfirmPw(v); setDirty(true); }} type="password" placeholder="••••••••" />
            </Field>
          </div>
          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Passwords do not match
            </p>
          )}
        </div>
      </div>

      {/* 2FA */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-300 mb-4">Two-factor authentication</p>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-1">
          <Toggle
            value={twoFA}
            onChange={(v) => { setTwoFA(v); setDirty(true); }}
            label="Enable 2FA"
            desc="Protect your account with an authenticator app."
          />
        </div>
        {twoFA && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5"
          >
            <p className="text-[11px] text-indigo-300 flex items-center gap-1.5">
              <Check className="w-3 h-3" /> Authenticator app is connected and active.
            </p>
          </motion.div>
        )}
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}