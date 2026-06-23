import Hint from "./Hint";
import Label from "./Label";
import TextInput from "./TextInput";
import type { FormData } from "./types";
import type { Role } from "@/utils/lib/express/mutations/users";
import { type SkillCategory, skills } from "@/utils/lib/helper/skills";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Plus, X } from "lucide-react";

const ROLE_OPTIONS: Role[] = ["developer", "designer", "project_manager"];

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  database: "Database",
  devops: "DevOps",
  design: "Tools & Design",
};

export default function Step3({ data, set }: { data: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Reputation */}
      <div>
        <Label hint="Minimum REP score needed to apply. Set 0 for open access.">Minimum reputation (REP)</Label>

        <div className="flex items-center gap-3">
          <TextInput value={data.minReputation} onChange={v => set("minReputation", v)} placeholder="0" type="number" />

          {data.minReputation && (
            <span
              className={[
                "text-[11px] px-2 py-1 rounded-lg border",
                parseInt(data.minReputation) === 0
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  : parseInt(data.minReputation) < 100
                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                    : parseInt(data.minReputation) < 300
                      ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                      : "border-red-500/30 text-red-400 bg-red-500/10",
              ].join(" ")}
            >
              {parseInt(data.minReputation) === 0
                ? "Open to all"
                : parseInt(data.minReputation) < 100
                  ? "Low barrier"
                  : parseInt(data.minReputation) < 300
                    ? "Mid level"
                    : "Expert only"}
            </span>
          )}
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label>Required skills *</Label>

        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold text-gray-400">{label}</p>

              <div className="flex flex-wrap gap-2">
                {skills
                  .filter(skill => skill.category === category)
                  .map(skill => {
                    const selected = data.skills.includes(skill.id);

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            set(
                              "skills",
                              data.skills.filter(s => s !== skill.id),
                            );
                          } else {
                            set("skills", [...data.skills, skill.id]);
                          }
                        }}
                        className={[
                          "px-3 py-1.5 rounded-lg border text-[11px] transition-all",
                          selected
                            ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                            : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300",
                        ].join(" ")}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <Hint>Select one or more skills required for this task.</Hint>
      </div>

      {/* Roles */}
      <div>
        <Label>Required roles</Label>

        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map(role => {
            const selected = data.roles.includes(role);

            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  if (selected) {
                    set("roles", []);
                  } else {
                    set("roles", [role]);
                  }
                }}
                className={[
                  "px-3 py-2 rounded-xl border text-[11px] font-medium transition-all",
                  selected
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                    : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300",
                ].join(" ")}
              >
                {role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            );
          })}
        </div>

        <Hint>Choose which roles are eligible to apply.</Hint>
      </div>

      {/* Description */}
      <div>
        <Label>Full task description *</Label>

        <textarea
          value={data.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Describe the task in detail — context, deliverables, acceptance criteria, tools to use..."
          rows={5}
          className="w-full rounded-xl border border-gray-800 bg-gray-900 focus:border-indigo-500/50 px-3 py-2.5 text-xs text-gray-200 placeholder:text-gray-600 outline-none resize-none transition-colors"
        />

        <Hint>Markdown supported. Be explicit about deliverables and acceptance criteria.</Hint>
      </div>
    </div>
  );
}
