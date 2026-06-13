import SectionLabel from "./SectionLabel";
import BadgeChip from "./BadgeChip";
import { Trophy, CircleDot, Users } from "lucide-react";

interface TeamSectionProps {
  teamAvatar: string;
  teamName: string;
  teamRep: number;
  teamCompletions: number;
  teamMembers: number;
}

export default function TeamSection({
  teamAvatar,
  teamName,
  teamRep,
  teamCompletions,
  teamMembers,
}: TeamSectionProps) {
  return (
    <div>
      <SectionLabel>About the Team</SectionLabel>
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{teamAvatar}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-gray-100">{teamName}</h3>
              <BadgeChip badge="Verified Team" />
            </div>
            <p className="text-xs text-gray-500 mb-3">
              On-chain governance infrastructure and DAO tooling on Ethereum.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-200">{teamRep}</span> reputation
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-200">{teamCompletions}</span> completions
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-200">{teamMembers}</span> members
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}