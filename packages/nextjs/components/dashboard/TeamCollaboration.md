import React from "react";
import {
Users, Shield, Star, Flame,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Collaborator {
name: string;
handle: string;
initials: string;
trust: number;
projects: number;
color: string;
}

export default function TeamCollaboration({
collaborators,
}: {
collaborators: Collaborator[];
}) {
return (

<div className="md:col-span-1">
<SectionHeading
icon={<Users className="w-3.5 h-3.5 text-gray-400" />}
title="Team & Collaboration"
/>

      {/* Frequent collaborators */}
      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
        Frequent Collaborators
      </p>
      <div className="space-y-2 mb-4">
        {collaborators.map((c) => (
          <div
            key={c.handle}
            className="rounded-xl border border-gray-800 bg-gray-900 p-3 flex items-center justify-between hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold",
                  c.color,
                ].join(" ")}
              >
                {c.initials}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-200">{c.name}</p>
                <p className="text-[10px] text-gray-600">
                  {c.projects} shared projects
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] rounded-full border px-2 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                <Shield className="w-2.5 h-2.5" />
                {c.trust}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent endorsements */}
      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
        Recent Endorsements
      </p>
      <div className="space-y-2 mb-4">
        {[
          { from: "devmike", skill: "Smart Contract Security", stars: 5 },
          { from: "sarakdev", skill: "API Architecture", stars: 4 },
        ].map((e, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-800 bg-gray-900 p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-300 font-medium">{e.skill}</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={[
                      "w-3 h-3",
                      si < e.stars
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-700",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-600">from @{e.from}</p>
          </div>
        ))}
      </div>

      {/* Open projects */}
      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2 px-1">
        Projects Seeking Contributors
      </p>
      <div className="space-y-2">
        {[
          { name: "ZK Rollup SDK", role: "Developer", stake: "0.8 ETH", hot: true },
          { name: "Social Graph Protocol", role: "Designer", stake: "0.4 ETH", hot: false },
        ].map((p, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-800 bg-gray-900 p-3 flex items-center justify-between hover:border-gray-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-medium text-gray-200">{p.name}</p>
                {p.hot && (
                  <div className="flex items-center gap-0.5 text-[9px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-1.5 py-0.5">
                    <Flame className="w-2.5 h-2.5" /> Hot
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-600">
                {p.role} · Stake {p.stake}
              </p>
            </div>
            <button className="text-[10px] text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap">
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>

);
}
