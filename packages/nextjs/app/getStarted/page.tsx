"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Mail,
  CheckCircle2,
  User,
  Wallet,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  FileText,
  AlignLeft,
  Type,
  Link2,
  ArrowLeft,
  Code2,
  Layers,
  Cpu,
  Smartphone,
  Database,
  Cloud,
  Paintbrush,
  X,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import Field from "@/components/getStarted/Field";
import { GetStartedHeader } from "@/components/getStarted/header";
import { useCreateAccount } from "@/utils/lib/getStarted";

import type { Role } from "@/utils/lib/express/mutations/users";

import { useAccount } from "wagmi";
import { initCachedToken } from "@/utils/globalLib/walletAuth";
import { notification } from "~~/utils/scaffold-eth";

import { skills, type SkillCategory } from "@/utils/lib/helper/skills";


// ─── Category meta ────────────────────────────────────────────────────────────

const categoryMeta: Record<
  SkillCategory,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  language: { label: "Languages", Icon: Code2 },
  frontend: { label: "Frontend", Icon: Layers },
  backend: { label: "Backend", Icon: Cpu },
  mobile: { label: "Mobile", Icon: Smartphone },
  database: { label: "Database", Icon: Database },
  devops: { label: "DevOps", Icon: Cloud },
  design: { label: "Tools", Icon: Paintbrush },
};

const categoryOrder: SkillCategory[] = [
  "language", "frontend", "backend", "mobile", "database", "devops", "design",
];

// ─── Constants ────────────────────────────────────────────────────────────────

