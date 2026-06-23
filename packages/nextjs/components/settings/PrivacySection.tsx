"use client";

import React, { useState } from "react";
import SaveBar from "./SaveBar";
import SectionHeading from "./SectionHeading";
import Toggle from "./Toggle";
import { Info, Shield } from "lucide-react";

export default function PrivacySection() {
  const [priv, setPriv] = useState({
    publicProfile: true,
    showWallet: false,
    showActivity: true,
    showRepHistory: true,
    indexable: false,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof priv) => {
    setPriv(p => ({ ...p, [key]: !p[key] }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setDirty(false);
  };

  return (
    <div>
      <SectionHeading icon={<Shield className="w-3.5 h-3.5" />} label="Privacy" />

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-1 mb-6">
        <Toggle
          value={priv.publicProfile}
          onChange={() => toggle("publicProfile")}
          label="Public profile"
          desc="Your profile page is visible to all Team Chain users."
        />
        <Toggle
          value={priv.showWallet}
          onChange={() => toggle("showWallet")}
          label="Show wallet address"
          desc="Display your truncated wallet on your public profile."
        />
        <Toggle
          value={priv.showActivity}
          onChange={() => toggle("showActivity")}
          label="Show recent activity"
          desc="Task history visible to teams you apply to."
        />
        <Toggle
          value={priv.showRepHistory}
          onChange={() => toggle("showRepHistory")}
          label="Show reputation history"
          desc="Full REP score timeline visible on your profile."
        />
        <Toggle
          value={priv.indexable}
          onChange={() => toggle("indexable")}
          label="Searchable by name"
          desc="Allow your profile to appear in directory searches."
        />
      </div>

      <div className="rounded-xl border border-gray-800/50 bg-gray-900/20 p-4 flex gap-3 mb-2">
        <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-600 leading-relaxed">
          On-chain data (wallet address, staking history, task completions) is always publicly visible on the blockchain
          regardless of these settings.
        </p>
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}
