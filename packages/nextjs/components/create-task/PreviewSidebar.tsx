import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { FormData } from "./types";

const BADGE_MAP: Record<string, string> = {
  "Low Risk": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Verified Team": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "High Stake": "bg-red-500/10 text-red-400 border-red-500/20",
  "Fast Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "New Team": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "Urgent": "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function PreviewSidebar({ data }: { data: FormData }) {
  const completion = [
    !!data.title, !!data.teamName, !!data.category, !!data.objective,
    !!data.stakeRequired, !!data.reward, !!data.deadline,
    data.skills.length > 0, !!data.description,
  ];
  const pct = Math.round((completion.filter(Boolean).length / completion.length) * 100);

  return (
    <div className="w-64 flex-shrink-0 hidden xl:flex flex-col gap-4">
      {/* Completeness */}
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