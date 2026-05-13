"use client";

import React, { MutableRefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Mail,
  Smartphone,
  CheckCircle2,
  User,
  Hash,
  Wallet,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

import Field from "./Field";
import CountrySelector from "./CountrySelector";
import OtpInput from "./OtpInput";
import type { COUNTRIES } from "@/components/account/Countries";

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
  onAvatarUpload,
  fileRef,
}: ProfileFormProps) {
  const inputClass =
    "w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div
      className={[
        "rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl transition-all duration-300",
        disabled ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}
    >
      <div className="p-8 space-y-6">
        {/* Avatar + Name row */}
        <div className="flex items-start gap-5">
          {/* Avatar upload */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5">
              Avatar
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl border border-dashed border-gray-700 bg-gray-950 hover:border-indigo-500 transition-colors overflow-hidden flex items-center justify-center group"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
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
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarUpload}
            />
          </div>

          {/* Name + Age */}
          <div className="flex-1 space-y-4">
            <Field label="Full Name" required>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className={inputClass + " pl-11"}
                />
              </div>
            </Field>
            <Field label="Age" required>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="number"
                  min={13}
                  max={120}
                  placeholder="Your age"
                  className={inputClass + " pl-11"}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Email */}
        <Field label="Email" required hint="Manual or OAuth">
          <div className="grid sm:grid-cols-[1fr_auto] gap-2.5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass + " pl-11"}
              />
            </div>
            <button
              type="button"
              className="rounded-2xl border border-gray-700 bg-gray-950 hover:border-gray-600 hover:bg-gray-900 px-4 py-3 text-sm text-gray-300 transition-colors whitespace-nowrap"
            >
              Continue with Email
            </button>
          </div>
        </Field>

        {/* GitHub */}
        <Field label="GitHub" hint="Optional">
          <div className="grid sm:grid-cols-[1fr_auto] gap-2.5">
            <input
              type="text"
              placeholder="github.com/username"
              className={inputClass}
            />
            <button
              type="button"
              className="rounded-2xl border border-gray-700 bg-gray-950 hover:border-gray-600 hover:bg-gray-900 px-4 py-3 text-sm text-gray-300 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FaGithub className="w-4 h-4" />
              GitHub OAuth
            </button>
          </div>
        </Field>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Phone */}
        <Field label="Phone Number" required>
          <div className="flex gap-2.5">
            <CountrySelector selected={country} onSelect={onCountryChange} />
            <div className="relative flex-1">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) =>
                  onPhoneChange(e.target.value.replace(/\D/g, ""))
                }
                className={inputClass + " pl-11"}
              />
            </div>
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
          </div>
        </Field>

        {/* OTP */}
        <AnimatePresence>
          {codeSent && (
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
                  <p className="text-xs text-gray-500 mt-2">
                    Enter all 6 digits to verify
                  </p>
                )}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8 pt-2 border-t border-gray-800/50">
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 mb-6 text-xs text-gray-400 leading-relaxed">
          <Wallet className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            Submitting this form will prompt a{" "}
            <span className="text-indigo-300 font-medium">
              wallet signature
            </span>{" "}
            to register your profile on-chain. A gas fee of approximately{" "}
            <span className="text-white font-medium">$0.01–$0.05</span>{" "}
            will be deducted from your connected wallet.
          </span>
        </div>

        <button
          type="button"
          disabled={disabled}
          className={[
            "w-full h-12 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200",
            !disabled
              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              : "bg-gray-800 text-gray-600 cursor-not-allowed",
          ].join(" ")}
        >
          <Link href="/dashboard" className="flex items-center gap-2 justify-center">
            {!disabled
              ? "Create Account & Sign Transaction"
              : "Connect Wallet to Continue"}
          </Link>
        </button>
      </div>
    </div>
  );
}