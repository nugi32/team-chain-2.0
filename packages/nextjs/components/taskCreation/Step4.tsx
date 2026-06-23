"use client";

import { useState } from "react";
import Link from "next/link";
import type { FormData } from "./types";
import {
  BackendTaskPayload,
  type SmartContractTaskPayload,
  useTaskCreation,
} from "@/utils/lib/taskLib/TaskLifecycleLogic/taskCreation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Coins,
  Hash,
  Rocket,
  Shield,
  Star,
  Tag,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

// Simple UUID v4 generator for browser
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const BADGE_MAP: Record<string, string> = {
  "Low Risk": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Verified Team": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "High Stake": "bg-red-500/10 text-red-400 border-red-500/20",
  "Fast Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "New Team": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  Urgent: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Step4({
  data,
  onPublish,
  publishing,
  published,
}: {
  data: FormData;
  onPublish: () => void;
  publishing: boolean;
  published: boolean;
}) {
  const { address } = useAccount();
  const { createTask, isLoading, error: taskError } = useTaskCreation();
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Convert FormData to SmartContractTaskPayload
   * Maps deadline (ISO date string) to hours (bigint)
   * Converts reward amount to value (ETH as string)
   */
  const buildSmartContractPayload = (): SmartContractTaskPayload => {
    // Calculate hours from date: (date - now) / 3,600,000 ms/hour
    const deadlineMs = data.deadline ? new Date(data.deadline).getTime() - Date.now() : null;
    const deadlineHours =
      deadlineMs !== null && deadlineMs > 3_600_000 ? BigInt(Math.ceil(deadlineMs / 3_600_000)) : BigInt(0);
    const maxRevisions = BigInt(parseInt(data.maxRevisions) || 1);

    return {
      title: data.title,
      githubURL: data.githubIssueUrl,
      deadlineHours,
      maximumRevision: maxRevisions,
      user: address as `0x${string}`,
      value: data.reward || "0", // Reward in ETH
    };
  };

  /**
   * Convert FormData to BackendTaskPayload
   * Includes all off-chain metadata
   */
  const buildBackendPayload = (): BackendTaskPayload => {
    return {
      contractId: generateUUID(), // Generate unique UUID for this task
      projectName: data.projectName,
      objective: data.objective,
      category: data.category as any, // Category validation happens in form
      effort: data.effort as any, // Effort validation happens in form
      minReputation: data.minReputation,
      roles: data.roles,
      skills: data.skills,
      description: data.description,
      badges: data.badges,
      reward: data.reward || "0", // ETH amount as string
    };
  };

  const handlePublish = async () => {
    setLocalError(null);

    try {
      if (!address) {
        notification.error("Please connect your wallet to publish the task on-chain.");
        return;
      }

      const scPayload = buildSmartContractPayload();
      const backendPayload = buildBackendPayload();

      await createTask(scPayload, backendPayload);
      onPublish();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish task";
      setLocalError(message);
      console.error("Task publication error:", err);
    }
  };

  const warnings: string[] = [];
  if (!data.title) warnings.push("Task title is required");
  if (!data.projectName) warnings.push("Project name is required");
  if (!data.category) warnings.push("Category is required");
  if (!data.objective) warnings.push("One-line objective is required");
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
          Your task is live and visible to workers on the marketplace. You'll receive a notification when the first
          application arrives.
        </p>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/${localStorage.getItem("userId")}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-800 text-xs text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
          >
            View task <ArrowUpRight className="w-3 h-3" />
          </Link>
          <button
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            onClick={() => window.location.reload()}
          >
            Create another
          </button>
        </div>
      </motion.div>
    );
  }

  const slots = data.slots || "1";

  return (
    <div className="flex flex-col gap-5">
      {(warnings.length > 0 || localError || taskError) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <p className="text-xs font-semibold text-red-400">
              {localError || taskError ? "Error" : "Fix before publishing"}
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {(localError || taskError) && (
              <li className="text-[11px] text-red-400/70 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/60 flex-shrink-0" />
                {localError || taskError}
              </li>
            )}
            {warnings.map(w => (
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
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">
          Preview — how workers will see this task
        </p>
        <div className="rounded-2xl border border-indigo-500/20 bg-gray-900/60 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                  {(data.projectName || "TC").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">{data.title || "Untitled task"}</p>
                  <p className="text-[10px] text-gray-500">{data.projectName || "Your project"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {data.badges.slice(0, 2).map((b: string) => (
                  <span
                    key={b}
                    className={[
                      "text-[9px] font-medium px-1.5 py-0.5 rounded border",
                      BADGE_MAP[b] || "border-gray-700 text-gray-500",
                    ].join(" ")}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">{data.objective || "No objective set."}</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                {
                  icon: <Coins className="w-3 h-3" />,
                  label: "Stake",
                  val: data.stakeRequired ? `Ξ ${data.stakeRequired}` : "—",
                },
                {
                  icon: <Star className="w-3 h-3" />,
                  label: "Reward",
                  val: data.reward ? `Ξ ${data.reward}` : "—",
                },
                { icon: <Clock className="w-3 h-3" />, label: "Deadline", val: data.deadline || "—" },
                {
                  icon: <Shield className="w-3 h-3" />,
                  label: "Min REP",
                  val: data.minReputation || "0",
                },
              ].map(m => (
                <div key={m.label} className="rounded-lg border border-gray-800 bg-gray-900/60 p-2 text-center">
                  <div className="text-gray-600 flex justify-center mb-1">{m.icon}</div>
                  <p className="text-[10px] font-semibold text-gray-300 leading-tight">{m.val}</p>
                  <p className="text-[9px] text-gray-700 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {data.skills.slice(0, 5).map((s: string) => (
                <span
                  key={s}
                  className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700"
                >
                  {s}
                </span>
              ))}
              {data.skills.length > 5 && (
                <span className="text-[10px] text-gray-600">+{data.skills.length - 5} more</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600">
                {slots} slot{parseInt(slots) > 1 ? "s" : ""} • {data.category || "Uncategorized"}
              </span>
              <div className="flex gap-1.5">
                <Link
                  className="px-3 py-1.5 rounded-lg border border-gray-700 text-[10px] text-gray-400"
                  href={`/dashboard/${localStorage.getItem("userId")}`}
                >
                  View Task
                </Link>
                <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-[10px] font-semibold text-white">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { icon: <Tag className="w-3 h-3" />, label: "Effort", val: data.effort || "—" },
          { icon: <Hash className="w-3 h-3" />, label: "Category", val: data.category || "—" },
          {
            icon: <Coins className="w-3 h-3" />,
            label: "Total value",
            val:
              data.stakeRequired && data.reward
                ? `Ξ ${(parseFloat(data.stakeRequired) + parseFloat(data.reward)).toFixed(3)}`
                : "—",
          },
          {
            icon: <Users className="w-3 h-3" />,
            label: "Max Revisions",
            val: data.maxRevisions || "1",
          },
          {
            icon: <Clock className="w-3 h-3" />,
            label: "Deadline",
            val: data.deadline ? `${data.deadline} days` : "—",
          },
          {
            icon: <Target className="w-3 h-3" />,
            label: "Milestones",
            val: data.milestones.length > 0 ? `${data.milestones.length} defined` : "None",
          },
        ].map(r => (
          <div
            key={r.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900/40"
          >
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
            Publishing this task writes to the blockchain. Estimated gas: ~0.0005 ETH. Your wallet will prompt for
            confirmation.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePublish}
        disabled={warnings.length > 0 || publishing || isLoading}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
      >
        {publishing || isLoading ? (
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
