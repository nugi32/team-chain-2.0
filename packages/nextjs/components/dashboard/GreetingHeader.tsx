import React from "react";
import { Plus } from "lucide-react";

interface User {
  name: string;
}

export default function GreetingHeader({ user }: { user: User }) {
  return (
    <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          You have{" "}
          <span className="text-red-400 font-medium">1 overdue task</span>{" "}
          and{" "}
          <span className="text-amber-400 font-medium">2 pending reviews</span>.
        </p>
      </div>
      <button
        onClick={() => {
          window.location.href = "/taskCreation";
        }}
        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" /> New Commitment
      </button>
    </div>
  );
}