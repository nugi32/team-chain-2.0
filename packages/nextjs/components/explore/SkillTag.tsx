import React from "react";

export default function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700/60 text-[10px] text-gray-400 font-mono">
      {skill}
    </span>
  );
}