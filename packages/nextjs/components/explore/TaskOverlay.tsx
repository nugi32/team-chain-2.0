"use client";

import React, { useEffect, useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    X, CircleDot, Lock, DollarSign, Clock, Calendar,
    ExternalLink, Zap, ArrowRight, Code, GitBranch,
    User, Link2, Trophy, CheckCircle2, Loader2,
} from "lucide-react";

import { CompleteTaskOutput, CreatorProfile, TaskStatus } from "./types";
import { useDashboardUserData } from "@/utils/lib/dashboard";
import SkillTag from "./SkillTag";
import { useGetTaskUtils } from "@/utils/lib/helper/useGetTaskUtils";
import { useDashboardTaskActions } from "@/utils/lib/dashboard";
import { useAccount } from "wagmi";
import { notification } from "@/utils/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const TIER_STYLES = {
    Bronze:   { card: "border-amber-700/30  bg-amber-950/20",   badge: "bg-amber-900/40  border-amber-700/50  text-amber-400",   dot: "bg-amber-400",  stat: "text-amber-400"  },
    Silver:   { card: "border-slate-500/30  bg-slate-800/20",   badge: "bg-slate-700/40  border-slate-500/50  text-slate-300",   dot: "bg-slate-400",  stat: "text-slate-300"  },
    Gold:     { card: "border-yellow-600/30 bg-yellow-950/20",  badge: "bg-yellow-900/40 border-yellow-600/50 text-yellow-400",  dot: "bg-yellow-400", stat: "text-yellow-400" },
    Platinum: { card: "border-cyan-600/30   bg-cyan-950/20",    badge: "bg-cyan-900/40   border-cyan-600/50   text-cyan-400",    dot: "bg-cyan-400",   stat: "text-cyan-400"   },
} as const;

// ─────────────────────────────────────────────────────────────────
// HELPERS — all bigint-safe
// ─────────────────────────────────────────────────────────────────

const ethDisplay = (val?: number | bigint): string => {
    if (val === undefined || val === null) return "N/A";
    const eth = Number(val) / 1e18;
    if (eth === 0)     return "0 ETH";
    if (eth < 0.0001) return "< 0.0001 ETH";
    return `${eth.toFixed(4)} ETH`;
};

const daysUntil = (ts?: number | bigint): number => {
    const t = Number(ts ?? 0);
    if (!t) return 9999;
    return Math.max(0, Math.floor((t - Math.floor(Date.now() / 1000)) / 86400));
};

const deadlineLabel = (ts?: number | bigint): string => {
    const d = daysUntil(ts);
    if (d === 9999) return "N/A";
    if (d === 0)    return "< 1 day";
    return `${d} day${d === 1 ? "" : "s"}`;
};

const statusStyles = (status?: TaskStatus): string => {
    switch (status) {
        case TaskStatus.OpenRegistration: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case TaskStatus.Active:
        case TaskStatus.InProgres:        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
        case TaskStatus.Completed:        return "bg-gray-700/30 text-gray-500 border-gray-700";
        case TaskStatus.Cancelled:        return "bg-red-500/10 text-red-400 border-red-500/20";
        default:                          return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
};

const statusLabel = (status?: TaskStatus): string => {
    if (status === undefined) return "Created";
    return TaskStatus[status] ?? "Unknown";
};

const shortAddr = (addr?: string): string =>
    addr && addr !== ZERO_ADDRESS ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

/** Validate a GitHub URL — rejects placeholder junk like "sfsdfs" */
const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.protocol === "https:" || u.protocol === "http:";
    } catch {
        return false;
    }
};

/**
 * `description` in CompleteTaskOutput is stored as a plain string.
 * Some tasks encode it as JSON — try to parse, fall back to plain text.
 */
function parseDescription(raw: string): {
    header?: string;
    summary?: string;
    points?: string[];
    footer?: string;
} {
    if (!raw) return {};
    try {
        const p = JSON.parse(raw);
        if (p && typeof p === "object") return p;
    } catch {}
    return { summary: raw };
}

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENT: CreatorCard
// ─────────────────────────────────────────────────────────────────

