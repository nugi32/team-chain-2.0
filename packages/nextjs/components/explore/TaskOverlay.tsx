"use client";

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    X, CircleDot, Lock, DollarSign, Clock, Calendar,
    ExternalLink, Zap, ArrowRight, Code, GitBranch, Loader2,
} from "lucide-react";

// ── adjust import paths to match your project layout ──────────────
import { Task, TaskStatus, mapContractTask, RawContractTask } from "./types";
import { useTaskData } from "@/utils/lib/smartContractWrapper/user/taskData";
import SkillTag from "./SkillTag";
// ──────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const ethDisplay = (val?: bigint): string => {
    if (val === undefined || val === null) return "N/A";
    const eth = Number(val) / 1e18;
    if (eth === 0)    return "0 ETH";
    if (eth < 0.0001) return "< 0.0001 ETH";
    return `${eth.toFixed(4)} ETH`;
};

const daysUntil = (ts?: bigint): number => {
    if (!ts) return 9999;
    const diff = Number(ts) - Math.floor(Date.now() / 1000);
    return Math.max(0, Math.floor(diff / 86400));
};

const deadlineLabel = (ts?: bigint): string => {
    const days = daysUntil(ts);
    if (days === 9999) return "N/A";
    if (days === 0)    return "< 1 day";
    return `${days} day${days === 1 ? "" : "s"}`;
};

