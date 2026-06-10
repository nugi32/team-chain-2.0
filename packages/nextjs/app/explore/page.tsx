"use client";

import React, {
    useState, useRef, useEffect, useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronDown, X, Filter, ArrowUpDown,
    Layers, Sparkles, Loader2,
} from "lucide-react";

// ── adjust import paths to match your project layout ──────────────
import { Task, TaskStatus, useExplore } from "@/utils/lib/explore";
import TaskCard       from "@/components/explore/TaskCard";
import TaskOverlay    from "@/components/explore/TaskOverlay";
import FilterDropdown from "@/components/explore/FilterDropdown";
// ──────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// LOCAL TYPES
// ─────────────────────────────────────────────────────────────────
type SortKey = "newest" | "highest_reward" | "urgent";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest",         label: "Newest"         },
    { key: "highest_reward", label: "Highest Reward"  },
    { key: "urgent",         label: "Urgent"          },
];

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/** Convert bigint wei → ETH as a JS number */
const ethValue = (val?: bigint): number =>
    val !== undefined ? Number(val) / 1e18 : 0;

/** Seconds until a unix-timestamp bigint; returns 9999 if absent */
const daysUntil = (ts?: bigint): number => {
    if (!ts) return 9999;
    const diff = Number(ts) - Math.floor(Date.now() / 1000);
    return Math.max(0, Math.floor(diff / 86400));
};

