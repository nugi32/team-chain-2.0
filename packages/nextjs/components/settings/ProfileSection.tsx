"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, X, User, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SectionHeading from "./SectionHeading";
import Field from "./Field";
import Input from "./Input";
import Textarea from "./Textarea";
import SaveBar from "./SaveBar";
import { getUserById } from "@/utils/lib/express/queries/users";
import { type Role, UpdateAccountPayload } from "@/utils/lib/express/mutations/users";
import { useUpdateProfile } from "@/utils/lib/updateProfile";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import {
  skills as SKILL_OPTIONS,
  type SkillCategory,
} from "@/utils/lib/helper/skills";

// ── Role helpers ───────────────────────────────────────────────────────────────
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "project_manager", label: "Project Manager" },
];

const ROLE_REVERSE_MAP: Record<string, Role> = {
  Developer: "developer",
  Designer: "designer",
  "Project Manager": "project_manager",
};

// ── Skill picker categories ────────────────────────────────────────────────────
const CATEGORIES: { value: SkillCategory | "all"; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "language", label: "Languages" },
  { value: "frontend", label: "Frontend" },
  { value: "backend",  label: "Backend" },
  { value: "mobile",   label: "Mobile" },
  { value: "database", label: "Database" },
  { value: "devops",   label: "DevOps" },
  { value: "design",   label: "Tools" },
];

// ── SkillPicker sub-component ─────────────────────────────────────────────────
interface SkillPickerProps {
  selected: string[];
  onChange: (skills: string[]) => void;
}

