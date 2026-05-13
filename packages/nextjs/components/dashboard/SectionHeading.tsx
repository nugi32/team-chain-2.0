import React from "react";

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export default function SectionHeading({
  icon,
  title,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
      </div>
      {action}
    </div>
  );
}