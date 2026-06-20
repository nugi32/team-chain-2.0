// components/dashboard/DashboardTasksPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useDashboardTasksData } from "@/utils/lib/dashboard/useDashboardTasksData";
import { mapTasksToKanbanTasks } from "@/utils/lib/dashboard/mapTasksToKanban";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { KANBAN_TABS, TabType, KanbanTask } from "@/utils/lib/dashboard";
import { useGetTaskData } from "@/utils/lib/dashboard/useGetTaskData";

export default function DashboardTasksPage({ id }: { id: string }) {
  const { tasks, walletAddress, DashboardLoading, error, loading } = useDashboardTasksData(undefined, id);
  const taskDataHook = useGetTaskData();

  const [activeTab, setActiveTab] = useState<TabType>("Active");

  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);

  console.warn(kanbanTasks)

  useEffect(() => {
    async function loadTasks() {
      const mapped = await mapTasksToKanbanTasks(tasks, taskDataHook, walletAddress);
      setKanbanTasks(mapped);
    }

    loadTasks();
  }, [tasks, walletAddress]);

  const handleActivate = (task: KanbanTask) => console.log("activate", task.contractId);
  const handleCloseRegistration = (task: KanbanTask) => console.log("close registration", task.contractId);
  const handleViewRequests = (task: KanbanTask) => console.log("view requests", task.contractId);
  const handleJoinRequest = (task: KanbanTask) => console.log("request to join", task.contractId);
  const handleSubmit = (task: KanbanTask) => console.log("submit", task.contractId);
  const handleApprove = (task: KanbanTask) => console.log("approve", task.contractId);
  const handleView = (task: KanbanTask) => console.log("view", task.contractId);

  if (DashboardLoading || loading.isLoading) {
    return <div className="text-gray-500 text-sm p-6">Loading tasks…</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm p-6">{error.message}</div>;
  }

  return (
    <KanbanBoard
      tabs={KANBAN_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tasks={kanbanTasks}
      onView={handleView}
      onActivate={handleActivate}
      onCloseRegistration={handleCloseRegistration}
      onViewRequests={handleViewRequests}
      onJoinRequest={handleJoinRequest}
      onSubmit={handleSubmit}
      onApprove={handleApprove}
    />
  );
}