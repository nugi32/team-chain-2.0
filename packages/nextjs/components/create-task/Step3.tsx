import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Layers } from "lucide-react";
import Label from "./Label";
import TextInput from "./TextInput";
import Hint from "./Hint";
import TagInput from "./TagInput";
import type { FormData, Milestone } from "./types";

export default function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
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

      {/* Milestones */}
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