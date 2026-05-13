import { motion } from "framer-motion";
import type { TabKey } from "./types";

interface Tab {
  key: TabKey;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-800 mb-6 overflow-x-auto pb-px">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === t.key ? "text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {t.label}
          {t.badge != null && t.badge > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {t.badge}
            </span>
          )}
          {activeTab === t.key && (
            <motion.div layoutId="tab-indicator" className="absolute inset-x-0 -bottom-px h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}