"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Wallet,
  Upload,
  Mail,
  Smartphone,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  User,
  Hash,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

/* ─────────────────────────────────────────────
   COUNTRY DATA  (flag · name · dial code · iso)
───────────────────────────────────────────────*/
const COUNTRIES = [
  { flag: "🇦🇫", name: "Afghanistan", code: "+93", iso: "AF" },
  { flag: "🇦🇱", name: "Albania", code: "+355", iso: "AL" },
  { flag: "🇩🇿", name: "Algeria", code: "+213", iso: "DZ" },
  { flag: "🇦🇩", name: "Andorra", code: "+376", iso: "AD" },
  { flag: "🇦🇴", name: "Angola", code: "+244", iso: "AO" },
  { flag: "🇦🇷", name: "Argentina", code: "+54", iso: "AR" },
  { flag: "🇦🇲", name: "Armenia", code: "+374", iso: "AM" },
  { flag: "🇦🇺", name: "Australia", code: "+61", iso: "AU" },
  { flag: "🇦🇹", name: "Austria", code: "+43", iso: "AT" },
  { flag: "🇦🇿", name: "Azerbaijan", code: "+994", iso: "AZ" },
  { flag: "🇧🇭", name: "Bahrain", code: "+973", iso: "BH" },
  { flag: "🇧🇩", name: "Bangladesh", code: "+880", iso: "BD" },
  { flag: "🇧🇾", name: "Belarus", code: "+375", iso: "BY" },
  { flag: "🇧🇪", name: "Belgium", code: "+32", iso: "BE" },
  { flag: "🇧🇴", name: "Bolivia", code: "+591", iso: "BO" },
  { flag: "🇧🇦", name: "Bosnia & Herzegovina", code: "+387", iso: "BA" },
  { flag: "🇧🇷", name: "Brazil", code: "+55", iso: "BR" },
  { flag: "🇧🇳", name: "Brunei", code: "+673", iso: "BN" },
  { flag: "🇧🇬", name: "Bulgaria", code: "+359", iso: "BG" },
  { flag: "🇰🇭", name: "Cambodia", code: "+855", iso: "KH" },
  { flag: "🇨🇲", name: "Cameroon", code: "+237", iso: "CM" },
  { flag: "🇨🇦", name: "Canada", code: "+1", iso: "CA" },
  { flag: "🇨🇱", name: "Chile", code: "+56", iso: "CL" },
  { flag: "🇨🇳", name: "China", code: "+86", iso: "CN" },
  { flag: "🇨🇴", name: "Colombia", code: "+57", iso: "CO" },
  { flag: "🇨🇬", name: "Congo", code: "+242", iso: "CG" },
  { flag: "🇭🇷", name: "Croatia", code: "+385", iso: "HR" },
  { flag: "🇨🇾", name: "Cyprus", code: "+357", iso: "CY" },
  { flag: "🇨🇿", name: "Czech Republic", code: "+420", iso: "CZ" },
  { flag: "🇩🇰", name: "Denmark", code: "+45", iso: "DK" },
  { flag: "🇪🇬", name: "Egypt", code: "+20", iso: "EG" },
  { flag: "🇪🇪", name: "Estonia", code: "+372", iso: "EE" },
  { flag: "🇪🇹", name: "Ethiopia", code: "+251", iso: "ET" },
  { flag: "🇫🇮", name: "Finland", code: "+358", iso: "FI" },
  { flag: "🇫🇷", name: "France", code: "+33", iso: "FR" },
  { flag: "🇬🇪", name: "Georgia", code: "+995", iso: "GE" },
  { flag: "🇩🇪", name: "Germany", code: "+49", iso: "DE" },
  { flag: "🇬🇭", name: "Ghana", code: "+233", iso: "GH" },
  { flag: "🇬🇷", name: "Greece", code: "+30", iso: "GR" },
  { flag: "🇬🇹", name: "Guatemala", code: "+502", iso: "GT" },
  { flag: "🇭🇳", name: "Honduras", code: "+504", iso: "HN" },
  { flag: "🇭🇰", name: "Hong Kong", code: "+852", iso: "HK" },
  { flag: "🇭🇺", name: "Hungary", code: "+36", iso: "HU" },
  { flag: "🇮🇸", name: "Iceland", code: "+354", iso: "IS" },
  { flag: "🇮🇳", name: "India", code: "+91", iso: "IN" },
  { flag: "🇮🇩", name: "Indonesia", code: "+62", iso: "ID" },
  { flag: "🇮🇷", name: "Iran", code: "+98", iso: "IR" },
  { flag: "🇮🇶", name: "Iraq", code: "+964", iso: "IQ" },
  { flag: "🇮🇪", name: "Ireland", code: "+353", iso: "IE" },
  { flag: "🇮🇱", name: "Israel", code: "+972", iso: "IL" },
  { flag: "🇮🇹", name: "Italy", code: "+39", iso: "IT" },
  { flag: "🇯🇲", name: "Jamaica", code: "+1-876", iso: "JM" },
  { flag: "🇯🇵", name: "Japan", code: "+81", iso: "JP" },
  { flag: "🇯🇴", name: "Jordan", code: "+962", iso: "JO" },
  { flag: "🇰🇿", name: "Kazakhstan", code: "+7", iso: "KZ" },
  { flag: "🇰🇪", name: "Kenya", code: "+254", iso: "KE" },
  { flag: "🇰🇼", name: "Kuwait", code: "+965", iso: "KW" },
  { flag: "🇰🇬", name: "Kyrgyzstan", code: "+996", iso: "KG" },
  { flag: "🇱🇦", name: "Laos", code: "+856", iso: "LA" },
  { flag: "🇱🇻", name: "Latvia", code: "+371", iso: "LV" },
  { flag: "🇱🇧", name: "Lebanon", code: "+961", iso: "LB" },
  { flag: "🇱🇾", name: "Libya", code: "+218", iso: "LY" },
  { flag: "🇱🇮", name: "Liechtenstein", code: "+423", iso: "LI" },
  { flag: "🇱🇹", name: "Lithuania", code: "+370", iso: "LT" },
  { flag: "🇱🇺", name: "Luxembourg", code: "+352", iso: "LU" },
  { flag: "🇲🇴", name: "Macau", code: "+853", iso: "MO" },
  { flag: "🇲🇾", name: "Malaysia", code: "+60", iso: "MY" },
  { flag: "🇲🇻", name: "Maldives", code: "+960", iso: "MV" },
  { flag: "🇲🇱", name: "Mali", code: "+223", iso: "ML" },
  { flag: "🇲🇹", name: "Malta", code: "+356", iso: "MT" },
  { flag: "🇲🇽", name: "Mexico", code: "+52", iso: "MX" },
  { flag: "🇲🇩", name: "Moldova", code: "+373", iso: "MD" },
  { flag: "🇲🇳", name: "Mongolia", code: "+976", iso: "MN" },
  { flag: "🇲🇦", name: "Morocco", code: "+212", iso: "MA" },
  { flag: "🇲🇿", name: "Mozambique", code: "+258", iso: "MZ" },
  { flag: "🇲🇲", name: "Myanmar", code: "+95", iso: "MM" },
  { flag: "🇳🇵", name: "Nepal", code: "+977", iso: "NP" },
  { flag: "🇳🇱", name: "Netherlands", code: "+31", iso: "NL" },
  { flag: "🇳🇿", name: "New Zealand", code: "+64", iso: "NZ" },
  { flag: "🇳🇬", name: "Nigeria", code: "+234", iso: "NG" },
  { flag: "🇰🇵", name: "North Korea", code: "+850", iso: "KP" },
  { flag: "🇲🇰", name: "North Macedonia", code: "+389", iso: "MK" },
  { flag: "🇳🇴", name: "Norway", code: "+47", iso: "NO" },
  { flag: "🇴🇲", name: "Oman", code: "+968", iso: "OM" },
  { flag: "🇵🇰", name: "Pakistan", code: "+92", iso: "PK" },
  { flag: "🇵🇦", name: "Panama", code: "+507", iso: "PA" },
  { flag: "🇵🇬", name: "Papua New Guinea", code: "+675", iso: "PG" },
  { flag: "🇵🇾", name: "Paraguay", code: "+595", iso: "PY" },
  { flag: "🇵🇪", name: "Peru", code: "+51", iso: "PE" },
  { flag: "🇵🇭", name: "Philippines", code: "+63", iso: "PH" },
  { flag: "🇵🇱", name: "Poland", code: "+48", iso: "PL" },
  { flag: "🇵🇹", name: "Portugal", code: "+351", iso: "PT" },
  { flag: "🇶🇦", name: "Qatar", code: "+974", iso: "QA" },
  { flag: "🇷🇴", name: "Romania", code: "+40", iso: "RO" },
  { flag: "🇷🇺", name: "Russia", code: "+7", iso: "RU" },
  { flag: "🇷🇼", name: "Rwanda", code: "+250", iso: "RW" },
  { flag: "🇸🇦", name: "Saudi Arabia", code: "+966", iso: "SA" },
  { flag: "🇸🇳", name: "Senegal", code: "+221", iso: "SN" },
  { flag: "🇷🇸", name: "Serbia", code: "+381", iso: "RS" },
  { flag: "🇸🇬", name: "Singapore", code: "+65", iso: "SG" },
  { flag: "🇸🇰", name: "Slovakia", code: "+421", iso: "SK" },
  { flag: "🇸🇮", name: "Slovenia", code: "+386", iso: "SI" },
  { flag: "🇸🇴", name: "Somalia", code: "+252", iso: "SO" },
  { flag: "🇿🇦", name: "South Africa", code: "+27", iso: "ZA" },
  { flag: "🇰🇷", name: "South Korea", code: "+82", iso: "KR" },
  { flag: "🇸🇸", name: "South Sudan", code: "+211", iso: "SS" },
  { flag: "🇪🇸", name: "Spain", code: "+34", iso: "ES" },
  { flag: "🇱🇰", name: "Sri Lanka", code: "+94", iso: "LK" },
  { flag: "🇸🇩", name: "Sudan", code: "+249", iso: "SD" },
  { flag: "🇸🇪", name: "Sweden", code: "+46", iso: "SE" },
  { flag: "🇨🇭", name: "Switzerland", code: "+41", iso: "CH" },
  { flag: "🇸🇾", name: "Syria", code: "+963", iso: "SY" },
  { flag: "🇹🇼", name: "Taiwan", code: "+886", iso: "TW" },
  { flag: "🇹🇯", name: "Tajikistan", code: "+992", iso: "TJ" },
  { flag: "🇹🇿", name: "Tanzania", code: "+255", iso: "TZ" },
  { flag: "🇹🇭", name: "Thailand", code: "+66", iso: "TH" },
  { flag: "🇹🇱", name: "Timor-Leste", code: "+670", iso: "TL" },
  { flag: "🇹🇳", name: "Tunisia", code: "+216", iso: "TN" },
  { flag: "🇹🇷", name: "Turkey", code: "+90", iso: "TR" },
  { flag: "🇹🇲", name: "Turkmenistan", code: "+993", iso: "TM" },
  { flag: "🇺🇬", name: "Uganda", code: "+256", iso: "UG" },
  { flag: "🇺🇦", name: "Ukraine", code: "+380", iso: "UA" },
  { flag: "🇦🇪", name: "UAE", code: "+971", iso: "AE" },
  { flag: "🇬🇧", name: "United Kingdom", code: "+44", iso: "GB" },
  { flag: "🇺🇸", name: "United States", code: "+1", iso: "US" },
  { flag: "🇺🇾", name: "Uruguay", code: "+598", iso: "UY" },
  { flag: "🇺🇿", name: "Uzbekistan", code: "+998", iso: "UZ" },
  { flag: "🇻🇪", name: "Venezuela", code: "+58", iso: "VE" },
  { flag: "🇻🇳", name: "Vietnam", code: "+84", iso: "VN" },
  { flag: "🇾🇪", name: "Yemen", code: "+967", iso: "YE" },
  { flag: "🇿🇲", name: "Zambia", code: "+260", iso: "ZM" },
  { flag: "🇿🇼", name: "Zimbabwe", code: "+263", iso: "ZW" },
];

