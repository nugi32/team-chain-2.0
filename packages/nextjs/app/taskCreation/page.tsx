"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, FileText, Coins, Users, Eye } from "lucide-react";

import Step1 from "@/components/create-task/Step1";
import Step2 from "@/components/create-task/Step2";
import Step3 from "@/components/create-task/Step3";
import Step4 from "@/components/create-task/Step4";
import PreviewSidebar from "@/components/create-task/PreviewSidebar";
import type { FormData } from "@/components/create-task/types";

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

const STEPS = [
  { id: 1, label: "Basics",      icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 2, label: "Commitment",  icon: <Coins className="w-3.5 h-3.5" /> },
  { id: 3, label: "Requirements",icon: <Users className="w-3.5 h-3.5" /> },
  { id: 4, label: "Review",      icon: <Eye className="w-3.5 h-3.5" /> },
];

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
                    <div className="w-24" />
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