"use client";

import React, { useState,useEffect } from "react";
import { useParams } from "next/navigation";

import KanbanBoard from "@/components/dashboard/KanbanBoard";
import RightSidebar from "@/components/dashboard/RightSidebar";
import TopStats from "@/components/dashboard/TopStats";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import ReputationActivity from "@/components/dashboard/ReputationActivity";
import FinancialSummary from "@/components/dashboard/FinancialSummary";

import {
  useDashboard,
  KANBAN_TABS,
  type KanbanTab,
} from "@/utils/lib/dashboard";

export default function DashboardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const {
    user,
    walletAddress,
    balanceData,
    kanbanTasks,
    activeTasks,
    reviewTasks,
    activity,
    transactions,
    loading,
    error,
  } = useDashboard(id);

    useEffect(() => {
    console.group("=== DASHBOARD DATA ===");

    console.log("id:", id);
    console.log("user:", user);
    console.log("walletAddress:", walletAddress);
    console.log("balanceData:", balanceData);
    console.log("kanbanTasks:", kanbanTasks);
    console.log("activeTasks:", activeTasks);
    console.log("reviewTasks:", reviewTasks);
    console.log("activity:", activity);
    console.log("transactions:", transactions);
    console.log("loading:", loading);
    console.log("error:", error);

    console.groupEnd();
  }, [
    id,
    user,
    walletAddress,
    balanceData,
    kanbanTasks,
    activeTasks,
    reviewTasks,
    activity,
    transactions,
    loading,
    error,
  ]);


  const [kanbanTab, setKanbanTab] = useState<KanbanTab>("Active");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">
          {error ?? "Failed to load dashboard."}
        </p>
      </div>
    );
  }

  const deadlineTasks = [...activeTasks, ...reviewTasks].slice(0, 4);

  const liveBalance =
    balanceData != null
      ? Number(balanceData.formatted)
      : user.availableBalance;

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
        <GreetingHeader user={user} />

        <TopStats user={user} />

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-6">
          <KanbanBoard
            tabs={KANBAN_TABS}
            activeTab={kanbanTab}
            onTabChange={setKanbanTab}
            tasks={kanbanTasks}
          />

          <RightSidebar
            walletAddress={walletAddress ?? ""}
            chain="Ethereum"
            availableBalance={liveBalance}
            activeStake={user.activeStake}
            deadlines={deadlineTasks}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ReputationActivity activities={activity} />

          <FinancialSummary
            availableBalance={liveBalance}
            activeStake={user.activeStake}
            totalEarned={user.totalEarned}
            pendingRewards={user.pendingRewards}
            transactions={transactions}
          />
        </div>
      </main>
    </div>
  );
}