/* ─────────────────────────────────────────────
   OTP INPUT  (6 individual controlled inputs)
───────────────────────────────────────────────*/
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => refs.current[i]?.focus();

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      focus(index + 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    // Support paste: distribute across slots
    const digits = raw.slice(0, 6 - index);
    const next =
      value.slice(0, index) + digits + value.slice(index + digits.length);
    onChange(next.slice(0, 6));
    const nextFocus = Math.min(index + digits.length, 5);
    setTimeout(() => focus(nextFocus), 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(digits.padEnd(value.length > digits.length ? value.length : 0));
    onChange(digits);
    setTimeout(() => focus(Math.min(digits.length, 5)), 0);
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-full rounded-xl border text-center text-lg font-mono font-semibold",
            "bg-gray-950 outline-none transition-all duration-150",
            "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            value[i]
              ? "border-indigo-500 text-white"
              : "border-gray-700 text-gray-300",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COUNTRY SELECTOR  (searchable dropdown)
───────────────────────────────────────────────*/
function CountrySelector({
  selected,
  onSelect,
}: {
  selected: (typeof COUNTRIES)[0];
  onSelect: (c: (typeof COUNTRIES)[0]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.includes(query)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white hover:border-gray-600 transition-colors whitespace-nowrap"
      >
        <span>{selected.flag}</span>
        <span className="font-mono text-gray-300">{selected.code}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 w-72 rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country or code…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-500 text-white placeholder-gray-600"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No results for "{query}"
                </p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={[
                      "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left",
                      "hover:bg-gray-800 transition-colors",
                      selected.iso === c.iso ? "bg-indigo-500/10" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{c.flag}</span>
                      <span className="text-gray-200">{c.name}</span>
                    </div>
                    <span className="font-mono text-gray-500 text-xs">
                      {c.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FIELD WRAPPER
───────────────────────────────────────────────*/
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-indigo-400">*</span>}
        {hint && (
          <span className="ml-auto text-xs font-normal text-gray-500">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────*/
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
    // Simulate success 80% of the time for demo
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

  const inputClass =
    "w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      {/* Background subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Back */}
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

          {/* ── STEP 1: Wallet Connect ── */}
          <section className="mb-3">
            <div
              className={[
                "rounded-3xl border p-6 transition-all duration-300",
                walletAddress
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-indigo-500/40 bg-indigo-500/5",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                    walletAddress ? "bg-emerald-500/20" : "bg-indigo-500/20",
                  ].join(" ")}
                >
                  {walletAddress ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Wallet className="w-5 h-5 text-indigo-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm">
                        {walletAddress
                          ? "Wallet Connected"
                          : "Connect Wallet — Required"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {walletAddress ? (
                          <span className="font-mono text-emerald-400">
                            {walletAddress}
                          </span>
                        ) : (
                          "Your wallet signs the profile creation transaction. A small gas fee (~$0.01–$0.05) is deducted from your connected wallet."
                        )}
                      </p>
                    </div>

                    {!walletAddress && (
                      <button
                        type="button"
                        onClick={connectWallet}
                        disabled={walletLoading}
                        className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {walletLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting…
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4" />
                            Connect Wallet
                          </>
                        )}
                      </button>
                    )}

                    {walletAddress && (
                      <button
                        type="button"
                        onClick={() => setWalletAddress(null)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>

                  {walletError && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {walletError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── FORM CARD ── */}
          <div
            className={[
              "rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl transition-all duration-300",
              !walletAddress ? "opacity-50 pointer-events-none" : "",
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
                    onChange={handleAvatar}
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
                  <CountrySelector selected={country} onSelect={setCountry} />
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className={inputClass + " pl-11"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={!phone || sendingCode}
                    className={[
                      "rounded-2xl px-5 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                      !phone
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white",
                    ].join(" ")}
                  >
                    {sendingCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
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
                      <OtpInput value={otp} onChange={setOtp} />

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
                disabled={!walletAddress}
                className={[
                  "w-full h-12 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200",
                  walletAddress
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed",
                ].join(" ")}
              >
                {walletAddress ? "Create Account & Sign Transaction" : "Connect Wallet to Continue"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}