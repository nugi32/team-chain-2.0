"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import KanbanBoard from "@/components/dashboard/KanbanBoard";
import RightSidebar from "@/components/dashboard/RightSidebar";
import TopStats from "@/components/dashboard/TopStats";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import { useDashboardUserData } from "@/utils/lib/dashboard";

export default function DashboardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const {
    loadingUser: loading,
    error,
  } = useDashboardUserData(id);
/*
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
*/

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
          { error.message || "Failed to load dashboard." }
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
   

          <RightSidebar id={id}/>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <FinancialSummary/>
        </div>
      </main>
    </div>
  );
}