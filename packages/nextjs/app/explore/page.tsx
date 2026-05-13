"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronDown, X, Filter, ArrowUpDown,
  Layers, Sparkles, SlidersHorizontal, Star,
} from "lucide-react";

import { Task, SortKey } from "@/components/explore/types";
import TaskCard from "@/components/explore/TaskCard";
import TaskOverlay from "@/components/explore/TaskOverlay";
import FilterDropdown from "@/components/explore/FilterDropdown";

// ─────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────
const TASKS: Task[] = [
  {
    id: "t1", title: "Frontend Milestone for DAO Portal",
    project: "GovChain DAO", teamAvatar: "GC",
    objective: "Build wallet connection and multi-sig transaction UI.",
    stake: 40, reward: 120, effort: "~40h", deadline: "5 days", deadlineDays: 5,
    requiredRep: 72, role: "Frontend Dev", skills: ["React", "Ethers.js", "Tailwind"],
    applicants: 3, slots: 1, teamRep: 91, teamCompletions: 47,
    badges: ["Verified Team", "Fast Review"], status: "open",
    category: "Frontend", featured: true,
    description: "We need an experienced frontend developer to implement the wallet connect flow and multi-sig transaction dashboard for the GovChain DAO portal. This includes integrating RainbowKit, displaying transaction queues, and handling signature states across multiple signers.",
  },
  {
    id: "t2", title: "ZK Proof Verifier Smart Contract",
    project: "ZeroLayer Protocol", teamAvatar: "ZL",
    objective: "Write and audit on-chain ZK proof verification logic.",
    stake: 120, reward: 380, effort: "~80h", deadline: "12 days", deadlineDays: 12,
    requiredRep: 88, role: "Smart Contract Dev", skills: ["Solidity", "ZK-SNARKs", "Foundry"],
    applicants: 1, slots: 1, teamRep: 97, teamCompletions: 23,
    badges: ["High Stake", "Verified Team"], status: "open",
    category: "Smart Contracts", featured: true,
    description: "ZeroLayer is building a privacy-first layer-2 rollup and needs a Solidity engineer to implement the on-chain verifier contract for Groth16 proofs. You'll work directly with our cryptography team and review the verification gas costs.",
  },
  {
    id: "t3", title: "Subgraph Indexer for NFT Marketplace",
    project: "Pixelform Market", teamAvatar: "PM",
    objective: "Index trades, bids, and royalty events via The Graph.",
    stake: 20, reward: 60, effort: "~20h", deadline: "3 days", deadlineDays: 3,
    requiredRep: 45, role: "Indexer / Backend", skills: ["GraphQL", "AssemblyScript", "IPFS"],
    applicants: 6, slots: 2, teamRep: 74, teamCompletions: 12,
    badges: ["Low Risk", "Urgent"], status: "open",
    category: "Backend",
    description: "Pixelform needs a subgraph developer to build indexing schemas for NFT trades, bid events, and ERC-2981 royalty splits. The existing subgraph needs to be refactored for efficiency and extended with new event handlers.",
  },
  {
    id: "t4", title: "Cross-Chain Bridge UI Audit",
    project: "BridgeNet Labs", teamAvatar: "BN",
    objective: "Audit UX flow and write a security risk report for the bridge.",
    stake: 60, reward: 200, effort: "~60h", deadline: "8 days", deadlineDays: 8,
    requiredRep: 80, role: "Security Reviewer", skills: ["Auditing", "Figma", "Web3 UX"],
    applicants: 2, slots: 1, teamRep: 85, teamCompletions: 31,
    badges: ["Fast Review", "High Stake"], status: "open",
    category: "Security",
    description: "BridgeNet Labs is preparing a public mainnet launch and needs an experienced auditor to review the bridge UI for security anti-patterns, misleading UX flows, phishing risk, and transaction clarity issues.",
  },
  {
    id: "t5", title: "Token Vesting Dashboard",
    project: "VestDAO", teamAvatar: "VD",
    objective: "Build interactive vesting schedule and cliff visualizer.",
    stake: 15, reward: 45, effort: "~18h", deadline: "7 days", deadlineDays: 7,
    requiredRep: 30, role: "Frontend Dev", skills: ["React", "Recharts", "Wagmi"],
    applicants: 9, slots: 3, teamRep: 62, teamCompletions: 7,
    badges: ["New Team", "Low Risk"], status: "open",
    category: "Frontend",
    description: "VestDAO is launching their token and needs a clean vesting dashboard where token holders can view their cliff dates, unlock schedules, and claim amounts. Responsive design required.",
  },
  {
    id: "t6", title: "MEV Bot Detection Module",
    project: "MemPool Watch", teamAvatar: "MW",
    objective: "Build real-time sandwich attack detection for the mempool monitor.",
    stake: 90, reward: 270, effort: "~70h", deadline: "14 days", deadlineDays: 14,
    requiredRep: 85, role: "Backend / Blockchain Dev", skills: ["Rust", "Go", "Ethereum RPC"],
    applicants: 0, slots: 1, teamRep: 93, teamCompletions: 19,
    badges: ["Verified Team", "High Stake"], status: "open",
    category: "Backend",
    description: "MemPool Watch is extending its monitoring suite with a real-time MEV detection engine. You'll build heuristics for sandwich attack identification using mempool data streams and integrate them into an alerting pipeline.",
  },
  {
    id: "t7", title: "Governance Proposal UI",
    project: "GovChain DAO", teamAvatar: "GC",
    objective: "Create proposal creation, voting, and result display screens.",
    stake: 35, reward: 100, effort: "~30h", deadline: "6 days", deadlineDays: 6,
    requiredRep: 55, role: "Frontend Dev", skills: ["Next.js", "Ethers.js", "Radix UI"],
    applicants: 4, slots: 1, teamRep: 91, teamCompletions: 47,
    badges: ["Verified Team", "Fast Review"], status: "open",
    category: "Frontend",
    description: "Second milestone for GovChain DAO — implement the governance proposal flow including rich text editor for proposals, on-chain voting with delegation support, quorum tracking, and result visualization.",
  },
  {
    id: "t8", title: "Smart Contract Gas Optimizer",
    project: "OptimizeDAO", teamAvatar: "OD",
    objective: "Reduce gas costs on staking contract by at least 20%.",
    stake: 50, reward: 150, effort: "~45h", deadline: "10 days", deadlineDays: 10,
    requiredRep: 75, role: "Smart Contract Dev", skills: ["Solidity", "Hardhat", "Gas Profiling"],
    applicants: 2, slots: 1, teamRep: 78, teamCompletions: 15,
    badges: ["Low Risk", "Fast Review"], status: "open",
    category: "Smart Contracts",
    description: "OptimizeDAO's staking contract is functional but expensive. We need a Solidity specialist to profile gas usage, apply packing strategies, remove redundant storage reads, and document all optimizations with before/after benchmarks.",
  },
];