const statusStyles = (status?: TaskStatus): string => {
    switch (status) {
        case TaskStatus.OpenRegistration:
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case TaskStatus.Active:
        case TaskStatus.InProgres:
            return "bg-sky-500/10 text-sky-400 border-sky-500/20";
        case TaskStatus.Completed:
            return "bg-gray-700/30 text-gray-500 border-gray-700";
        case TaskStatus.Cancelled:
            return "bg-red-500/10 text-red-400 border-red-500/20";
        default:
            return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
};

const statusLabel = (status?: TaskStatus): string => {
    if (status === undefined) return "Created";
    return TaskStatus[status] ?? "Unknown";
};

const shortAddr = (addr?: string): string =>
    addr && addr !== ZERO_ADDRESS
        ? `${addr.slice(0, 6)}…${addr.slice(-4)}`
        : "";

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function TaskOverlay({
    task,
    onClose,
}: {
    task: Task | null;
    onClose: () => void;
}) {
    const router = useRouter();

    // ✅ Hook called unconditionally at the top level.
    //    When task is null, smartContractId is undefined → no on-chain
    //    call is made for a specific task, but the hook itself is still
    //    called (Rules of Hooks satisfied).
    const {
        data: { task: rawOnchainTask },
        loading: { task: isOnchainLoading },
    } = useTaskData(task?.smartContractId);

    /**
     * Merge off-chain task with on-chain data.
     * mapContractTask converts bigint fields (taskId, maxRevision,
     * deadlineHours) to number so the result matches OnchainTask.
     */
    const enrichedTask: Task | null = useMemo(() => {
        if (!task) return null;
        if (!rawOnchainTask) return task;
        return {
            ...task,
            ...mapContractTask(rawOnchainTask as unknown as RawContractTask),
        };
    }, [task, rawOnchainTask]);

    // Escape key closes the overlay
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleOpenDetails = () => {
        if (!enrichedTask) return;
        const id = enrichedTask._id ?? enrichedTask.id;
        router.push(`/tasks/${id}`);
    };

    const deadlineDays      = daysUntil(enrichedTask?.deadlineAt);
    const hasAssignedMember =
        enrichedTask?.member &&
        enrichedTask.member !== ZERO_ADDRESS;

    // ─────────────────────────────────────────────────────────────
    return (
        <AnimatePresence>
            {task && (
                <>
                    {/* ── backdrop ─────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* ── slide-over panel ─────────────────────────────── */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[460px] bg-gray-950 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
                    >

                        {/* ── HEADER ───────────────────────────────────── */}
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-800">
                            <div className="flex items-start gap-3 min-w-0">
                                {task.picture ? (
                                    <img
                                        src={task.picture}
                                        alt={task.title}
                                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-800"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                                        <Code className="w-5 h-5 text-white" />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-gray-100 leading-tight">
                                        {task.title}
                                    </h2>
                                    <p className="text-xs text-indigo-400 mt-0.5 font-mono truncate">
                                        {enrichedTask?.creator
                                            ? shortAddr(enrichedTask.creator)
                                            : (task.owner ?? "Unknown creator")}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-300 transition-colors mt-0.5 flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ── BODY ─────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                            {/* Status + GitHub link */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${statusStyles(enrichedTask?.status)}`}
                                >
                                    <CircleDot className="w-2.5 h-2.5" />
                                    {statusLabel(enrichedTask?.status)}
                                </span>

                                {enrichedTask?.githubURL && (
                                    <a
                                        href={enrichedTask.githubURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-700 text-[10px] text-gray-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
                                    >
                                        <GitBranch className="w-2.5 h-2.5" /> GitHub
                                    </a>
                                )}

                                {/* On-chain data loading indicator */}
                                {isOnchainLoading && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                        Loading chain data…
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {task.description && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                        Task Description
                                    </p>

                                    {task.description.header && (
                                        <p className="text-xs font-semibold text-gray-300 mb-1.5">
                                            {task.description.header}
                                        </p>
                                    )}

                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {task.description.summary}
                                    </p>

                                    {(task.description.points?.length ?? 0) > 0 && (
                                        <ul className="mt-3 space-y-1.5">
                                            {task.description.points.map((point, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {task.description.footer && (
                                        <p className="mt-2.5 text-xs text-gray-600 italic">
                                            {task.description.footer}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Commitment terms — on-chain fields */}
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                    Commitment Terms
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            icon:  <Lock className="w-3.5 h-3.5 text-amber-400" />,
                                            label: "Creator Stake",
                                            value: ethDisplay(enrichedTask?.creatorStake),
                                            color: "text-amber-400",
                                        },
                                        {
                                            icon:  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
                                            label: "Reward",
                                            value: ethDisplay(enrichedTask?.reward),
                                            color: "text-emerald-400",
                                        },
                                        {
                                            icon:  <Clock className="w-3.5 h-3.5 text-indigo-400" />,
                                            label: "Est. Hours",
                                            value: enrichedTask?.deadlineHours ? `~${enrichedTask.deadlineHours}h` : "N/A",
                                            color: "text-gray-200",
                                        },
                                        {
                                            icon:  <Calendar className="w-3.5 h-3.5 text-red-400" />,
                                            label: "Deadline",
                                            value: deadlineLabel(enrichedTask?.deadlineAt),
                                            color:
                                                deadlineDays < 9999 && deadlineDays <= 3
                                                    ? "text-red-400"
                                                    : "text-gray-200",
                                        },
                                    ].map(item => (
                                        <div
                                            key={item.label}
                                            className="bg-gray-900 rounded-xl border border-gray-800 p-3"
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                {item.icon}
                                                <span className="text-[10px] text-gray-500">{item.label}</span>
                                            </div>
                                            <p className={`text-sm font-bold ${item.color}`}>
                                                {isOnchainLoading ? (
                                                    <span className="inline-block w-12 h-3.5 bg-gray-800 rounded animate-pulse" />
                                                ) : (
                                                    item.value
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Access requirements */}
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                    Access Requirements
                                </p>
                                <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-xs text-gray-500">Member Stake</span>
                                        <span className="text-xs font-semibold text-indigo-400">
                                            {isOnchainLoading
                                                ? <span className="inline-block w-16 h-3 bg-gray-800 rounded animate-pulse" />
                                                : ethDisplay(enrichedTask?.memberStake)
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-xs text-gray-500">Max Revisions</span>
                                        <span className="text-xs font-semibold text-gray-200">
                                            {isOnchainLoading
                                                ? <span className="inline-block w-8 h-3 bg-gray-800 rounded animate-pulse" />
                                                : (enrichedTask?.maxRevision ?? "N/A")
                                            }
                                        </span>
                                    </div>

                                    {hasAssignedMember && (
                                        <div className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-xs text-gray-500">Assigned To</span>
                                            <span className="text-xs font-semibold font-mono text-gray-200">
                                                {shortAddr(enrichedTask?.member)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            {(task.skills?.length ?? 0) > 0 && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                        Required Skills
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {task.skills!.map(s => (
                                            <SkillTag key={s} skill={s} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stake lock states */}
                            {!isOnchainLoading &&
                                (enrichedTask?.isCreatorStakeLocked !== undefined ||
                                    enrichedTask?.isMemberStakeLocked !== undefined) && (
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                            Stake Status
                                        </p>
                                        <div className="flex gap-2.5 flex-wrap">
                                            {(
                                                [
                                                    { label: "Creator", locked: enrichedTask?.isCreatorStakeLocked },
                                                    { label: "Member",  locked: enrichedTask?.isMemberStakeLocked  },
                                                ] as const
                                            ).map(
                                                item =>
                                                    item.locked !== undefined && (
                                                        <div
                                                            key={item.label}
                                                            className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2"
                                                        >
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    item.locked ? "bg-amber-400" : "bg-emerald-400"
                                                                }`}
                                                            />
                                                            <div>
                                                                <p className="text-[10px] text-gray-500">
                                                                    {item.label} Stake
                                                                </p>
                                                                <p
                                                                    className={`text-xs font-semibold ${
                                                                        item.locked ? "text-amber-400" : "text-emerald-400"
                                                                    }`}
                                                                >
                                                                    {item.locked ? "Locked" : "Free"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* ── FOOTER ACTIONS ───────────────────────────── */}
                        <div className="px-6 py-4 border-t border-gray-800 space-y-2.5">
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    Apply <ArrowRight className="w-4 h-4" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4" /> Stake & Join
                                </motion.button>
                            </div>

                            <button
                                onClick={handleOpenDetails}
                                className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Open Full Details
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}