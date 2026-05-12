"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Coins, Users, Eye, ChevronRight, ChevronLeft,
  Plus, X, AlertTriangle, Check, Zap, Clock, Star,
  Shield, Flame, Tag, Calendar, Hash, Info,
  ArrowUpRight, Layers, Target, Rocket,
} from "lucide-react";

/* ─────────────────────────────────────
   TYPES
────────────────────────────────────── */
interface Milestone {
  id: string;
  title: string;
  reward: string;
  deadline: string;
  description: string;
}

interface FormData {
  // Step 1 – Basics
  title: string;
  teamName: string;
  objective: string;
  category: string;
  taskType: string;
  // Step 2 – Commitment
  stakeRequired: string;
  reward: string;
  effort: string;
  deadline: string;
  slots: string;
  // Step 3 – Requirements
  minReputation: string;
  roles: string[];
  skills: string[];
  description: string;
  milestones: Milestone[];
  // Step 4 flags
  badges: string[];
}

const EMPTY: FormData = {
  title: "",
  teamName: "",
  objective: "",
  category: "",
  taskType: "bounty",
  stakeRequired: "",
  reward: "",
  effort: "",
  deadline: "",
  slots: "1",
  minReputation: "",
  roles: [],
  skills: [],
  description: "",
  milestones: [],
  badges: [],
};

/* ─────────────────────────────────────
   CONSTANTS
────────────────────────────────────── */
const CATEGORIES = [
  "Smart Contracts", "Frontend", "Backend", "Security Audit",
  "Design / UX", "Documentation", "Research", "DevOps", "Community",
];

const TASK_TYPES = [
  { id: "bounty",    label: "Bounty",     desc: "Fixed reward on delivery" },
  { id: "milestone", label: "Milestone",  desc: "Paid per milestone" },
  { id: "retainer",  label: "Retainer",   desc: "Ongoing recurring work" },
];

const EFFORT_OPTIONS = ["< 4 hrs", "4–8 hrs", "1–3 days", "1 week", "2+ weeks"];

