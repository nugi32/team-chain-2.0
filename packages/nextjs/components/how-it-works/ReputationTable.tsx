"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RepEvent {
  event: string;
  delta: string;
  direction: "up" | "down";
  category: string;
}

export default function ReputationTable({
  events,
  filter,
  onFilterChange,
}: {
  events: RepEvent[];
  filter: "all" | "up" | "down";
  onFilterChange: (f: "all" | "up" | "down") => void;
}) {
  const filtered = events.filter(e => filter === "all" || e.direction === filter);

  return (
    <>
      <div className="flex gap-1.5 mb-4">
        {[
          { key: "all", label: "All Events" },
          { key: "up", label: "Gains" },
          { key: "down", label: "Penalties" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key as typeof filter)}
            className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                : "border border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium w-8"></th>
                <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Event</th>
                <th className="text-left px-3 py-3.5 text-gray-500 font-medium">Category</th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium">REP Impact</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(e => (
                  <motion.tr
                    key={e.event}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        e.direction === "up" ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                        {e.direction === "up" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-300">{e.event}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        e.category === "Completion" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                        e.category === "Social" ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" :
                        e.category === "Dispute" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" :
                        e.category === "Decay" ? "text-purple-400 border-purple-500/20 bg-purple-500/5" :
                        "text-red-400 border-red-500/20 bg-red-500/5"
                      }`}>{e.category}</span>
                    </td>
                    <td className={`px-5 py-3 text-right font-mono font-semibold ${e.direction === "up" ? "text-emerald-400" : "text-red-400"}`}>{e.delta}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}