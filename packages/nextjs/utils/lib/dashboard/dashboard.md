import { useCallback, useEffect, useMemo, useState } from "react";
import { useBalance } from "wagmi";
import { getUserById } from "@/utils/lib/express/queries/users";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import {
  type TabType,
  type KanbanTab,
  type KanbanTask,
  type MergedTask,
  mapToKanban,
} from "./kanban";
import {
  type DashboardUser,
  type ActivityEntry,
  type Transaction,
  mapDashboardUser,
  deriveActivity,
  deriveTransactions,
} from "./dashboardUser";
import { fetchAllTasks } from "./dashboardTask";
import { TaskStatus, SubmitStatus } from "./enums";

// ── Unified hook ──────────────────────────────────────────────────────────────

export function useDashboard(id: string) {
  // New blockchain hooks that return data from smart contracts
  const usersData = useUsersContract(id);

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [rawTasks, setRawTasks] = useState<MergedTask[]>([]);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(
    id as `0x${string}`,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: balanceData } = useBalance({ address: walletAddress });

  // Load tasks and build dashboard data
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the on-chain data from the hook
      const onChainData = usersData.user;

      // Fetch off-chain data
      const offChainData = await getUserById(id);

      if (!offChainData) {
        throw new Error("Failed to fetch user data");
      }

      // Map dashboard user with blockchain data
      setWalletAddress(id as `0x${string}`);
      setUser(mapDashboardUser(id, onChainData, offChainData));

      // Fetch API tasks
      const apiTasks = await fetchAllTasks();
      const mergedTasks = apiTasks.map((task) => {
        const taskId =
          task.id ||
          task._id ||
          `task-${Math.random().toString(36).substr(2, 9)}`;
        return {
          ...task,
          id: taskId as string,
          onchain: { exists: false },
          submit: null,
        };
      });
      setRawTasks(mergedTasks);
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id, usersData.user]);

  // Load on mount and when id changes
  useEffect(() => {
    load();
  }, [id]);

  // ── Derived data ────────────────────────────────────────────────────────

  const kanbanTasks = useMemo(
    () =>
      rawTasks.map((t) =>
        mapToKanban(t, walletAddress ?? "", TaskStatus, SubmitStatus),
      ),
    [rawTasks, walletAddress],
  );

  const activeTasks = useMemo(
    () => kanbanTasks.filter((t) => t.tab === "Active"),
    [kanbanTasks],
  );

  const reviewTasks = useMemo(
    () => kanbanTasks.filter((t) => t.tab === "Review"),
    [kanbanTasks],
  );

  const completedTasks = useMemo(
    () => kanbanTasks.filter((t) => t.tab === "Completed"),
    [kanbanTasks],
  );

  const disputedTasks = useMemo(
    () => kanbanTasks.filter((t) => t.tab === "Cancelled"),
    [kanbanTasks],
  );

  const activity = useMemo(
    () => deriveActivity(rawTasks, TaskStatus, SubmitStatus),
    [rawTasks],
  );
  const transactions = useMemo(
    () => deriveTransactions(rawTasks, TaskStatus),
    [rawTasks],
  );

  return {
    user,
    walletAddress,
    balanceData,
    kanbanTasks,
    activeTasks,
    reviewTasks,
    completedTasks,
    disputedTasks,
    activity,
    transactions,
    loading,
    error,
    refetch: load,
  };
}
