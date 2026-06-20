"use client";

import { useParams } from "next/navigation";
import DashboardTasksPage from "@/components/dashboard/DashboardTasksPage";
import RightSidebar from "@/components/dashboard/RightSidebar";
import TopStats from "@/components/dashboard/TopStats";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import { useDashboardUserData } from "@/utils/lib/dashboard";

export default function DashboardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const {
    loadingUser: loading,
    error,
  } = useDashboardUserData(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">
          {error.message || "Failed to load dashboard."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <main className="relative max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        <GreetingHeader id={id} />
        <TopStats id={id} />

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-6">
          <DashboardTasksPage id={id} />
          <RightSidebar id={id} />
        </div>

      </main>
    </div>
  );
}