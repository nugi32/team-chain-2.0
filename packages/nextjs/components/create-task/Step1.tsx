import { Check } from "lucide-react";
import Label from "./Label";
import TextInput from "./TextInput";
import Select from "./Select";
import Hint from "./Hint";
import type { FormData } from "./types";

const CATEGORIES = [
  "Smart Contracts", "Frontend", "Backend", "Security Audit",
  "Design / UX", "Documentation", "Research", "DevOps", "Community",
];

const TASK_TYPES = [
  { id: "bounty",    label: "Bounty",     desc: "Fixed reward on delivery" },
  { id: "milestone", label: "Milestone",  desc: "Paid per milestone" },
  { id: "retainer",  label: "Retainer",   desc: "Ongoing recurring work" },
];

const BADGE_OPTIONS = [
  { id: "Low Risk",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "Verified Team", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "High Stake",    color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { id: "Fast Review",   color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "New Team",      color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  { id: "Urgent",        color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

export default function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
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