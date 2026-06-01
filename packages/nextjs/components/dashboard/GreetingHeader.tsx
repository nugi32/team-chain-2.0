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
  Monitor{" "}
  <span className="text-indigo-400 font-medium">active commitments</span>,{" "}
  stay aligned with{" "}
  <span className="text-amber-400 font-medium">pending reviews</span>, and
  keep momentum going.
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