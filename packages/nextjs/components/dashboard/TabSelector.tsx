import React, { useState } from "react";
import {
  ChevronDown,
  Filter,
} from "lucide-react";

import {
  ALL_TABS,
} from "@/utils/lib/dashboard";

import type {
  TabType,
  TabSelectorProps,
} from "@/utils/lib/dashboard";

export default function TabSelector({
  activeTab,
  onTabChange,
  tasks,
}: TabSelectorProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const getTabCount = (
    tab: TabType,
  ) => {
    return tasks.filter(
      (t) => t.tab === tab,
    ).length;
  };

  const getTabColor = (
    tab: TabType,
  ) => {
    switch (tab) {
      case "Created":
        return "bg-slate-500/20 text-slate-400";

      case "Active":
        return "bg-blue-500/20 text-blue-400";

      case "OpenRegistration":
        return "bg-indigo-500/20 text-indigo-400";

      case "InProgres":
        return "bg-cyan-500/20 text-cyan-400";

      case "Review":
        return "bg-amber-500/20 text-amber-400";

      case "Completed":
        return "bg-emerald-500/20 text-emerald-400";

      case "Cancelled":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex gap-1 p-1 rounded-2xl bg-gray-900 border border-gray-800 flex-wrap">
        {ALL_TABS.map((tab) => {
          const count =
            getTabCount(tab);

          return (
            <button
              key={tab}
              onClick={() =>
                onTabChange(tab)
              }
              className={[
                "relative rounded-xl px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                activeTab === tab
                  ? "bg-gray-800 text-white shadow"
                  : "text-gray-500 hover:text-gray-300",
              ].join(" ")}
            >
              {tab}

              <span
                className={[
                  "ml-1 text-[10px] rounded-full px-1.5 py-0.5",
                  getTabColor(tab),
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sm:hidden relative">
        <button
          onClick={() =>
            setIsOpen(!isOpen)
          }
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white transition-colors"
        >
          {activeTab}

          <ChevronDown
            className={[
              "w-3 h-3 transition-transform",
              isOpen
                ? "rotate-180"
                : "",
            ].join(" ")}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 right-0 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {ALL_TABS.map((tab) => {
              const count =
                getTabCount(tab);

              return (
                <button
                  key={tab}
                  onClick={() => {
                    onTabChange(tab);
                    setIsOpen(false);
                  }}
                  className={[
                    "w-full text-left px-4 py-2 text-xs font-medium transition-colors",
                    activeTab === tab
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{tab}</span>

                    <span
                      className={[
                        "text-[10px] rounded-full px-1.5 py-0.5",
                        getTabColor(tab),
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button className="text-[10px] text-gray-500 hover:text-gray-300 border border-gray-800 rounded-lg px-2 py-1.5 sm:py-1 flex items-center gap-1 transition-colors whitespace-nowrap">
        <Filter className="w-3 h-3" />
        Filter
      </button>
    </div>
  );
}