const SKILL_OPTIONS = ["React", "Solidity", "Rust", "Go", "GraphQL", "TypeScript", "Figma", "ZK-SNARKs", "Ethers.js", "Next.js"];
const CATEGORY_OPTIONS = ["Frontend", "Smart Contracts", "Backend", "Security", "Design"];
const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: "newest", label: "Newest", icon: <Star className="w-3.5 h-3.5" /> },  // using Star as placeholder
  { key: "highest_reward", label: "Highest Reward", icon: <Star className="w-3.5 h-3.5" /> },
  { key: "urgent", label: "Urgent", icon: <Star className="w-3.5 h-3.5" /> },
  { key: "low_rep", label: "Low Rep Barrier", icon: <Star className="w-3.5 h-3.5" /> },
];

// sorting function
function sortTasks(tasks: Task[], sort: SortKey): Task[] {
  return [...tasks].sort((a, b) => {
    if (sort === "highest_reward") return b.reward - a.reward;
    if (sort === "urgent") return a.deadlineDays - b.deadlineDays;
    if (sort === "low_rep") return a.requiredRep - b.requiredRep;
    return 0;
  });
}

export default function Explore() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [stakeRange, setStakeRange] = useState<[number, number]>([0, 200]);
  const [repMax, setRepMax] = useState(100);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleSkill = useCallback((s: string) =>
    setSkillFilter(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]), []);
  const toggleCat = useCallback((c: string) =>
    setCatFilter(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]), []);

  const filtered = sortTasks(
    TASKS.filter(t => {
      const q = search.toLowerCase();
      if (q && !t.title.toLowerCase().includes(q) && !t.project.toLowerCase().includes(q) && !t.skills.some(s => s.toLowerCase().includes(q))) return false;
      if (skillFilter.length > 0 && !skillFilter.some(s => t.skills.includes(s))) return false;
      if (catFilter.length > 0 && !catFilter.includes(t.category)) return false;
      if (t.stake < stakeRange[0] || t.stake > stakeRange[1]) return false;
      if (t.requiredRep > repMax) return false;
      return true;
    }),
    sort
  );

  const featured = filtered.filter(t => t.featured);
  const regular = filtered.filter(t => !t.featured);
  const activeFiltersCount = skillFilter.length + catFilter.length + (stakeRange[0] > 0 || stakeRange[1] < 200 ? 1 : 0) + (repMax < 100 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* subtle grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        backgroundSize: "48px 48px"
      }} />

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 py-6">

        {/* ── PAGE HEADER ── */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-widest">Open Tasks</span>
            </div>
            <h1 className="text-xl font-bold text-gray-100">Explore Work</h1>
            <p className="text-xs text-gray-500 mt-0.5">Stake-backed commitments — find your next contribution.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-100 tabular-nums">{filtered.length}</p>
            <p className="text-[10px] text-gray-600">tasks available</p>
          </div>
        </div>

        {/* ── UTILITY ROW ── */}
        <div className="sticky top-14 z-20 bg-gray-950/90 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 border-b border-gray-800/60">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks, projects, skills…"
                className="w-full h-8 pl-8 pr-3 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
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
                  onClick={() => setActiveFilterDropdown(p => p === "skill" ? null : "skill")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${skillFilter.length > 0 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Skill {skillFilter.length > 0 && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">{skillFilter.length}</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "skill" && (
                  <FilterDropdown label="Skill" options={SKILL_OPTIONS} selected={skillFilter} onToggle={toggleSkill} onClose={() => setActiveFilterDropdown(null)} />
                )}
              </div>

              {/* Category filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "cat" ? null : "cat")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${catFilter.length > 0 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Category {catFilter.length > 0 && <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">{catFilter.length}</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "cat" && (
                  <FilterDropdown label="Category" options={CATEGORY_OPTIONS} selected={catFilter} onToggle={toggleCat} onClose={() => setActiveFilterDropdown(null)} />
                )}
              </div>

              {/* Stake range */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "stake" ? null : "stake")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${stakeRange[0] > 0 || stakeRange[1] < 200 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Stake <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "stake" && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Stake Range (ETH)</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-indigo-400 font-semibold">{stakeRange[0]} ETH</span>
                      <span className="text-xs text-indigo-400 font-semibold">{stakeRange[1]} ETH</span>
                    </div>
                    <input type="range" min={0} max={200} value={stakeRange[0]} onChange={e => setStakeRange([+e.target.value, stakeRange[1]])} className="w-full accent-indigo-500 mb-2" />
                    <input type="range" min={0} max={200} value={stakeRange[1]} onChange={e => setStakeRange([stakeRange[0], +e.target.value])} className="w-full accent-indigo-500" />
                  </div>
                )}
              </div>

              {/* Rep requirement */}
              <div className="relative">
                <button
                  onClick={() => setActiveFilterDropdown(p => p === "rep" ? null : "rep")}
                  className={`h-8 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${repMax < 100 ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                >
                  Rep req. <ChevronDown className="w-3 h-3" />
                </button>
                {activeFilterDropdown === "rep" && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Max Rep Required</p>
                    <p className="text-lg font-bold text-indigo-400 mb-2">{repMax}</p>
                    <input type="range" min={0} max={100} value={repMax} onChange={e => setRepMax(+e.target.value)} className="w-full accent-indigo-500" />
                    <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                      <span>0</span><span>100</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSkillFilter([]); setCatFilter([]); setStakeRange([0, 200]); setRepMax(100); }}
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
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-30 overflow-hidden"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setSort(opt.key); setSortOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left ${sort === opt.key ? "bg-indigo-600/20 text-indigo-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}
                      >
                        {opt.icon} {opt.label}
                        {sort === opt.key && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── FEATURED ROW ── */}
        {featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Featured / Recommended</span>
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

        {/* ── ALL TASKS ── */}
        {regular.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">All Open Tasks</span>
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

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No tasks match your filters.</p>
            <button
              onClick={() => { setSearch(""); setSkillFilter([]); setCatFilter([]); setStakeRange([0, 200]); setRepMax(100); }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      {/* ── SLIDE-OVER ── */}
      <TaskOverlay task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}