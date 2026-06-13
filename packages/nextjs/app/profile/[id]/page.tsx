"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  CheckCheck,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import { getUserById } from "@/utils/lib/express/queries/users";

// ─── Types ────────────────────────────────────────────────────────────────────

type ValidRole = "Developer" | "Designer" | "Project Manager";

interface UserProfile {
  _id: string;
  walletAddress: string;
  name: string;
  email: string;
  github: string;
  linkedin: string;
  role: ValidRole;
  profilePicture: string;
  description: {
    header: string;
    summary: string;
    points: string[];
    footer: string;
  };
  skills: string[];
}

// ─── Role config ──────────────────────────────────────────────────────────────

const VALID_ROLES: ValidRole[] = ["Developer", "Designer", "Project Manager"];

const roleStyle: Record<ValidRole, { bg: string; text: string; dot: string }> = {
  Developer:         { bg: "bg-indigo-500/15", text: "text-indigo-300", dot: "bg-indigo-400" },
  Designer:          { bg: "bg-violet-500/15", text: "text-violet-300", dot: "bg-violet-400" },
  "Project Manager": { bg: "bg-cyan-500/15",   text: "text-cyan-300",   dot: "bg-cyan-400"   },
};

function toValidRole(raw: string): ValidRole {
  return VALID_ROLES.includes(raw as ValidRole)
    ? (raw as ValidRole)
    : "Developer";
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.45,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    delay,
  },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, delay },
});

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-800/60 ${className ?? ""}`}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Skeleton className="h-4 w-32" />
      {/* Hero */}
      <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 p-6 sm:p-8 flex gap-6">
        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-7 w-24 rounded-xl" />
            <Skeleton className="h-7 w-48 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 p-6 space-y-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 p-6 space-y-4">
            <Skeleton className="h-3 w-12" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 p-6 space-y-3">
            <Skeleton className="h-3 w-16" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-2xl" />)}
          </div>
          <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 p-6 space-y-3">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#070b12] flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-rose-500/20 bg-rose-500/10">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>
        <p className="text-gray-300 font-medium">{message}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WalletBadge({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <button
      onClick={copy}
      className="group inline-flex items-center gap-2 rounded-xl border border-gray-700/60 bg-gray-900 px-3 py-1.5 text-xs font-mono text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-all duration-200"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/50 animate-pulse" />
      <span className="hidden sm:block">{address}</span>
      <span className="sm:hidden">{short}</span>
      <span className="ml-0.5 text-gray-600 group-hover:text-indigo-400 transition-colors">
        {copied
          ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
          : <Copy className="w-3.5 h-3.5" />
        }
      </span>
    </button>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/60 px-4 py-3 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
    >
      <Icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">{label}</p>
        <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">{value}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    // localStorage is only available client-side, so read it inside useEffect
    const id = localStorage.getItem("userId");

    if (!id) {
      setError("No user ID found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getUserById(id);
        // Normalize role from string → ValidRole union before storing in state
        setProfile({
          ...(data as unknown as UserProfile),
          role: toValidRole(data.role),
          // Fallback: API may return skills nested differently
          skills: (data as unknown as UserProfile).skills ?? [],
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (error || !profile) {
    return <ErrorState message={error ?? "Profile not found."} />;
  }

  // ── profile is fully typed and non-null beyond this point ───────────────
  const rs = roleStyle[profile.role];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .font-syne    { font-family: 'Syne', sans-serif; }
        .font-dm-mono { font-family: 'DM Mono', monospace; }
      `}</style>

      <div className="min-h-screen bg-[#070b12] text-white relative overflow-hidden">

        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.10),transparent)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* ── Back nav ───────────────────────────────────────────────── */}
          <motion.div {...fadeIn(0)}>
            <Link
              href={`/dashboard/${profile._id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
          </motion.div>

          {/* ── Hero card ──────────────────────────────────────────────── */}
          <motion.div
            {...fadeUp(0.05)}
            className="relative rounded-3xl border border-gray-800/80 bg-gray-900/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <motion.div {...fadeIn(0.15)} className="flex-shrink-0 relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10">
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1e1b4b&color=818cf8&size=112`;
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-gray-900 shadow shadow-emerald-400/40" />
              </motion.div>

              {/* Identity */}
              <div className="flex-1 min-w-0 space-y-3">
                <motion.div {...fadeUp(0.12)} className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] text-indigo-400 font-medium mb-2">
                    <span className="w-1 h-1 rounded-full bg-indigo-400" />
                    On-chain identity
                  </div>

                  <h1 className="font-syne text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                    {profile.name}
                  </h1>

                  <p className="font-syne text-sm sm:text-base text-gray-400 leading-relaxed">
                    {profile.description.header}
                  </p>
                </motion.div>

                <motion.div {...fadeUp(0.18)} className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-transparent ${rs.bg} px-3 py-1 text-xs font-semibold ${rs.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                    {profile.role}
                  </span>

                  <WalletBadge address={profile.walletAddress} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── Body grid ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Description + Skills (2/3) */}
            <motion.div {...fadeUp(0.2)} className="lg:col-span-2 space-y-5">

              {/* Description */}
              <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 backdrop-blur-sm p-6 space-y-5">
                <h2 className="font-syne text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
                  About
                </h2>

                {profile.description.summary && (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {profile.description.summary}
                  </p>
                )}

                {profile.description.points.length > 0 && (
                  <ul className="space-y-2.5">
                    {profile.description.points.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.06, duration: 0.35, ease: "easeOut" }}
                        className="flex items-start gap-3 text-sm text-gray-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {profile.description.footer && (
                  <>
                    <div className="border-t border-gray-800" />
                    <p className="text-xs text-gray-500 italic leading-relaxed">
                      {profile.description.footer}
                    </p>
                  </>
                )}
              </div>

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 backdrop-blur-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-syne text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
                      Skills
                    </h2>
                    <span className="text-[10px] rounded-full border border-gray-800 bg-gray-950 px-2 py-0.5 text-gray-500">
                      {profile.skills.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.035, duration: 0.25, ease: "easeOut" }}
                        className="rounded-xl border border-gray-800 bg-gray-950/80 px-3 py-1.5 text-xs text-gray-300 hover:border-indigo-500/40 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all duration-150 cursor-default select-none"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right — Contact + Wallet (1/3) */}
            <motion.div {...fadeUp(0.28)} className="space-y-5">

              {/* Contact */}
              <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 backdrop-blur-sm p-6 space-y-4">
                <h2 className="font-syne text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
                  Contact
                </h2>

                <div className="space-y-2.5">
                  <SocialLink
                    href={`mailto:${profile.email}`}
                    icon={Mail}
                    label="Email"
                    value={profile.email}
                  />
                  <SocialLink
                    href={profile.github}
                    icon={FaGithub}
                    label="GitHub"
                    value={profile.github.replace("https://github.com/", "@")}
                  />
                  <SocialLink
                    href={profile.linkedin}
                    icon={FaLinkedin}
                    label="LinkedIn"
                    value={profile.linkedin
                      .replace("https://linkedin.com/in/", "")
                      .replace("https://www.linkedin.com/in/", "")
                      .replace(/\/$/, "")}
                  />
                </div>
              </div>

              {/* Wallet */}
              <div className="rounded-3xl border border-gray-800/80 bg-gray-900/50 backdrop-blur-sm p-6 space-y-3">
                <h2 className="font-syne text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
                  Wallet
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow shadow-emerald-400/50 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">
                      Verified on-chain
                    </span>
                  </div>
                  <p
                    className="font-dm-mono text-[11px] text-gray-500 break-all leading-relaxed border border-gray-800 rounded-xl bg-gray-950/60 px-3 py-2 hover:text-indigo-400 transition-colors duration-150"
                  >
                    <a href={`https://etherscan.io/address/${profile.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer">
                      {profile.walletAddress}
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}