function sortTasks(tasks: Task[], sort: SortKey): Task[] {
    return [...tasks].sort((a, b) => {
        if (sort === "highest_reward")
            return ethValue(b.reward) - ethValue(a.reward);
        if (sort === "urgent")
            return daysUntil(a.deadlineAt) - daysUntil(b.deadlineAt);
        // newest → sort by createdAt descending (falls back to 0 if not yet loaded)
        return Number(b.createdAt ?? 0n) - Number(a.createdAt ?? 0n);
    });
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function Explore() {
    // ✅ useExplore now correctly calls hooks at the top level internally.
    //    getTasks() returns off-chain tasks; on-chain data is fetched
    //    inside TaskOverlay for whichever task the user opens.
    const { getTasks } = useExplore();

    // ── server data ────────────────────────────────────────────
    const [tasks,   setTasks]   = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    // ── ui state ───────────────────────────────────────────────
    const [search,               setSearch]               = useState("");
    const [sort,                 setSort]                 = useState<SortKey>("newest");
    const [sortOpen,             setSortOpen]             = useState(false);
    const [skillFilter,          setSkillFilter]          = useState<string[]>([]);
    const [stakeRange,           setStakeRange]           = useState<[number, number]>([0, 200]);
    const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
    const [selectedTask,         setSelectedTask]         = useState<Task | null>(null);

    const sortRef = useRef<HTMLDivElement>(null);

    // ── fetch on mount ──────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        getTasks()
            .then(data => {
                if (cancelled) return;
                setTasks(data);
                setLoading(false);
            })
            .catch(err => {
                if (cancelled) return;
                setError(err?.message ?? "Failed to load tasks.");
                setLoading(false);
            });

        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── sort dropdown outside-click ─────────────────────────────
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node))
                setSortOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // ── derived ─────────────────────────────────────────────────

    const allSkills = useMemo(
        () => Array.from(new Set(tasks.flatMap(t => t.skills ?? []))).sort(),
        [tasks],
    );

    const maxStakeEth = useMemo(
        () =>
            tasks.length === 0
                ? 200
                : Math.max(0.001, ...tasks.map(t => ethValue(t.creatorStake))),
        [tasks],
    );

    const toggleSkill = useCallback(
        (s: string) =>
            setSkillFilter(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]),
        [],
    );

    // ── filtered + sorted list ───────────────────────────────────
    const filtered = useMemo(
        () =>
            sortTasks(
                tasks.filter(t => {
                    if (search) {
                        const q = search.toLowerCase();
                        const hit =
                            t.title.toLowerCase().includes(q) ||
                            t.description?.summary?.toLowerCase().includes(q) ||
                            t.skills?.some(s => s.toLowerCase().includes(q)) ||
                            t.owner?.toLowerCase().includes(q);
                        if (!hit) return false;
                    }

                    if (
                        skillFilter.length > 0 &&
                        !skillFilter.some(s => t.skills?.includes(s))
                    ) return false;

                    const stakeEth = ethValue(t.creatorStake);
                    if (stakeEth < stakeRange[0] || stakeEth > stakeRange[1]) return false;

                    return true;
                }),
                sort,
            ),
        [tasks, search, skillFilter, stakeRange, sort],
    );

    const { featured, regular } = useMemo(() => {
        if (filtered.length === 0) return { featured: [], regular: [] };

        const byReward    = [...filtered].sort((a, b) => ethValue(b.reward) - ethValue(a.reward));
        const featuredIds = new Set(byReward.slice(0, 2).map(t => t.id));

        return {
            featured: filtered.filter(t =>  featuredIds.has(t.id)),
            regular:  filtered.filter(t => !featuredIds.has(t.id)),
        };
    }, [filtered]);

    const isStakeFiltered   = stakeRange[0] > 0 || stakeRange[1] < maxStakeEth * 0.999;
    const activeFiltersCount = skillFilter.length + (isStakeFiltered ? 1 : 0);

    // ── manual reload ────────────────────────────────────────────
    const reload = () => {
        setLoading(true);
        setError(null);
        getTasks()
            .then(data => { setTasks(data); setLoading(false); })
            .catch(err  => { setError(err?.message ?? "Failed."); setLoading(false); });
    };

    const clearFilters = () => {
        setSkillFilter([]);
        setStakeRange([0, maxStakeEth]);
    };

    // ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">

            {/* subtle grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), " +
                        "linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 py-6">

                {/* ── PAGE HEADER ─────────────────────────────────── */}
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-widest">
                                Open Tasks
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-100">Explore Work</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Stake-backed commitments — find your next contribution.
                        </p>
                    </div>

                    <div className="text-right">
                        {loading ? (
                            <Loader2 className="w-5 h-5 text-gray-600 animate-spin ml-auto" />
                        ) : (
                            <p className="text-2xl font-bold text-gray-100 tabular-nums">
                                {filtered.length}
                            </p>
                        )}
                        <p className="text-[10px] text-gray-600">tasks available</p>
                    </div>
                </div>

                {/* ── STICKY UTILITY ROW ──────────────────────────── */}
                <div className="sticky top-14 z-20 bg-gray-950/90 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 border-b border-gray-800/60">
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search tasks, skills, creator…"
                                className="w-full h-8 pl-8 pr-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Filter:
                            </span>

                            {/* Skill filter */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setActiveFilterDropdown(p => p === "skill" ? null : "skill")
                                    }
                                    className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                                        skillFilter.length > 0
                                            ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400"
                                            : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                                    }`}
                                >
                                    Skill
                                    {skillFilter.length > 0 && (
                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                                            {skillFilter.length}
                                        </span>
                                    )}
                                    <ChevronDown className="w-3 h-3" />
                                </button>

                                {activeFilterDropdown === "skill" && (
                                    <FilterDropdown
                                        label="Skill"
                                        options={allSkills}
                                        selected={skillFilter}
                                        onToggle={toggleSkill}
                                        onClose={() => setActiveFilterDropdown(null)}
                                    />
                                )}
                            </div>

                            {/* Stake range filter */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setActiveFilterDropdown(p => p === "stake" ? null : "stake")
                                    }
                                    className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                                        isStakeFiltered
                                            ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400"
                                            : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                                    }`}
                                >
                                    Stake <ChevronDown className="w-3 h-3" />
                                </button>

                                {activeFilterDropdown === "stake" && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 p-4">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">
                                            Creator Stake (ETH)
                                        </p>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-indigo-400 font-semibold">
                                                {stakeRange[0].toFixed(4)} ETH
                                            </span>
                                            <span className="text-xs text-indigo-400 font-semibold">
                                                {stakeRange[1].toFixed(4)} ETH
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={maxStakeEth}
                                            step={Math.max(0.0001, maxStakeEth / 1000)}
                                            value={Math.min(stakeRange[0], maxStakeEth)}
                                            onChange={e => setStakeRange([+e.target.value, stakeRange[1]])}
                                            className="w-full accent-indigo-500 mb-2"
                                        />
                                        <input
                                            type="range"
                                            min={0}
                                            max={maxStakeEth}
                                            step={Math.max(0.0001, maxStakeEth / 1000)}
                                            value={Math.min(stakeRange[1], maxStakeEth)}
                                            onChange={e => setStakeRange([stakeRange[0], +e.target.value])}
                                            className="w-full accent-indigo-500"
                                        />
                                        <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                                            <span>0</span>
                                            <span>{maxStakeEth.toFixed(4)} ETH</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Clear filters */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="h-8 px-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>

                        <div className="flex-1" />

                        {/* Sort */}
                        <div className="relative" ref={sortRef}>
                            <button
                                onClick={() => setSortOpen(p => !p)}
                                className="h-8 px-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-400 flex items-center gap-1.5 hover:border-gray-700 transition-colors"
                            >
                                <ArrowUpDown className="w-3 h-3" />
                                {SORT_OPTIONS.find(s => s.key === sort)?.label}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            <AnimatePresence>
                                {sortOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 overflow-hidden"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <button
                                                key={opt.key}
                                                onClick={() => { setSort(opt.key); setSortOpen(false); }}
                                                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left ${
                                                    sort === opt.key
                                                        ? "bg-indigo-600/20 text-indigo-400"
                                                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                                                }`}
                                            >
                                                {opt.label}
                                                {sort === opt.key && (
                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ── LOADING STATE ───────────────────────────────── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        <p className="text-sm text-gray-500">Fetching tasks…</p>
                    </div>
                )}

                {/* ── ERROR STATE ─────────────────────────────────── */}
                {!loading && error && (
                    <div className="text-center py-20">
                        <p className="text-sm text-red-400 mb-3">{error}</p>
                        <button
                            onClick={reload}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* ── MAIN CONTENT ────────────────────────────────── */}
                {!loading && !error && (
                    <>
                        {featured.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                                        Featured / Highest Reward
                                    </span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {featured.map(t => (
                                            <TaskCard key={t.id} task={t} onSelect={setSelectedTask} featured />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {regular.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers className="w-3.5 h-3.5 text-gray-600" />
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        All Open Tasks
                                    </span>
                                    <div className="flex-1 h-px bg-gray-800" />
                                    <span className="text-[10px] text-gray-600">{regular.length} tasks</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {regular.map(t => (
                                            <TaskCard key={t.id} task={t} onSelect={setSelectedTask} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {filtered.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">No tasks match your filters.</p>
                                <button
                                    onClick={() => { setSearch(""); clearFilters(); }}
                                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* ── SLIDE-OVER ──────────────────────────────────── */}
            <TaskOverlay task={selectedTask} onClose={() => setSelectedTask(null)} />
        </div>
    );
}