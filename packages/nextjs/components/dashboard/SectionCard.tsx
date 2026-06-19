import React from "react";
import { ChevronRight, Plus, Filter, TrendingUp, Eye } from "lucide-react";

export interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
}

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  actions?: CardAction[];
  children?: React.ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  icon,
  actions = [],
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm ${className}`}>
      {/* Header with title and action buttons */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => {
            const baseClass =
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1";
            const variantClass = {
              primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
              secondary: "bg-gray-800 hover:bg-gray-700 text-gray-300",
              ghost:
                "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-gray-700",
            }[action.variant || "secondary"];

            return action.href ? (
              <a
                key={idx}
                href={action.href}
                className={`${baseClass} ${variantClass}`}
              >
                {action.icon || <ChevronRight className="w-3 h-3" />}
                {action.label}
              </a>
            ) : (
              <button
                key={idx}
                onClick={action.onClick}
                className={`${baseClass} ${variantClass}`}
              >
                {action.icon || <ChevronRight className="w-3 h-3" />}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

export function getSectionActions(section: string) {
  const actionMap: Record<string, CardAction[]> = {
    kanban: [
      {
        label: "Create",
        icon: <Plus className="w-3 h-3" />,
        variant: "primary",
        href: "/taskCreation",
      },
      {
        label: "Filter",
        icon: <Filter className="w-3 h-3" />,
        variant: "secondary",
      },
    ],
    activity: [
      {
        label: "View All",
        icon: <Eye className="w-3 h-3" />,
        variant: "secondary",
      },
      {
        label: "Trending",
        icon: <TrendingUp className="w-3 h-3" />,
        variant: "ghost",
      },
    ],
    financial: [
      {
        label: "Details",
        icon: <ChevronRight className="w-3 h-3" />,
        variant: "secondary",
      },
      {
        label: "Export",
        icon: <Filter className="w-3 h-3" />,
        variant: "ghost",
      },
    ],
    reputation: [
      {
        label: "History",
        icon: <Eye className="w-3 h-3" />,
        variant: "secondary",
      },
    ],
    deadlines: [
      {
        label: "Calendar",
        icon: <ChevronRight className="w-3 h-3" />,
        variant: "secondary",
      },
    ],
  };

  return actionMap[section] || [];
}
