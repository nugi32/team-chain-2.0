import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Filter } from "lucide-react";

import SectionHeading from "./SectionHeading";
import TaskCard from "./DashboardTaskComponets/TaskCard";

import type { TabType, KanbanBoardProps } from "@/utils/lib/dashboard";

export default function KanbanBoard({
  tabs,
  activeTab,
  onTabChange,
  tasks,
  onView,
  onActivate,
  onCloseRegistration,
  onViewRequests,
  onJoinRequest,
  onSubmit,
  onApprove,
}: KanbanBoardProps) {
  const visibleTasks = tasks.filter((t) => t.tab === activeTab);

  const getTabColor = (tab: TabType) => {
    switch (tab) {
      case "Created": return "bg-slate-500/20 text-slate-400";
      case "Active": return "bg-blue-500/20 text-blue-400";
      case "OpenRegistration": return "bg-indigo-500/20 text-indigo-400";
      case "InProgres": return "bg-cyan-500/20 text-cyan-400";
      case "Review": return "bg-amber-500/20 text-amber-400";
      case "Completed": return "bg-emerald-500/20 text-emerald-400";
      case "Cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

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

      <div className="flex gap-1 mb-4 p-1 rounded-2xl bg-gray-900 border border-gray-800 w-fit flex-wrap">
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
              <span className={["ml-1.5 text-[10px] rounded-full px-1.5 py-0.5", getTabColor(tab)].join(" ")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

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
              <TaskCard
                key={task.id}
                task={task}
                onView={onView}
                onActivate={onActivate}
                onCloseRegistration={onCloseRegistration}
                onViewRequests={onViewRequests}
                onJoinRequest={onJoinRequest}
                onSubmit={onSubmit}
                onApprove={onApprove}
              />
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
              <p className="text-sm text-gray-600">No tasks in this column</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}