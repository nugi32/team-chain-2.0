"use client";

import React, { MutableRefObject, useEffect, useState } from "react";
import Link from "next/link";
import CountrySelector from "./CountrySelector";
import Field from "./Field";
import OtpInput from "./OtpInput";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Hash, Mail, Smartphone, Upload, User, Wallet } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { FaGithub } from "react-icons/fa";

// ─── Dev flag ────────────────────────────────────────────────────────────────
// Set to `true` to skip phone/OTP verification during development.
const BYPASS_PHONE_VERIFICATION = true;
// ─────────────────────────────────────────────────────────────────────────────

interface Country {
  flag: string;
  name: string;
  code: string;
  iso: string;
}

interface ProfileFormProps {
  disabled: boolean;
  country: Country;
  onCountryChange: (c: Country) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  codeSent: boolean;
  sendingCode: boolean;
  onSendCode: () => void;
  otp: string;
  onOtpChange: (otp: string) => void;
  otpVerified: boolean;
  avatarPreview: string | null;
  onAvatarChange?: (preview: string | null) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileRef: MutableRefObject<HTMLInputElement | null>;
}

export default function ProfileForm({
  disabled,
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  codeSent,
  sendingCode,
  onSendCode,
  otp,
  onOtpChange,
  otpVerified,
  avatarPreview,
  onAvatarChange = () => {},
  onAvatarUpload,
  fileRef,
}: ProfileFormProps) {
  const { data: session } = useSession();

  // ── Local field state ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ── Auto-fill from GitHub OAuth session ───────────────────────────────────
  // Only touches fullName + avatar — never phone (parent owns that state).
  useEffect(() => {
    if (!session?.user) return;

    // Prefill name only if the field is still empty (don't overwrite user edits)
    if (session.user.name) {
      setFullName(prev => (prev ? prev : session.user!.name!));
    }

    // Prefill avatar with GitHub profile picture only if nothing is set yet
    if (session.user.image && !avatarPreview) {
      onAvatarChange(session.user.image);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Derived session values
  const githubUsername =
    (session?.user as { login?: string })?.login ?? session?.user?.name?.toLowerCase().replace(/\s+/g, "") ?? null;
  const email = session?.user?.email ?? null;
  const isGithubLinked = !!session?.user;

  // ── Validation ─────────────────────────────────────────────────────────────
  const phoneReady = BYPASS_PHONE_VERIFICATION || otpVerified;

  const errors: Record<string, string> = {};
  if (touched.fullName && !fullName.trim()) errors.fullName = "Full name is required.";
  if (touched.age) {
    if (!age) errors.age = "Age is required.";
    else if (Number(age) < 13) errors.age = "You must be at least 13.";
    else if (Number(age) > 120) errors.age = "Please enter a valid age.";
  }
  if (touched.github && !isGithubLinked) errors.github = "GitHub account must be linked.";
  if (!BYPASS_PHONE_VERIFICATION && touched.phone && !otpVerified) {
    errors.phone = "Phone number must be verified.";
  }

  const isFormValid = fullName.trim() && age && Number(age) >= 13 && isGithubLinked && phoneReady;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputClass =
    "w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const errorClass = "text-xs text-rose-400 mt-1.5 flex items-center gap-1";

  return (
    <div
      className={[
        "rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl transition-all duration-300",
        disabled ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}
    >
      <div className="p-8 space-y-6">
        {/* ── Avatar + Name row ─────────────────────────────────────────── */}
        <div className="flex items-start gap-5">
          {/* Avatar upload */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">Avatar</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl border border-dashed border-gray-700 bg-gray-950 hover:border-indigo-500 transition-colors overflow-hidden flex items-center justify-center group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-600 group-hover:text-gray-400 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">Upload</span>
                </div>
              )}
              {avatarPreview && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} />
            {avatarPreview && session?.user?.image && (
              <p className="text-[10px] text-gray-600 mt-1 text-center">from GitHub</p>
            )}
          </div>

          {/* Name + Age */}
          <div className="flex-1 space-y-4">
            <Field label="Full Name" required>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, fullName: true }))}
                  className={[
                    inputClass,
                    "pl-11",
                    errors.fullName ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "",
                  ].join(" ")}
                />
              </div>
              {errors.fullName && (
                <p className={errorClass}>
                  <AlertCircle className="w-3 h-3" /> {errors.fullName}
                </p>
              )}
            </Field>

            <Field label="Age" required>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="number"
                  min={13}
                  max={120}
                  placeholder="Your age"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, age: true }))}
                  className={[
                    inputClass,
                    "pl-11",
                    errors.age ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "",
                  ].join(" ")}
                />
              </div>
              {errors.age && (
                <p className={errorClass}>
                  <AlertCircle className="w-3 h-3" /> {errors.age}
                </p>
              )}
            </Field>
          </div>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="border-t border-gray-800" />

        {/* ── GitHub OAuth ──────────────────────────────────────────────── */}
        <Field label="GitHub" hint="OAuth login required — links your GitHub account and fetches profile data">
          <div className="space-y-3">
            {/* Status badge */}
            <AnimatePresence mode="wait">
              {isGithubLinked ? (
                <motion.div
                  key="linked"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-emerald-300 font-medium">@{githubUsername}</p>
                      {email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/createAccount" })}
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                  >
                    Change account
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="unlinked"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={() => signIn("github", { callbackUrl: "/getStarted" }, { prompt: "select_account" })}
                    onBlur={() => setTouched(t => ({ ...t, github: true }))}
                    type="button"
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-sm transition-colors flex items-center gap-2",
                      errors.github
                        ? "border-rose-500 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10"
                        : "border-gray-700 bg-gray-950 hover:border-gray-600 hover:bg-gray-900 text-gray-300",
                    ].join(" ")}
                  >
                    <FaGithub className="w-4 h-4" />
                    Connect GitHub Account
                  </button>
                  {errors.github && (
                    <p className={errorClass}>
                      <AlertCircle className="w-3 h-3" /> {errors.github}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Field>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="border-t border-gray-800" />

        {/* ── Phone ─────────────────────────────────────────────────────── */}
        <Field
          label={
            <span className="flex items-center gap-2">
              Phone Number
              {BYPASS_PHONE_VERIFICATION && (
                <span className="text-[10px] font-mono rounded px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  DEV BYPASS ON
                </span>
              )}
            </span>
          }
          required={!BYPASS_PHONE_VERIFICATION}
        >
          <div className="flex gap-2.5">
            <CountrySelector selected={country} onSelect={onCountryChange} />
            <div className="relative flex-1">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="tel"
                placeholder={BYPASS_PHONE_VERIFICATION ? "Optional in dev mode" : "Phone number"}
                value={phone}
                onChange={e => onPhoneChange(e.target.value.replace(/\D/g, ""))}
                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                className={[
                  inputClass,
                  "pl-11",
                  !BYPASS_PHONE_VERIFICATION && errors.phone
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "",
                  BYPASS_PHONE_VERIFICATION ? "opacity-50" : "",
                ].join(" ")}
                disabled={BYPASS_PHONE_VERIFICATION}
              />
            </div>
            {!BYPASS_PHONE_VERIFICATION && (
              <button
                type="button"
                onClick={onSendCode}
                disabled={!phone || sendingCode}
                className={[
                  "rounded-2xl px-5 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                  !phone
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white",
                ].join(" ")}
              >
                {sendingCode ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                    </svg>
                  </motion.div>
                ) : codeSent ? (
                  "Resend"
                ) : (
                  "Send Code"
                )}
              </button>
            )}
          </div>
          {!BYPASS_PHONE_VERIFICATION && errors.phone && (
            <p className={errorClass}>
              <AlertCircle className="w-3 h-3" /> {errors.phone}
            </p>
          )}
        </Field>

        {/* ── OTP ───────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {!BYPASS_PHONE_VERIFICATION && codeSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Field label="Verification Code">
                <OtpInput value={otp} onChange={onOtpChange} />

                <AnimatePresence>
                  {otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-emerald-400 text-sm mt-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Phone number verified
                    </motion.div>
                  )}
                </AnimatePresence>

                {!otpVerified && otp.length > 0 && otp.length < 6 && (
                  <p className="text-xs text-gray-500 mt-2">Enter all 6 digits to verify</p>
                )}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="px-8 pb-8 pt-2 border-t border-gray-800/50">
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 mb-6 text-xs text-gray-400 leading-relaxed">
          <Wallet className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            Submitting this form will prompt a <span className="text-indigo-300 font-medium">wallet signature</span> to
            register your profile on-chain. A gas fee of approximately{" "}
            <span className="text-white font-medium">$0.01–$0.05</span> will be deducted from your connected wallet.
          </span>
        </div>

        <button
          type="button"
          disabled={disabled || !isFormValid}
          onClick={() => {
            // Mark all fields touched on submit attempt so errors surface
            setTouched({ fullName: true, age: true, github: true, phone: true });
          }}
          className={[
            "w-full h-12 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200",
            !disabled && isFormValid
              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              : "bg-gray-800 text-gray-600 cursor-not-allowed",
          ].join(" ")}
        >
          {!disabled && isFormValid ? (
            <Link href="/dashboard" className="flex items-center gap-2 justify-center w-full h-full">
              Create Account &amp; Sign Transaction
            </Link>
          ) : disabled ? (
            "Connect Wallet to Continue"
          ) : (
            "Complete all required fields"
          )}
        </button>
      </div>
    </div>
  );
}
