import React from "react";
import {
  Activity, CheckCircle2, Lock, Star, AlertTriangle, XCircle,
  ChevronRight,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  milestone: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  stake: <Lock className="w-4 h-4 text-indigo-400" />,
  review: <Star className="w-4 h-4 text-amber-400" />,
  slash: <AlertTriangle className="w-4 h-4 text-red-400" />,
  dispute: <XCircle className="w-4 h-4 text-orange-400" />,
};

interface ActivityItem {
  id: number;
  type: string;
  label: string;
  sub: string;
  time: string;
  delta: string;
  positive: boolean | null;
}

export default function ReputationActivity({
  activities,
}: {
  activities: ActivityItem[];
}) {
  return (
    <div className="md:col-span-1">
      <SectionHeading
        icon={<Activity className="w-3.5 h-3.5 text-gray-400" />}
        title="Reputation Activity"
        action={
          <button className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        }
      />
      <div className="rounded-2xl border border-gray-800 bg-gray-900 divide-y divide-gray-800/70">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3.5 hover:bg-gray-800/30 transition-colors"
          >
            <div className="w-7 h-7 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              {ACTIVITY_ICONS[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-200 leading-snug">{item.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5 truncate">
                {item.sub}
              </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className={[
                  "text-[10px] font-mono font-semibold",
                  item.positive === true
                    ? "text-emerald-400"
                    : item.positive === false
                    ? "text-red-400"
                    : "text-gray-500",
                ].join(" ")}
              >
                {item.delta}
              </span>
              <span className="text-[10px] text-gray-600">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}