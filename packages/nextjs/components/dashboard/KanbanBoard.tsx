/*
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Filter } from "lucide-react";

import SectionHeading from "./SectionHeading";
import TaskCard from "./TaskCard";

interface Task {
  id: string;
  tab: string;
  project: string;
  role: string;
  stake: number;
  stakeUSD: number;
  deadline: string;
  milestone: string;
  risk: string;
  progress: number;
  tags?: string[];
}

interface KanbanBoardProps {
  tabs: readonly string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  tasks: Task[];
}

export default function KanbanBoard({
  tabs,
  activeTab,
  onTabChange,
  tasks,
}: KanbanBoardProps) {
  const visibleTasks = tasks.filter((t) => t.tab === activeTab);

  return (
    <div>
      <SectionHeading
        icon={<Layers className="w-3.5 h-3.5 text-gray-400" />}
        title="Active Commitments"
        action={
          <button className="text-[10px] text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-1 transition-colors">
            <Filter className="w-3 h-3" /> Filter
          </button>
        }
      />

      {/* Kanban tabs *}
      <div className="flex gap-1 mb-4 p-1 rounded-2xl bg-gray-900 border border-gray-800 w-fit">
        {tabs.map((tab) => {
          const count = tasks.filter((t) => t.tab === tab).length;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={[
                "relative rounded-xl px-4 py-1.5 text-xs font-medium transition-all",
                activeTab === tab
                  ? "bg-gray-800 text-white shadow"
                  : "text-gray-500 hover:text-gray-300",
              ].join(" ")}
            >
              {tab}
              <span
                className={[
                  "ml-1.5 text-[10px] rounded-full px-1.5 py-0.5",
                  tab === "Disputed"
                    ? "bg-red-500/20 text-red-400"
                    : tab === "Review"
                    ? "bg-amber-500/20 text-amber-400"
                    : tab === "Completed"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-indigo-500/20 text-indigo-400",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards grid *}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="grid sm:grid-cols-2 gap-3"
        >
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
              <p className="text-sm text-gray-600">No tasks in this column</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}*/

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Filter } from "lucide-react";

import SectionHeading from "./SectionHeading";
import TaskCard from "./TaskCard";

/**
 * Shared tab type
 */
export type TabType =
  | "Active"
  | "Review"
  | "Completed"
  | "Disputed";

interface Task {
  id: string;
  tab: TabType;
  project: string;
  role: string;
  stake: number;
  stakeUSD: number;
  deadline: string;
  milestone: string;
  risk: string;
  progress: number;
  tags?: string[];
}

interface KanbanBoardProps {
  tabs: readonly TabType[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tasks: Task[];
}

export default function KanbanBoard({
  tabs,
  activeTab,
  onTabChange,
  tasks,
}: KanbanBoardProps) {
  const visibleTasks = tasks.filter((t) => t.tab === activeTab);

  return (
    <div>
      <SectionHeading
        icon={<Layers className="w-3.5 h-3.5 text-gray-400" />}
        title="Active Commitments"
        action={
          <button className="text-[10px] text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-1 transition-colors">
            <Filter className="w-3 h-3" />
            Filter
          </button>
        }
      />

      {/* Kanban tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-2xl bg-gray-900 border border-gray-800 w-fit">
        {tabs.map((tab) => {
          const count = tasks.filter((t) => t.tab === tab).length;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={[
                "relative rounded-xl px-4 py-1.5 text-xs font-medium transition-all",
                activeTab === tab
                  ? "bg-gray-800 text-white shadow"
                  : "text-gray-500 hover:text-gray-300",
              ].join(" ")}
            >
              {tab}

              <span
                className={[
                  "ml-1.5 text-[10px] rounded-full px-1.5 py-0.5",
                  tab === "Disputed"
                    ? "bg-red-500/20 text-red-400"
                    : tab === "Review"
                    ? "bg-amber-500/20 text-amber-400"
                    : tab === "Completed"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-indigo-500/20 text-indigo-400",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="grid sm:grid-cols-2 gap-3"
        >
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
              <p className="text-sm text-gray-600">
                No tasks in this column
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}