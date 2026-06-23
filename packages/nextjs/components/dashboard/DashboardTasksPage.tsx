// components/dashboard/DashboardTasksPage.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { KANBAN_TABS, KanbanTask, TabType } from "@/utils/lib/dashboard";
import { mapTasksToKanbanTasks } from "@/utils/lib/dashboard/mapTasksToKanban";
import { useDashboardTasksData } from "@/utils/lib/dashboard/useDashboardTasksData";
import { useGetTaskData } from "@/utils/lib/dashboard/useGetTaskData";

// components/dashboard/DashboardTasksPage.tsx

// components/dashboard/DashboardTasksPage.tsx

export default function DashboardTasksPage({ id }: { id: string }) {
  const { tasks, walletAddress, DashboardLoading, error, loading } = useDashboardTasksData(undefined, id);
  const taskDataHook = useGetTaskData();

  const [activeTab, setActiveTab] = useState<TabType>("Active");
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [isLoadingKanban, setIsLoadingKanban] = useState(false);

  useEffect(() => {
    // Skip loading if tasks are empty or still loading
    if (!tasks || tasks.length === 0) {
      setKanbanTasks([]);
      return;
    }

    async function loadTasks() {
      try {
        setIsLoadingKanban(true);
        console.debug("[Dashboard] Starting to map tasks to kanban format", {
          taskCount: tasks.length,
          walletAddress,
        });

        const mapped = await mapTasksToKanbanTasks(tasks, taskDataHook, walletAddress);

        console.warn("[Dashboard] Successfully mapped tasks to kanban", {
          mappedCount: mapped,
        });
        setKanbanTasks(mapped);
      } catch (err) {
        console.error("[Dashboard] Error mapping tasks to kanban:", err);
        setKanbanTasks([]);
      } finally {
        setIsLoadingKanban(false);
      }
    }

    loadTasks();
    // Only depend on tasks and walletAddress - taskDataHook shouldn't be a direct dependency
    // because it changes too frequently due to form.setId calls during mapping.
    // The hook instance is stable, but its internal state changes during task mapping.
  }, [tasks, walletAddress]);

  const handleActivate = useCallback((task: KanbanTask) => console.log("activate", task.contractId), []);
  const handleCloseRegistration = useCallback(
    (task: KanbanTask) => console.log("close registration", task.contractId),
    [],
  );
  const handleViewRequests = useCallback((task: KanbanTask) => console.log("view requests", task.contractId), []);
  const handleJoinRequest = useCallback((task: KanbanTask) => console.log("request to join", task.contractId), []);
  const handleSubmit = useCallback((task: KanbanTask) => console.log("submit", task.contractId), []);
  const handleApprove = useCallback((task: KanbanTask) => console.log("approve", task.contractId), []);
  const handleView = useCallback((task: KanbanTask) => console.log("view", task.contractId), []);

  if (DashboardLoading || loading.isLoading || isLoadingKanban) {
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
