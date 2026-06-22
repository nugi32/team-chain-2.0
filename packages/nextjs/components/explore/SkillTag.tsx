"use client";

import React from "react";

// Deterministic color from skill string so each skill always gets the same color
const SKILL_COLORS = [
    "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    "bg-violet-500/10 border-violet-500/20 text-violet-400",
    "bg-sky-500/10    border-sky-500/20    text-sky-400",
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    "bg-amber-500/10  border-amber-500/20  text-amber-400",
    "bg-rose-500/10   border-rose-500/20   text-rose-400",
    "bg-cyan-500/10   border-cyan-500/20   text-cyan-400",
    "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400",
];

function colorIndex(skill: string): number {
    let h = 0;
    for (let i = 0; i < skill.length; i++) h = (h * 31 + skill.charCodeAt(i)) >>> 0;
    return h % SKILL_COLORS.length;
}

export default function SkillTag({ skill }: { skill: string }) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${SKILL_COLORS[colorIndex(skill)]}`}
        >
            {skill}
        </span>
    );
}