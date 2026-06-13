"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Toggle from "./Toggle";
import SaveBar from "./SaveBar";

export default function NotificationsSection() {
  const [settings, setSettings] = useState({
    deadlines: true,
    reviews: true,
    disputes: true,
    invites: true,
    payouts: true,
    marketing: false,
    emailDigest: true,
    pushBrowser: false,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof settings) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setDirty(false);
  };

  return (
    <div>
      <SectionHeading icon={<Bell className="w-3.5 h-3.5" />} label="Notifications" />

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-1 mb-6">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest pt-3 pb-2">Task activity</p>
        <Toggle value={settings.deadlines} onChange={() => toggle("deadlines")} label="Deadline reminders" desc="24h and 4h before a task deadline." />
        <Toggle value={settings.reviews} onChange={() => toggle("reviews")} label="Review requests" desc="When your submission needs approval." />
        <Toggle value={settings.disputes} onChange={() => toggle("disputes")} label="Dispute updates" desc="Status changes on tasks you're involved in." />
        <Toggle value={settings.invites} onChange={() => toggle("invites")} label="Team invitations" desc="When a team invites you to join a project." />
        <Toggle value={settings.payouts} onChange={() => toggle("payouts")} label="Payout confirmations" desc="On-chain reward transfers confirmed." />
        <p className="text-[10px] text-gray-600 uppercase tracking-widest pt-4 pb-2">Channels</p>
        <Toggle value={settings.emailDigest} onChange={() => toggle("emailDigest")} label="Email digest" desc="Weekly summary of your activity." />
        <Toggle value={settings.pushBrowser} onChange={() => toggle("pushBrowser")} label="Browser push" desc="Real-time alerts in supported browsers." />
        <p className="text-[10px] text-gray-600 uppercase tracking-widest pt-4 pb-2">Marketing</p>
        <Toggle value={settings.marketing} onChange={() => toggle("marketing")} label="Product updates & announcements" desc="News about new features and protocol changes." />
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}