const roleOptions = [
  { label: "Developer", value: "developer" as Role },
  { label: "Designer", value: "designer" as Role },
  { label: "Project Manager", value: "project_manager" as Role },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidUri = (v: string) => {
  try { new URL(v); return true; } catch { return false; }
};

// ─── Skills Selector ─────────────────────────────────────────────────────────

interface SkillsSelectorProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

function SkillsSelector({ selected, onChange, error }: SkillsSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("language");

  const toggle = (id: string) =>
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );

  const visibleSkills = skills.filter((s) => s.category === activeCategory);

  const countFor = (cat: SkillCategory) =>
    skills.filter((s) => s.category === cat && selected.includes(s.id)).length;

  // Selected pill display (all selected)
  const selectedSkillObjects = skills.filter((s) => selected.includes(s.id));

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categoryOrder.map((cat) => {
          const { label, Icon } = categoryMeta[cat];
          const count = countFor(cat);
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={[
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10"
                  : "border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700 hover:text-gray-300",
              ].join(" ")}
            >
              <Icon className="w-3 h-3" />
              {label}
              {count > 0 && (
                <span
                  className={[
                    "rounded-full px-1.5 py-0 text-[10px] font-semibold",
                    isActive
                      ? "bg-indigo-500/30 text-indigo-200"
                      : "bg-gray-800 text-gray-400",
                  ].join(" ")}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Skill chips grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex flex-wrap gap-2"
        >
          {visibleSkills.map((skill) => {
            const isSelected = selected.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggle(skill.id)}
                className={[
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150 select-none",
                  isSelected
                    ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-200 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/20"
                    : "border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700 hover:text-gray-200 hover:bg-gray-900",
                ].join(" ")}
              >
                {isSelected && (
                  <span className="mr-1 text-indigo-400">✓</span>
                )}
                {skill.name}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Selected pills summary */}
      {selectedSkillObjects.length > 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 font-medium">
            Selected — {selectedSkillObjects.length} skill{selectedSkillObjects.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {selectedSkillObjects.map((s) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] text-indigo-300"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className="ml-0.5 rounded-full text-indigo-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Clean LinkedIn URL  ──────────────────────────────────────────────────────
const cleanLinkedInUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { createAccount } = useCreateAccount();

  useEffect(() => { initCachedToken(); }, []);

  const disabled = false;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ── Field state ───────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [roleValue, setRoleValue] = useState<Role | "">("");
  const [roleOpen, setRoleOpen] = useState(false);

  // Description sub-fields
  const [descHeader, setDescHeader] = useState("");
  const [descSummary, setDescSummary] = useState("");
  const [descPoints, setDescPoints] = useState<string[]>([""]);
  const [descFooter, setDescFooter] = useState("");

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Auto-fill from GitHub session ─────────────────────────────────────────
  useEffect(() => {
    if (!session?.user) return;
    if (session.user.name) setName((prev) => (prev ? prev : session.user!.name!));
    if (session.user.image && !avatarPreview) setAvatarPreview(session.user.image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, avatarPreview]);

  useEffect(() => {
    localStorage.clear();
  }, []);

  // ── Derived session values ────────────────────────────────────────────────
  const githubUsername = session?.user?.username;

  const githubUri = githubUsername
    ? `https://github.com/${githubUsername}`
    : null;

  const email = session?.user?.email ?? null;

  const isGithubLinked = !!githubUsername;

  // ── Validation ────────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};

  if (touched.name && name.trim().length < 3) errors.name = "Name must be at least 3 characters.";
  if (touched.github && !isGithubLinked) errors.github = "GitHub account must be linked.";
  if (touched.linkedin) {
    if (!linkedin) errors.linkedin = "LinkedIn URL is required.";
    else if (!isValidUri(linkedin)) errors.linkedin = "Must be a valid URL (e.g. https://linkedin.com/in/…).";
  }
  if (touched.role && !roleValue) errors.role = "Please select a role.";
  if (touched.descHeader && descHeader.trim().length < 3) errors.descHeader = "Header must be at least 3 characters.";
  if (touched.descSummary && descSummary.length > 200) errors.descSummary = "Summary must be 200 characters or fewer.";
  if (touched.descFooter && descFooter.length > 100) errors.descFooter = "Footer must be 100 characters or fewer.";

  const invalidPoints = descPoints.filter((p) => p.trim().length > 0 && p.trim().length < 3);
  if (touched.descPoints && invalidPoints.length > 0)
    errors.descPoints = "Each point must be at least 3 characters.";
  if (touched.descPoints && descPoints.filter((p) => p.trim()).length === 0)
    errors.descPoints = "At least one point is required.";

  if (touched.skills && selectedSkills.length === 0)
    errors.skills = "Please select at least one skill.";

  const profilePictureUri = avatarPreview ?? null;

  const isFormValid =
    name.trim().length >= 3 &&
    isGithubLinked &&
    githubUri &&
    isValidUri(linkedin) &&
    roleValue &&
    profilePictureUri &&
    descHeader.trim().length >= 3 &&
    descSummary.length <= 200 &&
    descFooter.length <= 100 &&
    descPoints.filter((p) => p.trim().length >= 3).length >= 1 &&
    selectedSkills.length >= 1;

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputBase = "w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
  const inputError = "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20";
  const errMsg = "text-xs text-rose-400 mt-1.5 flex items-center gap-1";

  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  // ── Points helpers ────────────────────────────────────────────────────────
  const addPoint = () => setDescPoints((p) => [...p, ""]);
  const removePoint = (i: number) => setDescPoints((p) => p.filter((_, idx) => idx !== i));
  const updatePoint = (i: number, v: string) =>
    setDescPoints((p) => p.map((x, idx) => (idx === i ? v : x)));

  // ── Countdown + redirect helper ──────────────────────────────────────────
  const startCountdownRedirect = (targetPath: string, onCancel: () => void) => {
    let countdown = 5;
    let cancelled = false;
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const toastId = notification.info(
      <div className="flex flex-col gap-3 min-w-[250px]">
        <div className="text-sm leading-6">
          Account created successfully!<br />
          Redirecting to dashboard in{" "}
          <span id="redirect-countdown" className="font-bold text-indigo-400">{countdown}</span>s…
        </div>
        <button
          className="rounded-xl border border-red-500 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/20 transition"
          onClick={() => {
            cancelled = true;
            clearInterval(interval);
            clearTimeout(timeout);
            notification.remove(toastId);
            notification.warning("Redirect cancelled");
            onCancel();
          }}
        >
          Cancel Redirect
        </button>
      </div>,
      { duration: 6000 }
    );

    interval = setInterval(() => {
      countdown--;
      const el = document.getElementById("redirect-countdown");
      if (el) el.innerText = countdown.toString();
    }, 1000);

    timeout = setTimeout(() => {
      clearInterval(interval);
      if (!cancelled) { notification.remove(toastId); router.push(targetPath); }
    }, 5000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  };

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setTouched({
      name: true, github: true, linkedin: true, role: true,
      descHeader: true, descSummary: true, descPoints: true, descFooter: true,
      skills: true,
    });

    if (!isFormValid) {
      notification.error("Please fill in all required fields correctly.");
      return;
    }
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        name: name.trim(),
        role: roleValue,
        linkedin: cleanLinkedInUrl(linkedin.trim()),
        github: githubUri,
        email: email || undefined,
        avatar: profilePictureUri,
        description: {
          header: descHeader.trim(),
          summary: descSummary.trim(),
          points: descPoints.filter((p) => p.trim().length >= 3),
          footer: descFooter.trim(),
        },
        skills: selectedSkills,
      };

      console.log("[handleSubmit] Calling createAccount with:", formData);
      const accountId = await createAccount(formData, address);

      if (!accountId) throw new Error("No ID returned from account creation");

      localStorage.setItem("userId", accountId);

      startCountdownRedirect(`/dashboard/${accountId}`, () => setIsSubmitting(false));
    } catch (error) {
      console.error("[handleSubmit] Account creation failed:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to create account. Please try again.";

      notification.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
    <div className="mb-10">
      <GetStartedHeader />
      </div>
      <div
        className={[
          "rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl transition-all duration-300",
          "max-w-3xl mx-auto w-full",
          disabled ? "opacity-50 pointer-events-none" : "",
        ].join(" ")}
      >
        <div className="p-8 space-y-6">
          {/* Back button & header */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Team Chain Protocol
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-lg">
              Set up your on-chain identity. Wallet connection is required upfront — a small gas fee
              will be charged to register your profile on-chain.
            </p>
          </motion.div>

          {/* ── Avatar + Name ──────────────────────────────────────────────── */}
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">
                Avatar <span className="text-rose-400">*</span>
              </label>
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
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {avatarPreview && session?.user?.image === avatarPreview && (
                <p className="text-[10px] text-gray-600 mt-1 text-center">from GitHub</p>
              )}
            </div>

            {/* Name */}
            <div className="flex-1">
              <Field label="Full Name" required>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => touch("name")}
                    className={[inputBase, "pl-11", errors.name ? inputError : ""].join(" ")}
                  />
                </div>
                {errors.name && (
                  <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.name}</p>
                )}
              </Field>
            </div>
          </div>

          <div className="border-t border-gray-800" />

          {/* ── Role ───────────────────────────────────────────────────────── */}
          <Field label="Role" required>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen((o) => !o)}
                onBlur={() => { touch("role"); setTimeout(() => setRoleOpen(false), 150); }}
                className={[
                  "w-full rounded-2xl border px-4 py-3 text-sm text-left flex items-center justify-between transition-colors",
                  errors.role
                    ? "border-rose-500 bg-gray-950 text-rose-300"
                    : roleValue
                      ? "border-gray-800 bg-gray-950 text-white focus:border-indigo-500"
                      : "border-gray-800 bg-gray-950 text-gray-600",
                ].join(" ")}
              >
                {roleOptions.find((opt) => opt.value === roleValue)?.label || "Select a role…"}
                <ChevronDown className={["w-4 h-4 text-gray-500 transition-transform", roleOpen ? "rotate-180" : ""].join(" ")} />
              </button>

              <AnimatePresence>
                {roleOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-1.5 w-full rounded-2xl border border-gray-700 bg-gray-900 shadow-xl overflow-hidden"
                  >
                    {roleOptions.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          onMouseDown={() => { setRoleValue(opt.value); setRoleOpen(false); touch("role"); }}
                          className={[
                            "w-full px-4 py-3 text-sm text-left hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors",
                            roleValue === opt.value ? "text-indigo-300 bg-indigo-500/10" : "text-gray-300",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            {errors.role && (
              <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.role}</p>
            )}
          </Field>

          <div className="border-t border-gray-800" />

          {/* ── GitHub OAuth ───────────────────────────────────────────────── */}
          <Field label="GitHub" hint="OAuth login — links your account and populates your profile URI">
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
                      {githubUri && <p className="text-xs text-gray-500 font-mono mt-0.5">{githubUri}</p>}
                      {email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />{email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/getStarted" })}
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                  >
                    Change
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
                    onBlur={() => touch("github")}
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
                    <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.github}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Field>

          <div className="border-t border-gray-800" />

          {/* ── LinkedIn ───────────────────────────────────────────────────── */}
          <Field label="LinkedIn" required hint="Public profile URL (https://linkedin.com/in/…)">
            <div className="relative">
              <FaLinkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourhandle"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                onBlur={() => touch("linkedin")}
                className={[inputBase, "pl-11", errors.linkedin ? inputError : ""].join(" ")}
              />
            </div>
            {errors.linkedin && (
              <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.linkedin}</p>
            )}
          </Field>

          <div className="border-t border-gray-800" />

          {/* ── Description ────────────────────────────────────────────────── */}
          <div>
            <p className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Profile Description
            </p>

            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 space-y-4">
              {/* Header */}
              <Field label="Header" required hint="Short headline — max 100 chars">
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Full-Stack Developer & Open-Source Contributor"
                    value={descHeader}
                    onChange={(e) => setDescHeader(e.target.value)}
                    onBlur={() => touch("descHeader")}
                    className={[inputBase, "pl-11", errors.descHeader ? inputError : ""].join(" ")}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                    {descHeader.length}/100
                  </span>
                </div>
                {errors.descHeader && (
                  <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.descHeader}</p>
                )}
              </Field>

              {/* Summary */}
              <Field label="Summary" hint="Brief bio — max 200 chars">
                <div className="relative">
                  <textarea
                    maxLength={200}
                    rows={3}
                    placeholder="A short summary about yourself and what you bring to the team…"
                    value={descSummary}
                    onChange={(e) => setDescSummary(e.target.value)}
                    onBlur={() => touch("descSummary")}
                    className={[inputBase, "resize-none", errors.descSummary ? inputError : ""].join(" ")}
                  />
                  <span className="absolute right-4 bottom-3 text-xs text-gray-600">
                    {descSummary.length}/200
                  </span>
                </div>
                {errors.descSummary && (
                  <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.descSummary}</p>
                )}
              </Field>

              {/* Points */}
              <Field label="Key Points" required hint="Bullet highlights — at least 1, each 3–100 chars">
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {descPoints.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex gap-2"
                      >
                        <div className="relative flex-1">
                          <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                          <input
                            type="text"
                            maxLength={100}
                            placeholder={`Point ${i + 1}`}
                            value={point}
                            onChange={(e) => updatePoint(i, e.target.value)}
                            onBlur={() => touch("descPoints")}
                            className={[inputBase, "pl-10", errors.descPoints ? inputError : ""].join(" ")}
                          />
                        </div>
                        {descPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePoint(i)}
                            className="flex-shrink-0 w-11 h-11 rounded-2xl border border-gray-800 bg-gray-950 hover:border-rose-500/50 hover:text-rose-400 text-gray-600 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={addPoint}
                    className="w-full rounded-2xl border border-dashed border-gray-700 bg-transparent hover:border-indigo-500/50 hover:text-indigo-400 text-gray-600 transition-colors text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Point
                  </button>
                </div>
                {errors.descPoints && (
                  <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.descPoints}</p>
                )}
              </Field>

              {/* Footer */}
              <Field label="Footer" hint="Closing note — max 100 chars">
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Open to remote roles worldwide"
                    value={descFooter}
                    onChange={(e) => setDescFooter(e.target.value)}
                    onBlur={() => touch("descFooter")}
                    className={[inputBase, "pl-11", errors.descFooter ? inputError : ""].join(" ")}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                    {descFooter.length}/100
                  </span>
                </div>
                {errors.descFooter && (
                  <p className={errMsg}><AlertCircle className="w-3 h-3" />{errors.descFooter}</p>
                )}
              </Field>
            </div>
          </div>

          <div className="border-t border-gray-800" />

          {/* ── Skills ─────────────────────────────────────────────────────── */}
          <div>
            <p className="text-sm font-medium text-gray-200 mb-1 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Skills
              <span className="text-rose-400">*</span>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Select technologies and tools you work with — at least one required.
            </p>

            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
              <SkillsSelector
                selected={selectedSkills}
                onChange={(ids) => { setSelectedSkills(ids); touch("skills"); }}
                error={errors.skills}
              />
            </div>
          </div>
        </div>

        {/* ── Footer / Submit ─────────────────────────────────────────────── */}
        <div className="px-8 pb-8 pt-2 border-t border-gray-800/50">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 mb-6 text-xs text-gray-400 leading-relaxed">
            <Wallet className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Submitting this form will prompt a{" "}
              <span className="text-indigo-300 font-medium">wallet signature</span> to register your
              profile on-chain. A gas fee of approximately{" "}
              <span className="text-white font-medium">$0.01–$0.05</span> will be deducted from your
              connected wallet.
            </span>
          </div>

          <button
            type="button"
            disabled={disabled || !isFormValid || isSubmitting}
            onClick={handleSubmit}
            className={[
              "w-full h-12 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200",
              !disabled && isFormValid && !isSubmitting
                ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                : "bg-gray-800 text-gray-600 cursor-not-allowed",
            ].join(" ")}
          >
            {isSubmitting
              ? "Creating Account..."
              : !disabled && isFormValid
                ? "Create Account & Sign Transaction"
                : disabled
                  ? "Connect Wallet to Continue"
                  : "Complete all required fields"}
          </button>
        </div>
      </div>
    </>
  );
}