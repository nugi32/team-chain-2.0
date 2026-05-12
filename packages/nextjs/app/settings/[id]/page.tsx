"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, MapPin, Globe, Lock, Bell,
  Shield, Wallet, LogOut, Camera, Check, AlertTriangle, Eye,
  EyeOff, ChevronRight, Trash2, Copy, ExternalLink, Zap,
  ToggleLeft, ToggleRight, Info, X, Upload,
} from "lucide-react";

/* ─────────────────────────────────────
   TYPES
────────────────────────────────────── */
type Section =
  | "profile"
  | "account"
  | "wallet"
  | "notifications"
  | "privacy"
  | "danger";

/* ─────────────────────────────────────
   HELPERS
────────────────────────────────────── */
function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-white tracking-tight">{label}</h2>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-600">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  prefix,
  maxLength,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <div className="flex items-center rounded-xl border border-gray-800 bg-gray-900 focus-within:border-indigo-500/50 transition-colors overflow-hidden">
      {prefix && (
        <span className="pl-3 text-xs text-gray-600 select-none flex-shrink-0">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="flex-1 bg-transparent px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none"
      />
      {maxLength && (
        <span className="pr-3 text-[10px] text-gray-700 flex-shrink-0">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div className="relative rounded-xl border border-gray-800 bg-gray-900 focus-within:border-indigo-500/50 transition-colors">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full bg-transparent px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none resize-none"
      />
      {maxLength && (
        <span className="absolute bottom-2 right-3 text-[10px] text-gray-700">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

function Toggle({
  value,
  onChange,
  label,
  desc,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-start justify-between gap-4 w-full text-left py-3 border-b border-gray-800/60 last:border-0"
    >
      <div>
        <p className="text-xs font-medium text-gray-300">{label}</p>
        {desc && <p className="text-[11px] text-gray-600 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0 mt-0.5">
        {value ? (
          <ToggleRight className="w-5 h-5 text-indigo-400" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-600" />
        )}
      </div>
    </button>
  );
}

function SaveBar({ dirty, onSave, saving }: { dirty: boolean; onSave: () => void; saving: boolean }) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-800"
        >
          <p className="text-[11px] text-gray-500">You have unsaved changes</p>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors text-xs font-semibold text-white"
          >
            {saving ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────
   NAV ITEM
────────────────────────────────────── */
const NAV: { id: Section; icon: React.ReactNode; label: string; danger?: boolean }[] = [
  { id: "profile",       icon: <User className="w-3.5 h-3.5" />,    label: "Profile" },
  { id: "account",       icon: <Lock className="w-3.5 h-3.5" />,    label: "Account & Security" },
  { id: "wallet",        icon: <Wallet className="w-3.5 h-3.5" />,  label: "Wallet" },
  { id: "notifications", icon: <Bell className="w-3.5 h-3.5" />,    label: "Notifications" },
  { id: "privacy",       icon: <Shield className="w-3.5 h-3.5" />,  label: "Privacy" },
  { id: "danger",        icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Danger Zone", danger: true },
];

/* ─────────────────────────────────────
   CONFIRM MODAL
────────────────────────────────────── */
function ConfirmModal({
  title,
  desc,
  cta,
  ctaClass,
  onConfirm,
  onClose,
}: {
  title: string;
  desc: string;
  cta: string;
  ctaClass: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-400">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">{desc}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-800 text-xs text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={["flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors", ctaClass].join(" ")}
          >
            {cta}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   PROFILE SECTION
────────────────────────────────────── */
function ProfileSection() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("jdoe_eth");
  const [displayName, setDisplayName] = useState("John Doe");
  const [bio, setBio] = useState("Smart contract developer & DAO contributor. Building on-chain collaboration tools.");
  const [location, setLocation] = useState("San Francisco, CA");
  const [website, setWebsite] = useState("https://johndoe.dev");
  const [github, setGithub] = useState("jdoe");
  const [twitter, setTwitter] = useState("jdoe_eth");
  const [skills, setSkills] = useState(["Solidity", "React", "Ethers.js", "Hardhat"]);
  const [skillInput, setSkillInput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutate = (fn: () => void) => { fn(); setDirty(true); };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
    setDirty(true);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    mutate(() => setSkills((p) => [...p, s]));
    setSkillInput("");
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setDirty(false);
  };

  return (
    <div>
      <SectionHeading icon={<User className="w-3.5 h-3.5" />} label="Profile" />

      {/* Avatar */}
      <div className="flex items-start gap-5 mb-8 pb-8 border-b border-gray-800">
        <div className="relative group flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl border-2 border-gray-800 overflow-hidden bg-gray-900 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-indigo-300">JD</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-300 mb-1">Profile picture</p>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            Recommended: 400×400px. JPG, PNG, or GIF. Max 2MB.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-700 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Upload className="w-3 h-3" /> Upload
            </button>
            {avatar && (
              <button
                onClick={() => { setAvatar(null); setDirty(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900 hover:border-red-500/40 text-xs text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Field label="Username" hint="Unique identifier on-chain. Changing costs a small gas fee.">
          <Input value={username} onChange={(v) => mutate(() => setUsername(v))} prefix="@" maxLength={30} />
        </Field>
        <Field label="Display name">
          <Input value={displayName} onChange={(v) => mutate(() => setDisplayName(v))} maxLength={50} />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Bio" hint="Visible on your public profile and task applications.">
          <Textarea
            value={bio}
            onChange={(v) => mutate(() => setBio(v))}
            placeholder="Tell teams about yourself…"
            rows={3}
            maxLength={280}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 pb-8 border-b border-gray-800">
        <Field label="Location">
          <Input value={location} onChange={(v) => mutate(() => setLocation(v))} placeholder="City, Country" />
        </Field>
        <Field label="Website">
          <Input value={website} onChange={(v) => mutate(() => setWebsite(v))} placeholder="https://…" />
        </Field>
        <Field label="Github">
          <Input value={github} onChange={(v) => mutate(() => setGithub(v))} prefix="github.com/" />
        </Field>
        <Field label="Twitter / X">
          <Input value={twitter} onChange={(v) => mutate(() => setTwitter(v))} prefix="@" />
        </Field>
      </div>

      {/* Skills */}
      <div className="mb-2">
        <Field label="Skills" hint="Added to your on-chain profile and used for task matching.">
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill…"
              className="flex-1 rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none transition-colors"
            />
            <button
              onClick={addSkill}
              className="px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900 hover:border-indigo-500/40 text-xs text-gray-400 hover:text-indigo-400 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-[11px] text-gray-300"
              >
                {s}
                <button
                  onClick={() => mutate(() => setSkills((p) => p.filter((x) => x !== s)))}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </Field>
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}

/* ─────────────────────────────────────
   ACCOUNT SECTION
────────────────────────────────────── */
function AccountSection() {
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

/* ─────────────────────────────────────
   WALLET SECTION
────────────────────────────────────── */
function WalletSection() {
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

/* ─────────────────────────────────────
   NOTIFICATIONS SECTION
────────────────────────────────────── */
function NotificationsSection() {
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

/* ─────────────────────────────────────
   PRIVACY SECTION
────────────────────────────────────── */
function PrivacySection() {
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
    setPriv((p) => ({ ...p, [key]: !p[key] }));
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
      <SectionHeading icon={<Shield className="w-3.5 h-3.5" />} label="Privacy" />

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-1 mb-6">
        <Toggle value={priv.publicProfile} onChange={() => toggle("publicProfile")} label="Public profile" desc="Your profile page is visible to all Team Chain users." />
        <Toggle value={priv.showWallet} onChange={() => toggle("showWallet")} label="Show wallet address" desc="Display your truncated wallet on your public profile." />
        <Toggle value={priv.showActivity} onChange={() => toggle("showActivity")} label="Show recent activity" desc="Task history visible to teams you apply to." />
        <Toggle value={priv.showRepHistory} onChange={() => toggle("showRepHistory")} label="Show reputation history" desc="Full REP score timeline visible on your profile." />
        <Toggle value={priv.indexable} onChange={() => toggle("indexable")} label="Searchable by name" desc="Allow your profile to appear in directory searches." />
      </div>

      <div className="rounded-xl border border-gray-800/50 bg-gray-900/20 p-4 flex gap-3 mb-2">
        <Info className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-600 leading-relaxed">
          On-chain data (wallet address, staking history, task completions) is always publicly visible on the blockchain regardless of these settings.
        </p>
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}

/* ─────────────────────────────────────
   DANGER SECTION
────────────────────────────────────── */
function DangerSection() {
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

        {/* Deactivate */}
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
        )}
        {modal === "deactivate" && (
          <ConfirmModal
            title="Deactivate your account?"
            desc="Your profile will be hidden and active task applications will be paused. You can reactivate at any time."
            cta="Deactivate"
            ctaClass="bg-amber-600 hover:bg-amber-500"
            onConfirm={() => setModal(null)}
            onClose={() => setModal(null)}
          />
        )}
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

/* ─────────────────────────────────────
   PAGE
────────────────────────────────────── */
const SECTION_MAP: Record<Section, React.ReactNode> = {
  profile:       <ProfileSection />,
  account:       <AccountSection />,
  wallet:        <WalletSection />,
  notifications: <NotificationsSection />,
  privacy:       <PrivacySection />,
  danger:        <DangerSection />,
};

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your profile, security, and on-chain identity.</p>
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