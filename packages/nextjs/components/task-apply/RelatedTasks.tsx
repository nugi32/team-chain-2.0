import { motion } from "framer-motion";
import { GitBranch, ChevronRight } from "lucide-react";

interface RelatedTask {
  id: string;
  title: string;
  project: string;
  stake: string;
  reward: string;
  deadline: string;
  skills: string[];
  teamAvatar: string;
  avatarColor: string;
}

export default function RelatedTasks({ tasks }: { tasks: RelatedTask[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Similar Tasks</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tasks.map((r) => (
          <motion.div
            key={r.id}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-4 cursor-pointer hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${r.avatarColor} flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white`}
              >
                {r.teamAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-200 truncate">{r.title}</h4>
                <p className="text-[11px] text-indigo-400">{r.project}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
              <span className="text-amber-400 font-semibold">{r.stake} ETH stake</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">{r.reward} ETH reward</span>
              <span>·</span>
              <span>{r.deadline}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {r.skills.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700/50 text-[9px] font-mono text-gray-500"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}