function SkillPicker({ selected, onChange }: SkillPickerProps) {
  const [query, setQuery]       = useState("");
  const [activeTab, setActiveTab] = useState<SkillCategory | "all">("all");

  const filtered = SKILL_OPTIONS.filter((s) => {
    const matchesCategory = activeTab === "all" || s.category === activeTab;
    const matchesQuery    = s.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggle = (skillName: string) => {
    if (selected.includes(skillName)) {
      onChange(selected.filter((s) => s !== skillName));
    } else {
      onChange([...selected, skillName]);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-800">
        <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills…"
          className="flex-1 bg-transparent text-xs text-gray-200 placeholder:text-gray-600 outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-gray-600 hover:text-gray-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-2 pt-2 pb-1 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === cat.value
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-gray-500 hover:text-gray-300 border border-transparent hover:border-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skill grid */}
      <div className="p-2 max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-gray-600 text-center py-4">No skills match.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((skill) => {
              const isSelected = selected.includes(skill.name);
              return (
                <button
                  key={skill.id}
                  onClick={() => toggle(skill.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    isSelected
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                      : "bg-gray-800/60 border-gray-700/60 text-gray-400 hover:border-indigo-500/30 hover:text-indigo-300"
                  }`}
                >
                  {isSelected && <span className="mr-1 opacity-70">✓</span>}
                  {skill.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected pills summary */}
      {selected.length > 0 && (
        <div className="px-3 py-2.5 border-t border-gray-800 bg-gray-900/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mr-0.5">
              Selected:
            </span>
            {selected.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-[11px] text-indigo-300"
              >
                {s}
                <button
                  onClick={() => toggle(s)}
                  className="text-indigo-400/60 hover:text-red-400 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => onChange([])}
              className="ml-auto text-[10px] text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProfileSection() {
  const { address, isConnected } = useAccount();
  const { handleUpdateProfile } = useUpdateProfile();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();

  const [userId, setUserId] = useState("");

  useEffect(() => {
    const id =
      searchParams.get("id") ||
      localStorage.getItem("userId") ||
      params.id ||
      "";
    setUserId(id);
  }, [searchParams, params.id]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState<Role>("developer");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [descHeader, setDescHeader] = useState("");
  const [descSummary, setDescSummary] = useState("");
  const [descPoints, setDescPoints] = useState<string[]>([]);
  const [descFooter, setDescFooter] = useState("");

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch user on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    (async () => {
      try {
        const user = await getUserById(userId);
        setProfilePicture(user.profilePicture || null);
        setName(user.name || "");
        setEmail(user.email || "");
        setWalletAddress(user.walletAddress || "");
        setRole(ROLE_REVERSE_MAP[user.role] ?? "developer");
        setGithub(user.github || "");
        setLinkedin(user.linkedin || "");
        setDescHeader(user.description?.header || "");
        setDescSummary(user.description?.summary || "");
        setDescPoints(user.description?.points ?? []);
        setDescFooter(user.description?.footer || "");
        setSelectedSkills(user.skills ?? []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const mutate = (fn: () => void) => { fn(); setDirty(true); };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setProfilePicture(URL.createObjectURL(file));
    setDirty(true);
  };

  const addPoint = () =>
    mutate(() => setDescPoints((prev) => [...prev, ""]));

  const updatePoint = (i: number, value: string) =>
    mutate(() => setDescPoints((prev) => prev.map((x, j) => (j === i ? value : x))));

  const removePoint = (i: number) =>
    mutate(() => setDescPoints((prev) => prev.filter((_, j) => j !== i)));

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    setDirty(true);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first.");
      setSaving(false);
      return;
    }
    if (!userId) return;
    setSaving(true);
    try {
      let avatarValue: string | undefined;
      if (avatarFile) {
        avatarValue = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      } else if (profilePicture === null) {
        avatarValue = "";
      }

      const payload: UpdateAccountPayload = {
        name,
        role,
        linkedin,
        github,
        email,
        ...(avatarValue !== undefined && { avatar: avatarValue }),
        description: {
          header: descHeader,
          summary: descSummary,
          points: descPoints,
          footer: descFooter,
        },
        skills: selectedSkills,
      };

      await handleUpdateProfile(userId, walletAddress, payload);
      setAvatarFile(null);
      setDirty(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <p className="text-xs text-gray-500 py-10 text-center">
        No user ID found in URL or local storage.
      </p>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <SectionHeading icon={<User className="w-3.5 h-3.5" />} label="Profile" />

      {/* ── Avatar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-5 mb-8 pb-8 border-b border-gray-800">
        <div className="relative group flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl border-2 border-gray-800 overflow-hidden bg-gray-900 flex items-center justify-center">
            {profilePicture ? (
              <img src={profilePicture} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-indigo-300">{initials || "?"}</span>
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
        <div className="flex-1" />
      </div>

      {/* ── Basic info ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Field label="Name">
          <Input value={name} onChange={(v) => mutate(() => setName(v))} maxLength={80} />
        </Field>
        <Field label="Email">
          <Input value={email} onChange={(v) => mutate(() => setEmail(v))} placeholder="you@example.com" />
        </Field>

        <Field label="Role" hint="Your role in the project or DAO.">
          <select
            value={role}
            onChange={(e) => mutate(() => setRole(e.target.value as Role))}
            className="w-full rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 outline-none transition-colors"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Wallet address" hint="Connected via your wallet — read-only.">
          <input
            value={walletAddress}
            readOnly
            className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2.5 text-xs text-gray-500 font-mono cursor-not-allowed select-all outline-none"
          />
        </Field>
      </div>

      {/* ── Social links ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 pb-8 border-b border-gray-800">
        <Field label="GitHub">
          <Input value={github} onChange={(v) => mutate(() => setGithub(v))} prefix="github.com/" />
        </Field>
        <Field label="LinkedIn">
          <Input value={linkedin} onChange={(v) => mutate(() => setLinkedin(v))} prefix="linkedin.com/in/" />
        </Field>
      </div>

      {/* ── Description ────────────────────────────────────────────────────── */}
      <div className="mb-8 pb-8 border-b border-gray-800 space-y-5">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Description</p>

        <Field label="Header" hint="Short headline shown at the top of your profile.">
          <Input
            value={descHeader}
            onChange={(v) => mutate(() => setDescHeader(v))}
            maxLength={80}
            placeholder="e.g. Full-stack Web3 Developer"
          />
        </Field>

        <Field label="Summary" hint="A paragraph summarising your background and goals.">
          <Textarea
            value={descSummary}
            onChange={(v) => mutate(() => setDescSummary(v))}
            placeholder="Tell teams about yourself…"
            rows={3}
            maxLength={500}
          />
        </Field>

        <Field label="Highlights" hint="Key achievements or focus areas — each shown as a bullet.">
          <div className="space-y-2">
            {descPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={point}
                  onChange={(e) => updatePoint(i, e.target.value)}
                  className="flex-1 rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none transition-colors"
                  placeholder={`Highlight ${i + 1}`}
                />
                <button
                  onClick={() => removePoint(i)}
                  className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addPoint}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gray-700 text-xs text-gray-500 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add highlight
            </button>
          </div>
        </Field>

        <Field label="Footer" hint="Closing line or call-to-action on your profile.">
          <Input
            value={descFooter}
            onChange={(v) => mutate(() => setDescFooter(v))}
            maxLength={120}
            placeholder="e.g. Open to new collaborations."
          />
        </Field>
      </div>

      {/* ── Skills ─────────────────────────────────────────────────────────── */}
      <div className="mb-2">
        <Field
          label="Skills"
          hint={`Used for task matching and shown on your public profile. ${selectedSkills.length > 0 ? `${selectedSkills.length} selected.` : ""}`}
        >
          <SkillPicker selected={selectedSkills} onChange={handleSkillsChange} />
        </Field>
      </div>

      <SaveBar dirty={dirty} onSave={save} saving={saving} />
    </div>
  );
}