function CreatorCard({
    creator,
    creatorAddress,
    loading,
}: {
    creator:        CreatorProfile | null | undefined;
    creatorAddress: string | undefined;
    loading:        boolean;
}) {
    if (loading) {
        return (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-800 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-800 rounded w-28" />
                        <div className="h-2.5 bg-gray-800 rounded w-20" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800/60">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="h-4 bg-gray-800 rounded w-10" />
                            <div className="h-2 bg-gray-800 rounded w-14" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-xs font-mono text-gray-400">
                            {shortAddr(creatorAddress) || "Unknown"}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-0.5">Not registered on platform</p>
                    </div>
                </div>
            </div>
        );
    }

    const tier        = creator.tier as keyof typeof TIER_STYLES | undefined;
    const tierStyle   = tier ? TIER_STYLES[tier] : null;
    const reputation  = Number(creator.reputation  ?? 0);
    const completed   = Number(creator.totalTasksCompleted ?? 0);
    const created     = Number(creator.totalTasksCreated   ?? 0);
    const successRate = creator.successRate ?? 0;
    const successColor =
        successRate >= 80 ? "text-emerald-400" :
        successRate >= 50 ? "text-yellow-400"  :
                            "text-gray-300";

    return (
        <div className={`rounded-xl border p-4 space-y-3.5 ${
            tierStyle ? tierStyle.card : "bg-gray-900 border-gray-800"
        }`}>

            {/* Avatar + name + tier */}
            <div className="flex items-center gap-3">
                {creator.profilePicture ? (
                    <img
                        src={creator.profilePicture}
                        alt={creator.name ?? "Creator"}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-700 flex-shrink-0"
                    />
                ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                            {creator.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </span>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-100 truncate">
                            {creator.name ?? shortAddr(creatorAddress)}
                        </p>
                        {tier && tierStyle && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide ${tierStyle.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
                                {tier}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        {creator.role && (
                            <span className="text-[10px] text-indigo-400 font-medium">{creator.role}</span>
                        )}
                        <p className="text-[10px] text-gray-600 font-mono truncate">
                            {shortAddr(creator.walletAddress ?? creatorAddress)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bio header from description object */}
            {creator.description?.header && (
                <p className="text-xs text-gray-400 italic leading-relaxed border-l-2 border-indigo-500/30 pl-3">
                    {creator.description.header}
                </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-gray-800 rounded-lg overflow-hidden border border-gray-800">
                {[
                    { label: "Reputation",   value: reputation,        color: tierStyle?.stat ?? "text-indigo-400" },
                    { label: "Success Rate", value: `${successRate}%`, color: successColor },
                    { label: "Completed",    value: completed,         color: "text-gray-200" },
                ].map(stat => (
                    <div key={stat.label} className="flex flex-col items-center py-2.5 bg-gray-900">
                        <p className={`text-sm font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5 text-center">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Creator skills */}
            {(creator.skills?.length ?? 0) > 0 && (
                <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1">
                        {creator.skills!.slice(0, 6).map(s => <SkillTag key={s} skill={s} />)}
                        {creator.skills!.length > 6 && (
                            <span className="text-[10px] text-gray-600 self-center">
                                +{creator.skills!.length - 6} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Social links */}
            {(creator.github || creator.linkedin) && (
                <div className="flex items-center gap-3 pt-0.5 border-t border-gray-800/60">
                    {creator.github && (
                        <a href={creator.github} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors">
                            <GitBranch className="w-3 h-3" /> GitHub
                        </a>
                    )}
                    {creator.linkedin && (
                        <a href={creator.linkedin} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors">
                            <Link2 className="w-3 h-3" /> LinkedIn
                        </a>
                    )}
                    <div className="flex items-center gap-1 ml-auto text-[10px] text-gray-600">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{created} tasks created</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// MAIN: TaskOverlay
// ─────────────────────────────────────────────────────────────────

export default function TaskOverlay({
    task,
    onClose,
}: {
    task:    CompleteTaskOutput | null;
    onClose: () => void;
}) {
    const router = useRouter();
    const { address, isConnected } = useAccount();

    // All hooks must be called unconditionally (Rules of Hooks)
    const { getMemberRequiredStake } = useGetTaskUtils();
    const { actions } = useDashboardTaskActions();

    // Read member stake percentage from contract directly to avoid state timing issues
    const { data: stakePercentage } = useScaffoldReadContract({
        contractName: "dataContract",
        functionName: "__getMemberStakeFromRewardPercentage",
    });

    const [joining, setJoining] = useState(false);

    // Resolve creator address unconditionally
    const creatorAddress =
        task?.creator && task.creator !== ZERO_ADDRESS
            ? task.creator
            : task?.owner ?? undefined;

    const { user: creator, loadingUser: loadingCreator } =
        useDashboardUserData(creatorAddress);

    // Escape key
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    // Parse description
    const desc = useMemo(
        () => (task?.description ? parseDescription(task.description) : null),
        [task?.description],
    );

    // ── handleJoin ──────────────────────────────────────────────
    const handleJoin = useCallback(async () => {
        // Guard: task must exist at call time
        if (!task) return;

        if (!isConnected || !address) {
            notification.error("Please connect your wallet to join the task.");
            return;
        }

        // Guard: prevent creator from joining their own task
        if (creatorAddress && address.toLowerCase() === creatorAddress.toLowerCase()) {
            notification.error("You cannot join your own task.");
            return;
        }

        // Guard: stake percentage must be loaded from contract
        if (stakePercentage === undefined) {
            notification.error("Unable to load stake requirements. Please try again.");
            return;
        }

        const taskId = BigInt(task.smartContractId ?? 0);

        setJoining(true);
        try {
            // Calculate stake directly from task reward and percentage to avoid state timing issues
            // Formula: (reward * percentage) / 100
            const reward = BigInt(task.reward ?? 0);
            const percentage = BigInt(stakePercentage);
            const stake = (reward * percentage) / BigInt(100);
            
            console.log("[handleJoin] Calculated stake:", {
                taskId: taskId.toString(),
                reward: reward.toString(),
                percentage: percentage.toString(),
                stake: stake.toString(),
                address,
            });
            
            await actions.requestJoinTask(taskId, stake, address);
            notification.success("Join request submitted!");
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Transaction failed";
            notification.error(msg);
        } finally {
            setJoining(false);
        }
    }, [task, isConnected, address, creatorAddress, stakePercentage, actions, onClose]);

    // Derived display values — safe even when task is null
    const deadlineDays      = daysUntil(task?.deadlineAt);
    const hasAssignedMember = Boolean(task?.member && task.member !== ZERO_ADDRESS);
    const isCreator         = Boolean(address && creatorAddress && address.toLowerCase() === creatorAddress.toLowerCase());
    const headerSubtitle    = creator?.name ?? shortAddr(task?.creator) ?? task?.owner ?? "Unknown creator";
    const displayName       =
        task?.projectName ||
        (task as any)?.title ||
        (task?.smartContractId ? `Task #${task.smartContractId}` : "Task");
    const skills            = task?.skills ?? [];
    const hasValidGithub    = isValidUrl(task?.githubURL);

    return (
        <AnimatePresence>
            {task && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Slide-over */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[460px] bg-gray-950 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-800">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                                    <Code className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-gray-100 leading-tight">
                                        {displayName}
                                    </h2>
                                    <p className={`text-xs mt-0.5 truncate ${
                                        creator?.name
                                            ? "text-indigo-300 font-medium"
                                            : "text-indigo-400 font-mono"
                                    }`}>
                                        {headerSubtitle}
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

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                            {/* Status + GitHub chip */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${statusStyles(task.status)}`}>
                                    <CircleDot className="w-2.5 h-2.5" />
                                    {statusLabel(task.status)}
                                </span>
                                {hasValidGithub && (
                                    <a
                                        href={task.githubURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-700 text-[10px] text-gray-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
                                    >
                                        <GitBranch className="w-2.5 h-2.5" /> GitHub
                                    </a>
                                )}
                            </div>

                            {/* Creator profile */}
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                    Creator
                                </p>
                                <CreatorCard
                                    creator={creator}
                                    creatorAddress={creatorAddress}
                                    loading={loadingCreator}
                                />
                            </div>

                            {/* Objective */}
                            {task.objective && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                        Objective
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed">{task.objective}</p>
                                </div>
                            )}

                            {/* Description */}
                            {desc && (desc.summary || desc.header) && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                        Description
                                    </p>
                                    {desc.header && (
                                        <p className="text-xs font-semibold text-gray-300 mb-1.5">{desc.header}</p>
                                    )}
                                    {desc.summary && (
                                        <p className="text-sm text-gray-400 leading-relaxed">{desc.summary}</p>
                                    )}
                                    {(desc.points?.length ?? 0) > 0 && (
                                        <ul className="mt-3 space-y-1.5">
                                            {desc.points!.map((pt, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                                                    {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {desc.footer && (
                                        <p className="mt-2.5 text-xs text-gray-600 italic">{desc.footer}</p>
                                    )}
                                </div>
                            )}

                            {/* Commitment terms */}
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                    Commitment Terms
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            icon:  <Lock className="w-3.5 h-3.5 text-amber-400" />,
                                            label: "Creator Stake",
                                            value: ethDisplay(task.creatorStake),
                                            color: "text-amber-400",
                                        },
                                        {
                                            icon:  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
                                            label: "Reward",
                                            value: ethDisplay(task.reward),
                                            color: "text-emerald-400",
                                        },
                                        {
                                            icon:  <Clock className="w-3.5 h-3.5 text-indigo-400" />,
                                            label: "Est. Hours",
                                            value: task.deadlineHours
                                                ? `${Number(task.deadlineHours)}h`
                                                : "N/A",
                                            color: "text-gray-200",
                                        },
                                        {
                                            icon:  <Calendar className="w-3.5 h-3.5 text-red-400" />,
                                            label: "Deadline",
                                            value: deadlineLabel(task.deadlineAt),
                                            color: deadlineDays < 9999 && deadlineDays <= 3
                                                ? "text-red-400"
                                                : "text-gray-200",
                                        },
                                    ].map(item => (
                                        <div key={item.label} className="bg-gray-900 rounded-xl border border-gray-800 p-3">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                {item.icon}
                                                <span className="text-[10px] text-gray-500">{item.label}</span>
                                            </div>
                                            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
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
                                            {ethDisplay(task.memberStake)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-xs text-gray-500">Min. Reputation</span>
                                        <span className="text-xs font-semibold text-indigo-400">
                                            {task.minReputation || "Any"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-xs text-gray-500">Max Revisions</span>
                                        <span className="text-xs font-semibold text-gray-200">
                                            {task.maxRevision !== undefined && task.maxRevision !== null
                                                ? Number(task.maxRevision)
                                                : "N/A"}
                                        </span>
                                    </div>
                                    {hasAssignedMember && (
                                        <div className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-xs text-gray-500">Assigned To</span>
                                            <span className="text-xs font-semibold font-mono text-gray-200">
                                                {shortAddr(task.member)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Required skills */}
                            {skills.length > 0 && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                        Required Skills
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {skills.map(s => <SkillTag key={s} skill={s} />)}
                                    </div>
                                </div>
                            )}

                            {/* Stake status */}
                            {(task.isCreatorStakeLocked !== undefined ||
                                task.isMemberStakeLocked !== undefined) && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">
                                        Stake Status
                                    </p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {(
                                            [
                                                { label: "Creator", locked: task.isCreatorStakeLocked },
                                                { label: "Member",  locked: task.isMemberStakeLocked  },
                                            ] as const
                                        ).map(item => (
                                            <div key={item.label}
                                                 className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
                                                <span className={`w-2 h-2 rounded-full ${item.locked ? "bg-amber-400" : "bg-emerald-400"}`} />
                                                <div>
                                                    <p className="text-[10px] text-gray-500">{item.label} Stake</p>
                                                    <p className={`text-xs font-semibold ${item.locked ? "text-amber-400" : "text-emerald-400"}`}>
                                                        {item.locked ? "Locked" : "Free"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-800 space-y-2.5">
                            <motion.button
                                whileHover={{ scale: joining || isCreator ? 1 : 1.02 }}
                                whileTap={{ scale: joining || isCreator ? 1 : 0.98 }}
                                onClick={handleJoin}
                                disabled={joining || isCreator}
                                className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                    isCreator
                                        ? "bg-gray-700 cursor-not-allowed opacity-50"
                                        : "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                }`}
                            >
                                {joining ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting…
                                    </>
                                ) : isCreator ? (
                                    <>
                                        <Lock className="w-4 h-4" /> You Created This Task
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" /> Stake & Join
                                    </>
                                )}
                            </motion.button>

                            {/* Only render the GitHub link when URL is actually valid */}
                            {hasValidGithub && (
                                <a
                                    href={task.githubURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Open GitHub Details
                                </a>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

