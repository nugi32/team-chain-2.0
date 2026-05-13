"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

import WalletConnectBlock from "@/components/account/WalletConnectBlock";
import ProfileForm from "@/components/account/ProfileForm";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
export const COUNTRIES = [
  { flag: "🇦🇫", name: "Afghanistan", code: "+93", iso: "AF" },
  { flag: "🇦🇱", name: "Albania", code: "+355", iso: "AL" },
  // … truncated for brevity, paste the full COUNTRIES array here …
  { flag: "🇿🇼", name: "Zimbabwe", code: "+263", iso: "ZW" },
];

export default function TeamChainCreateAccountPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [country, setCountry] = useState(
    COUNTRIES.find((c) => c.iso === "ID")!
  );
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Simulate wallet connect */
  const connectWallet = async () => {
    setWalletLoading(true);
    setWalletError(null);
    await new Promise((r) => setTimeout(r, 1800));
    if (Math.random() > 0.2) {
      setWalletAddress("0x4A3B...9F2C");
    } else {
      setWalletError("Connection rejected. Please try again.");
    }
    setWalletLoading(false);
  };

  /* Simulate send OTP */
  const sendCode = async () => {
    if (!phone) return;
    setSendingCode(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSendingCode(false);
    setCodeSent(true);
    setOtp("");
    setOtpVerified(false);
  };

  /* Auto-verify when 6 digits entered */
  useEffect(() => {
    if (otp.length === 6 && !otpVerified) {
      setTimeout(() => setOtpVerified(true), 600);
    }
    if (otp.length < 6) setOtpVerified(false);
  }, [otp]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Team Chain Protocol
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-lg">
              Set up your on-chain identity. Wallet connection is required
              upfront — a small gas fee will be charged to register your profile
              on-chain.
            </p>
          </div>

          {/* Wallet connect block */}
          <WalletConnectBlock
            walletAddress={walletAddress}
            walletLoading={walletLoading}
            walletError={walletError}
            onConnect={connectWallet}
            onDisconnect={() => setWalletAddress(null)}
          />

          {/* Profile form (disabled until wallet connected) */}
          <ProfileForm
            disabled={!walletAddress}
            country={country}
            onCountryChange={setCountry}
            phone={phone}
            onPhoneChange={setPhone}
            codeSent={codeSent}
            sendingCode={sendingCode}
            onSendCode={sendCode}
            otp={otp}
            onOtpChange={setOtp}
            otpVerified={otpVerified}
            avatarPreview={avatarPreview}
            onAvatarUpload={handleAvatar}
            fileRef={fileRef}
          />
        </motion.div>
      </div>
    </div>
  );
}