const BADGE_OPTIONS = [
  { id: "Low Risk",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "Verified Team", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "High Stake",    color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { id: "Fast Review",   color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "New Team",      color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  { id: "Urgent",        color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const STEPS = [
  { id: 1, label: "Basics",      icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 2, label: "Commitment",  icon: <Coins className="w-3.5 h-3.5" /> },
  { id: 3, label: "Requirements",icon: <Users className="w-3.5 h-3.5" /> },
  { id: 4, label: "Review",      icon: <Eye className="w-3.5 h-3.5" /> },
];

/* ─────────────────────────────────────
   UI ATOMS
────────────────────────────────────── */
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-xs font-medium text-gray-400">{children}</span>
      {hint && (
        <span className="group relative">
          <Info className="w-3 h-3 text-gray-700 cursor-help" />
          <span className="absolute left-5 top-0 z-20 w-44 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-[10px] text-gray-300 leading-snug opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {hint}
          </span>
        </span>
      )}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, prefix, maxLength, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  prefix?: string; maxLength?: number; type?: string;
}) {
  return (
    <div className="flex items-center rounded-xl border border-gray-800 bg-gray-900 focus-within:border-indigo-500/50 transition-colors overflow-hidden">
      {prefix && <span className="pl-3 text-xs text-gray-600 flex-shrink-0">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="flex-1 bg-transparent px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none"
      />
      {maxLength && (
        <span className="pr-3 text-[10px] text-gray-700">{value.length}/{maxLength}</span>
      )}
    </div>
  );
}

function Select({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 outline-none transition-colors appearance-none cursor-pointer"
    >
      {placeholder && <option value="" className="text-gray-600">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o} className="bg-gray-900">{o}</option>
      ))}
    </select>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-gray-600 mt-1">{children}</p>;
}

function TagInput({
  tags, onAdd, onRemove, placeholder,
}: {
  tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const s = val.trim();
    if (!s || tags.includes(s)) return;
    onAdd(s);
    setVal("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-xl border border-gray-800 hover:border-indigo-500/40 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-[11px] text-gray-300">
              {t}
              <button type="button" onClick={() => onRemove(t)} className="text-gray-600 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   STEP 1 – BASICS
────────────────────────────────────── */
function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label>Task title *</Label>
        <TextInput
          value={data.title}
          onChange={(v) => set("title", v)}
          placeholder="e.g. Frontend Milestone for DAO Portal"
          maxLength={80}
        />
        <Hint>Be specific — workers scan titles to decide in under 3 seconds.</Hint>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Team / project name *</Label>
          <TextInput value={data.teamName} onChange={(v) => set("teamName", v)} placeholder="e.g. DaoForge Labs" />
        </div>
        <div>
          <Label>Category *</Label>
          <Select value={data.category} onChange={(v) => set("category", v)} options={CATEGORIES} placeholder="Select category…" />
        </div>
      </div>

      <div>
        <Label hint="Shown as the subtitle on task cards.">One-line objective *</Label>
        <TextInput
          value={data.objective}
          onChange={(v) => set("objective", v)}
          placeholder="e.g. Build wallet connection and transaction UI."
          maxLength={120}
        />
      </div>

      <div>
        <Label>Task type</Label>
        <div className="grid grid-cols-3 gap-2">
          {TASK_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set("taskType", t.id)}
              className={[
                "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                data.taskType === t.id
                  ? "border-indigo-500/50 bg-indigo-500/10"
                  : "border-gray-800 bg-gray-900 hover:border-gray-700",
              ].join(" ")}
            >
              <span className={["text-xs font-semibold mb-0.5", data.taskType === t.id ? "text-indigo-300" : "text-gray-300"].join(" ")}>
                {t.label}
              </span>
              <span className="text-[10px] text-gray-600 leading-snug">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Risk & trust badges</Label>
        <div className="flex flex-wrap gap-1.5">
          {BADGE_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() =>
                set(
                  "badges",
                  data.badges.includes(b.id)
                    ? data.badges.filter((x) => x !== b.id)
                    : [...data.badges, b.id]
                )
              }
              className={[
                "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all",
                data.badges.includes(b.id)
                  ? b.color + " ring-1 ring-current/30"
                  : "border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400",
              ].join(" ")}
            >
              {data.badges.includes(b.id) && <Check className="w-2.5 h-2.5" />}
              {b.id}
            </button>
          ))}
        </div>
        <Hint>Select badges that accurately describe the risk and trust level of your task.</Hint>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   STEP 2 – COMMITMENT
────────────────────────────────────── */
function Step2({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const totalValue = (parseFloat(data.stakeRequired || "0") + parseFloat(data.reward || "0")).toFixed(2);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label hint="Held in escrow. Returned on completion.">Stake required (ETH) *</Label>
          <TextInput value={data.stakeRequired} onChange={(v) => set("stakeRequired", v)} placeholder="0.0" type="number" prefix="Ξ" />
          <Hint>Stake aligns incentives. Workers must lock this to apply.</Hint>
        </div>
        <div>
          <Label hint="Total payout on successful delivery.">Reward / payout (ETH) *</Label>
          <TextInput value={data.reward} onChange={(v) => set("reward", v)} placeholder="0.0" type="number" prefix="Ξ" />
        </div>
      </div>

      {(data.stakeRequired || data.reward) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Stake locked",   value: `Ξ ${data.stakeRequired || "0"}`, color: "text-amber-300" },
            { label: "Reward payout",  value: `Ξ ${data.reward || "0"}`,        color: "text-emerald-300" },
            { label: "Total value",    value: `Ξ ${totalValue}`,                 color: "text-indigo-300" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-center">
              <p className={["text-sm font-bold", m.color].join(" ")}>{m.value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{m.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Estimated effort</Label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {EFFORT_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set("effort", e)}
                className={[
                  "px-2.5 py-2 rounded-xl border text-[11px] font-medium transition-all",
                  data.effort === e
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                    : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300",
                ].join(" ")}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Deadline *</Label>
          <TextInput value={data.deadline} onChange={(v) => set("deadline", v)} type="date" />
          <Hint>Workers will see days remaining, not the raw date.</Hint>
        </div>
      </div>

      <div>
        <Label hint="How many workers can be accepted for this task.">Open slots</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set("slots", String(Math.max(1, parseInt(data.slots) - 1)))}
            className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            −
          </button>
          <span className="text-sm font-bold text-white w-6 text-center">{data.slots}</span>
          <button
            type="button"
            onClick={() => set("slots", String(Math.min(20, parseInt(data.slots) + 1)))}
            className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            +
          </button>
          <span className="text-[11px] text-gray-600">
            {parseInt(data.slots) === 1 ? "Solo task" : `Up to ${data.slots} workers`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   STEP 3 – REQUIREMENTS
────────────────────────────────────── */
function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const addMilestone = () => {
    const m: Milestone = { id: Date.now().toString(), title: "", reward: "", deadline: "", description: "" };
    set("milestones", [...data.milestones, m]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    set("milestones", data.milestones.map((m) => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMilestone = (id: string) => {
    set("milestones", data.milestones.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label hint="Minimum REP score needed to apply. Set 0 for open access.">Minimum reputation (REP)</Label>
        <div className="flex items-center gap-3">
          <TextInput
            value={data.minReputation}
            onChange={(v) => set("minReputation", v)}
            placeholder="0"
            type="number"
          />
          {data.minReputation && (
            <span className={[
              "text-[11px] px-2 py-1 rounded-lg border",
              parseInt(data.minReputation) === 0 ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
              parseInt(data.minReputation) < 100 ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
              parseInt(data.minReputation) < 300 ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
              "border-red-500/30 text-red-400 bg-red-500/10"
            ].join(" ")}>
              {parseInt(data.minReputation) === 0 ? "Open to all" :
               parseInt(data.minReputation) < 100 ? "Low barrier" :
               parseInt(data.minReputation) < 300 ? "Mid level" : "Expert only"}
            </span>
          )}
        </div>
      </div>

      <div>
        <Label>Required skills *</Label>
        <TagInput
          tags={data.skills}
          onAdd={(v) => set("skills", [...data.skills, v])}
          onRemove={(v) => set("skills", data.skills.filter((s) => s !== v))}
          placeholder="e.g. Solidity, React, Ethers.js…"
        />
      </div>

      <div>
        <Label>Required roles</Label>
        <TagInput
          tags={data.roles}
          onAdd={(v) => set("roles", [...data.roles, v])}
          onRemove={(v) => set("roles", data.roles.filter((r) => r !== v))}
          placeholder="e.g. Smart Contract Dev, Auditor…"
        />
      </div>

      <div>
        <Label>Full task description *</Label>
        <textarea
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the task in detail — context, deliverables, acceptance criteria, tools to use…"
          rows={5}
          className="w-full rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none resize-none transition-colors"
        />
        <Hint>Markdown supported. Be explicit about what "done" means to avoid disputes.</Hint>
      </div>

      {/* Milestones — only for milestone task type */}
      {data.taskType === "milestone" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Milestones</Label>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add milestone
            </button>
          </div>

          <AnimatePresence>
            {data.milestones.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-800 p-5 text-center">
                <Layers className="w-5 h-5 text-gray-700 mx-auto mb-2" />
                <p className="text-[11px] text-gray-600">No milestones yet. Add one to break the task into phases.</p>
              </div>
            )}
            {data.milestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-indigo-400">Milestone {i + 1}</span>
                  <button type="button" onClick={() => removeMilestone(m.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="md:col-span-1">
                    <Label>Title</Label>
                    <TextInput value={m.title} onChange={(v) => updateMilestone(m.id, "title", v)} placeholder="e.g. Smart contract deploy" />
                  </div>
                  <div>
                    <Label>Reward (ETH)</Label>
                    <TextInput value={m.reward} onChange={(v) => updateMilestone(m.id, "reward", v)} placeholder="0.0" prefix="Ξ" type="number" />
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <TextInput value={m.deadline} onChange={(v) => updateMilestone(m.id, "deadline", v)} type="date" />
                  </div>
                </div>
                <div>
                  <Label>Acceptance criteria</Label>
                  <TextInput value={m.description} onChange={(v) => updateMilestone(m.id, "description", v)} placeholder="What must be delivered?" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   STEP 4 – REVIEW
────────────────────────────────────── */
function Step4({ data, onPublish, publishing, published }: {
  data: FormData;
  onPublish: () => void;
  publishing: boolean;
  published: boolean;
}) {
  const BADGE_MAP: Record<string, string> = {
    "Low Risk": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Verified Team": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "High Stake": "bg-red-500/10 text-red-400 border-red-500/20",
    "Fast Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "New Team": "bg-gray-500/10 text-gray-400 border-gray-500/20",
    "Urgent": "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const warnings: string[] = [];
  if (!data.title) warnings.push("Task title is required");
  if (!data.teamName) warnings.push("Team name is required");
  if (!data.category) warnings.push("Category is required");
  if (!data.objective) warnings.push("One-line objective is required");
  if (!data.stakeRequired) warnings.push("Stake required is missing");
  if (!data.reward) warnings.push("Reward amount is missing");
  if (!data.deadline) warnings.push("Deadline is required");
  if (data.skills.length === 0) warnings.push("At least one skill is required");
  if (!data.description) warnings.push("Task description is required");

  if (published) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <Rocket className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Task published on-chain</h3>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-6">
          Your task is live and visible to workers on the marketplace. You'll receive a notification when the first application arrives.
        </p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-800 text-xs text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
            View task <ArrowUpRight className="w-3 h-3" />
          </button>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors">
            Create another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <p className="text-xs font-semibold text-red-400">Fix before publishing</p>
          </div>
          <ul className="flex flex-col gap-1">
            {warnings.map((w) => (
              <li key={w} className="text-[11px] text-red-400/70 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/60 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Task preview card */}
      <div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Preview — how workers will see this task</p>
        <div className="rounded-2xl border border-indigo-500/20 bg-gray-900/60 overflow-hidden">
          {/* Gradient accent top */}
          <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-transparent" />
          <div className="p-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                  {(data.teamName || "TC").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">{data.title || "Untitled task"}</p>
                  <p className="text-[10px] text-gray-500">{data.teamName || "Your team"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {data.badges.slice(0, 2).map((b) => (
                  <span key={b} className={["text-[9px] font-medium px-1.5 py-0.5 rounded border", BADGE_MAP[b] || "border-gray-700 text-gray-500"].join(" ")}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mb-3 leading-snug">{data.objective || "No objective set."}</p>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { icon: <Coins className="w-3 h-3" />, label: "Stake", val: data.stakeRequired ? `Ξ ${data.stakeRequired}` : "—" },
                { icon: <Star className="w-3 h-3" />,  label: "Reward", val: data.reward ? `Ξ ${data.reward}` : "—" },
                { icon: <Clock className="w-3 h-3" />, label: "Deadline", val: data.deadline || "—" },
                { icon: <Shield className="w-3 h-3" />,label: "Min REP", val: data.minReputation || "0" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-gray-800 bg-gray-900/60 p-2 text-center">
                  <div className="text-gray-600 flex justify-center mb-1">{m.icon}</div>
                  <p className="text-[10px] font-semibold text-gray-300 leading-tight">{m.val}</p>
                  <p className="text-[9px] text-gray-700 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {data.skills.slice(0, 5).map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {s}
                </span>
              ))}
              {data.skills.length > 5 && (
                <span className="text-[10px] text-gray-600">+{data.skills.length - 5} more</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600">
                {data.slots} slot{parseInt(data.slots) > 1 ? "s" : ""} • {data.category || "Uncategorized"}
              </span>
              <div className="flex gap-1.5">
                <button className="px-3 py-1.5 rounded-lg border border-gray-700 text-[10px] text-gray-400">View Task</button>
                <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-[10px] font-semibold text-white">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { icon: <Tag className="w-3 h-3" />,      label: "Type",      val: data.taskType },
          { icon: <Hash className="w-3 h-3" />,     label: "Category",  val: data.category || "—" },
          { icon: <Coins className="w-3 h-3" />,    label: "Total value", val: data.stakeRequired && data.reward ? `Ξ ${(parseFloat(data.stakeRequired) + parseFloat(data.reward)).toFixed(3)}` : "—" },
          { icon: <Users className="w-3 h-3" />,    label: "Slots",     val: `${data.slots} open` },
          { icon: <Clock className="w-3 h-3" />,    label: "Effort",    val: data.effort || "—" },
          { icon: <Target className="w-3 h-3" />,   label: "Milestones",val: data.milestones.length > 0 ? `${data.milestones.length} defined` : "None" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900/40">
            <span className="text-gray-600">{r.icon}</span>
            <span className="text-[11px] text-gray-500 flex-1">{r.label}</span>
            <span className="text-[11px] font-medium text-gray-300 capitalize">{r.val}</span>
          </div>
        ))}
      </div>

      {/* Gas notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
        <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-amber-300 mb-0.5">On-chain publication</p>
          <p className="text-[11px] text-amber-400/70 leading-relaxed">
            Publishing this task writes to the blockchain. Estimated gas: ~0.0005 ETH. Your wallet will prompt for confirmation.
          </p>
        </div>
      </div>

      {/* Publish CTA */}
      <button
        type="button"
        onClick={onPublish}
        disabled={warnings.length > 0 || publishing}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
      >
        {publishing ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Publishing on-chain…
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            Publish task
          </>
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────
   LIVE PREVIEW SIDEBAR
────────────────────────────────────── */
function PreviewSidebar({ data }: { data: FormData }) {
  const BADGE_MAP: Record<string, string> = {
    "Low Risk": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Verified Team": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "High Stake": "bg-red-500/10 text-red-400 border-red-500/20",
    "Fast Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "New Team": "bg-gray-500/10 text-gray-400 border-gray-500/20",
    "Urgent": "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const completion = [
    !!data.title, !!data.teamName, !!data.category, !!data.objective,
    !!data.stakeRequired, !!data.reward, !!data.deadline,
    data.skills.length > 0, !!data.description,
  ];
  const pct = Math.round((completion.filter(Boolean).length / completion.length) * 100);

  return (
    <div className="w-64 flex-shrink-0 hidden xl:flex flex-col gap-4">
      {/* Completion */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Completeness</p>
          <span className="text-xs font-bold text-white">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {[
            { label: "Title",       done: !!data.title },
            { label: "Team",        done: !!data.teamName },
            { label: "Category",    done: !!data.category },
            { label: "Objective",   done: !!data.objective },
            { label: "Stake",       done: !!data.stakeRequired },
            { label: "Reward",      done: !!data.reward },
            { label: "Deadline",    done: !!data.deadline },
            { label: "Skills",      done: data.skills.length > 0 },
            { label: "Description", done: !!data.description },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <div className={["w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0",
                r.done ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-700"].join(" ")}>
                {r.done ? <Check className="w-2.5 h-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />}
              </div>
              <span className={["text-[10px]", r.done ? "text-gray-400" : "text-gray-700"].join(" ")}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini card preview */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-indigo-500/60 to-transparent" />
        <div className="p-4">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-3">Card preview</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-[9px] font-bold flex-shrink-0">
              {(data.teamName || "TC").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-200 leading-tight truncate max-w-[140px]">
                {data.title || "Task title"}
              </p>
              <p className="text-[9px] text-gray-600">{data.teamName || "Team name"}</p>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 mb-2 leading-snug line-clamp-2">{data.objective || "One-line objective…"}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {data.badges.slice(0, 2).map((b) => (
              <span key={b} className={["text-[8px] font-medium px-1.5 py-0.5 rounded border", BADGE_MAP[b] || ""].join(" ")}>{b}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="rounded border border-gray-800 bg-gray-900 p-1.5 text-center">
              <p className="text-[9px] font-semibold text-amber-300">{data.stakeRequired ? `Ξ ${data.stakeRequired}` : "—"}</p>
              <p className="text-[8px] text-gray-700">Stake</p>
            </div>
            <div className="rounded border border-gray-800 bg-gray-900 p-1.5 text-center">
              <p className="text-[9px] font-semibold text-emerald-300">{data.reward ? `Ξ ${data.reward}` : "—"}</p>
              <p className="text-[8px] text-gray-700">Reward</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.skills.slice(0, 3).map((s) => (
              <span key={s} className="text-[8px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   PAGE
────────────────────────────────────── */
export default function CreateTaskPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(EMPTY);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const set = useCallback((k: keyof FormData, v: unknown) => {
    setData((p) => ({ ...p, [k]: v }));
  }, []);

  const publish = async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 2200));
    setPublishing(false);
    setPublished(true);
  };

  const canNext: Record<number, boolean> = {
    1: !!data.title && !!data.teamName && !!data.category && !!data.objective,
    2: !!data.stakeRequired && !!data.reward && !!data.deadline,
    3: data.skills.length > 0 && !!data.description,
    4: true,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-white tracking-tight">Create task</h1>
          <p className="text-xs text-gray-500 mt-0.5">Post a new task to the Team Chain marketplace.</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                  step === s.id
                    ? "bg-gray-800 text-white"
                    : s.id < step
                      ? "text-indigo-400 hover:bg-gray-900 cursor-pointer"
                      : "text-gray-700 cursor-default",
                ].join(" ")}
              >
                <div className={[
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                  step === s.id ? "bg-indigo-500 text-white" :
                  s.id < step ? "bg-indigo-500/20 text-indigo-400" : "bg-gray-800 text-gray-700",
                ].join(" ")}>
                  {s.id < step ? <Check className="w-3 h-3" /> : s.icon}
                </div>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className={["h-px w-8 mx-1 flex-shrink-0", s.id < step ? "bg-indigo-500/30" : "bg-gray-800"].join(" ")} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main layout */}
        <div className="flex gap-6 items-start">

          {/* Form area */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  {step === 1 && <Step1 data={data} set={set} />}
                  {step === 2 && <Step2 data={data} set={set} />}
                  {step === 3 && <Step3 data={data} set={set} />}
                  {step === 4 && (
                    <Step4
                      data={data}
                      onPublish={publish}
                      publishing={publishing}
                      published={published}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              {!published && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setStep((p) => Math.max(1, p - 1))}
                    disabled={step === 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-800 text-xs text-gray-500 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>

                  <span className="text-[11px] text-gray-700">Step {step} of {STEPS.length}</span>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep((p) => Math.min(4, p + 1))}
                      disabled={!canNext[step]}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors"
                    >
                      Continue <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="w-24" /> // spacer to keep layout balanced on step 4
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <PreviewSidebar data={data} />
        </div>
      </div>
    </div>
  );
}