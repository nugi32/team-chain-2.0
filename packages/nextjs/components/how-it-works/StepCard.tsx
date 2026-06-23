"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const STEP_COLOR: Record<string, string> = {
  indigo: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  purple: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  green: "border-green-500/40 bg-green-500/10 text-green-300",
};
const STEP_LINE: Record<string, string> = {
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
  emerald: "bg-emerald-500",
  green: "bg-green-500",
};

interface Step {
  number: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
  detail: string;
}

export default function StepCard({
  step,
  index,
  isActive,
  onClick,
}: {
  step: Step;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden ${
        isActive ? `${STEP_COLOR[step.color]} border-opacity-100` : "border-gray-800 bg-gray-900 hover:border-gray-700"
      }`}
    >
      <div className={`h-0.5 w-full ${isActive ? STEP_LINE[step.color] : "bg-gray-800"}`} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${STEP_COLOR[step.color]}`}
          >
            {step.icon}
          </div>
          <span className="text-[10px] font-mono text-gray-600">{step.number}</span>
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-current/20 text-xs text-gray-300 leading-relaxed opacity-80">
                {step.detail}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="mt-3 text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors">
          {isActive ? "Hide detail" : "Learn more"}
          <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? "rotate-180" : ""}`} />
        </button>
      </div>
    </motion.div>
  );
}
