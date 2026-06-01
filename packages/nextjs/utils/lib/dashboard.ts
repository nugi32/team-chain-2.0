import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useBalance } from "wagmi";
import axios from "axios";
import { getUserById } from "@/utils/lib/express/queries/users";
import { useUsersContractService } from "@/utils/lib/smartContractWrapper/user/User";
import { useTaskContractService } from "@/utils/lib/smartContractWrapper/user/taskData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum TaskStatus {
  NonExistent = 0,
  Created = 1,
  Active = 2,
  OpenRegistration = 3,
  InProgres = 4,
  Completed = 5,
  Cancelled = 6,
}

export enum SubmitStatus {
  NoneStatus = 0,
  Pending = 1,
  RevisionNeeded = 2,
  Accepted = 3,
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const KANBAN_TABS = [
  "Active",
  "Review",
  "Completed",
  "Disputed",
] as const;

const ETH_PRICE_USD = 3_300;

// ── Types ─────────────────────────────────────────────────────────────────────

export type KanbanTab = (typeof KANBAN_TABS)[number];
export type RiskLevel = "on-track" | "at-risk" | "overdue";

export type DashboardUser = {
  name: string;
  avatar: string | null;
  initials: string;
  wallet: string;
  github: string;
  rank: number;
  reputationScore: number;
  reputationDelta: number;
  successRate: number;
  activeStake: number;
  stakeUSD: number;
  availableBalance: number;
  totalEarned: number;
  pendingRewards: number;
  totalTasksCreated: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  isRegistered: boolean;
};

type TaskApiData = {
  _id?: string;
  id: string;
  title: string;
  picture: string;
  owner: string;
  description: {
    header: string;
    summary: string;
    points: string[];
    footer: string;
  };
};

type MergedTask = TaskApiData & {
  onchain: any;
  submit?: any;
};

export type KanbanTask = {
  id: string;
  tab: KanbanTab;
  project: string;
  role: string;
  stake: number;
  stakeUSD: number;
  deadline: string;
  milestone: string;
  risk: RiskLevel;
  progress: number;
  tags: string[];
};

export type ActivityEntry = {
  id: number;
  type: "milestone" | "stake" | "review" | "slash" | "dispute";
  label: string;
  sub: string;
  time: string;
  delta: string;
  positive: boolean | null;
};

export type Transaction = {
  id: number;
  label: string;
  amount: string;
  usd: string;
  time: string;
  out: boolean;
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function calcSuccessRate(completed: number, created: number): number {
  if (!created) return 0;
  return Number(((completed / created) * 100).toFixed(1));
}

function calcReputationDelta(
  reputation: number,
  completed: number,
  failed: number,
): number {
  return completed * 10 - failed * 5 + reputation;
}

function calcRank(reputation: number): number {
  if (reputation >= 1000) return 1;
  if (reputation >= 500) return 25;
  if (reputation >= 250) return 100;
  return 999;
}

function calcPendingRewards(completed: number): number {
  return Number((completed * 0.15).toFixed(2));
}

function toUSD(eth: number): number {
  return Number((eth * ETH_PRICE_USD).toFixed(2));
}

function formatUnixDate(unixTs: number | string): string {
  const ts = Number(unixTs);
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calcRisk(deadlineAt: number | string): RiskLevel {
  const ts = Number(deadlineAt);
  if (!ts) return "on-track";
  const nowSec = Date.now() / 1000;
  if (ts < nowSec) return "overdue";
  if (ts - nowSec < 172_800) return "at-risk";
  return "on-track";
}

function calcProgress(status: number, submitStatus?: number): number {
  if (status === TaskStatus.Completed) return 100;
  if (submitStatus === SubmitStatus.Accepted) return 90;
  if (submitStatus === SubmitStatus.Pending) return 80;
  if (submitStatus === SubmitStatus.RevisionNeeded) return 70;
  if (status === TaskStatus.InProgres) return 60;
  if (status === TaskStatus.Active) return 40;
  if (status === TaskStatus.OpenRegistration) return 20;
  if (status === TaskStatus.Created) return 10;
  return 0;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function resolveTab(task: MergedTask): KanbanTab {
  const status = Number(task.onchain?.status ?? 0);
  const submitStatus = Number(task.submit?.status ?? 0);
  const deadlineAt = Number(task.onchain?.deadlineAt ?? 0);
  const nowSec = Date.now() / 1000;

  if (status === TaskStatus.Completed) return "Completed";

  if (
    submitStatus === SubmitStatus.Pending ||
    submitStatus === SubmitStatus.RevisionNeeded
  )
    return "Review";

  if (
    !task.onchain?.isRewardClaimed &&
    deadlineAt > 0 &&
    deadlineAt < nowSec
  )
    return "Disputed";

  return "Active";
}

function mapToKanban(task: MergedTask, walletAddress: string): KanbanTask {
  const status = Number(task.onchain?.status ?? 0);
  const submitStatus = task.submit?.status;
  const deadlineAt = task.onchain?.deadlineAt;
  const reward = Number(task.onchain?.reward ?? 0);
  const isCreator =
    (task.onchain?.creator ?? "").toLowerCase() ===
    walletAddress.toLowerCase();

  const taskId =
    task.id || task._id || `task-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: String(taskId),
    tab: resolveTab(task),
    project: task.title,
    role: isCreator ? "Task Creator" : "Member",
    stake: reward,
    stakeUSD: toUSD(reward),
    deadline: formatUnixDate(deadlineAt),
    milestone: task.description?.header || task.description?.summary || "",
    risk: calcRisk(deadlineAt),
    progress: calcProgress(status, submitStatus),
    tags: [],
  };
}

function mapDashboardUser(
  wallet: string,
  onChainData: any,
  offChainData: any,
): DashboardUser {
  const totalTasksCreated = Number(onChainData.totalTasksCreated ?? 0);
  const totalTasksCompleted = Number(onChainData.totalTasksCompleted ?? 0);
  const totalTasksFailed = Number(onChainData.totalTasksFailed ?? 0);
  const reputationScore = Number(onChainData.reputation ?? 0);
  const availableBalance = Number(onChainData.balance ?? 0);
  const pendingRewards = calcPendingRewards(totalTasksCompleted);

  return {
    name: offChainData.name,
    avatar: offChainData.profilePicture ?? null,
    initials: getInitials(offChainData.name),
    wallet,
    github: onChainData.GitProfile ?? "",
    rank: calcRank(reputationScore),
    reputationScore,
    reputationDelta: calcReputationDelta(
      reputationScore,
      totalTasksCompleted,
      totalTasksFailed,
    ),
    successRate: calcSuccessRate(totalTasksCompleted, totalTasksCreated),
    activeStake: availableBalance,
    stakeUSD: toUSD(availableBalance),
    availableBalance,
    totalEarned: availableBalance + pendingRewards,
    pendingRewards,
    totalTasksCreated,
    totalTasksCompleted,
    totalTasksFailed,
    isRegistered: Boolean(onChainData.isRegistered),
  };
}

function deriveActivity(tasks: MergedTask[]): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  let counter = 1;

  for (const t of tasks) {
    const status = Number(t.onchain?.status ?? 0);
    const submitStatus = Number(t.submit?.status ?? 0);
    const deadlineAt = Number(t.onchain?.deadlineAt ?? 0);
    const nowSec = Date.now() / 1000;
    const reward = Number(t.onchain?.reward ?? 0);
    const value = Number(t.onchain?.value ?? 0);

    if (status === TaskStatus.Completed) {
      entries.push({
        id: counter++,
        type: "milestone",
        label: "Task completed",
        sub: t.title,
        time: formatUnixDate(deadlineAt),
        delta: `+${reward.toFixed(4)} ETH`,
        positive: true,
      });
    }

    if (
      status === TaskStatus.Active ||
      status === TaskStatus.InProgres ||
      status === TaskStatus.Created
    ) {
      entries.push({
        id: counter++,
        type: "stake",
        label: "Stake committed",
        sub: t.title,
        time: formatUnixDate(deadlineAt),
        delta: `-${value.toFixed(4)} ETH`,
        positive: false,
      });
    }

    if (submitStatus === SubmitStatus.RevisionNeeded) {
      entries.push({
        id: counter++,
        type: "review",
        label: "Revision requested",
        sub: t.title,
        time: "",
        delta: "",
        positive: null,
      });
    }

    if (submitStatus === SubmitStatus.Pending) {
      entries.push({
        id: counter++,
        type: "review",
        label: "Awaiting review",
        sub: t.title,
        time: "",
        delta: "",
        positive: null,
      });
    }

    if (
      !t.onchain?.isRewardClaimed &&
      deadlineAt > 0 &&
      deadlineAt < nowSec
    ) {
      entries.push({
        id: counter++,
        type: "dispute",
        label: "Dispute pending",
        sub: t.title,
        time: formatUnixDate(deadlineAt),
        delta: "Pending",
        positive: null,
      });
    }
  }

  return entries;
}

function deriveTransactions(tasks: MergedTask[]): Transaction[] {
  const txs: Transaction[] = [];
  let counter = 1;

  for (const t of tasks) {
    const status = Number(t.onchain?.status ?? 0);
    const reward = Number(t.onchain?.reward ?? 0);
    const value = Number(t.onchain?.value ?? 0);
    const deadlineAt = t.onchain?.deadlineAt;

    if (value > 0) {
      txs.push({
        id: counter++,
        label: `Stake — ${t.title}`,
        amount: `-${value.toFixed(4)} ETH`,
        usd: `-$${toUSD(value).toLocaleString()}`,
        time: formatUnixDate(deadlineAt),
        out: true,
      });
    }

    if (status === TaskStatus.Completed && reward > 0) {
      txs.push({
        id: counter++,
        label: `Reward — ${t.title}`,
        amount: `+${reward.toFixed(4)} ETH`,
        usd: `+$${toUSD(reward).toLocaleString()}`,
        time: formatUnixDate(deadlineAt),
        out: false,
      });
    }
  }

  return txs;
}

async function fetchApiTasks(): Promise<TaskApiData[]> {
  const res = await axios.get(`${API_BASE_URL}/api/tasks`);
  return res.data.map((task: any) => {
    const taskId =
      task.id || task._id || `task-${Math.random().toString(36).substr(2, 9)}`;
    return { ...task, id: taskId };
  });
}

// ── Unified hook ──────────────────────────────────────────────────────────────

export function useDashboard(id: string) {
  const { getUsers, signer } = useUsersContractService();
  const { getTaskCounter, getTask, getTaskSubmit } = useTaskContractService();

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [rawTasks, setRawTasks] = useState<MergedTask[]>([]);
  const [walletAddress, setWalletAddress] = useState<
    `0x${string}` | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── FIX 1: Store every external function in a ref so they never appear
  //    in useCallback/useEffect dependency arrays. The hook functions from
  //    useUsersContractService / useTaskContractService get a new reference
  //    on every render; putting them in deps would recreate `load` every
  //    render, which triggers the effect every render → infinite blink loop.
  const getUsersRef = useRef(getUsers);
  const getTaskCounterRef = useRef(getTaskCounter);
  const getTaskRef = useRef(getTask);
  const getTaskSubmitRef = useRef(getTaskSubmit);
  const signerRef = useRef(signer);
  const idRef = useRef(id);

  // Keep refs current on every render (cheap, no re-render side-effect)
  getUsersRef.current = getUsers;
  getTaskCounterRef.current = getTaskCounter;
  getTaskRef.current = getTask;
  getTaskSubmitRef.current = getTaskSubmit;
  signerRef.current = signer;
  idRef.current = id;

  // Guards
  const loadingRef = useRef(false);

  // ── FIX 2: Track previous signer value so we can detect the exact
  //    null → value transition and avoid double-loads on every re-render.
  const prevSignerRef = useRef<typeof signer>(null);

  const { data: balanceData } = useBalance({ address: walletAddress });

  // ── fetchChainTasks has NO deps because it only uses refs
  const fetchChainTasks = useCallback(async (address: string) => {
    const counterRes = await getTaskCounterRef.current();
    if (!counterRes.success) return [];

    const count = Number(counterRes.data);
    const matched: any[] = [];
    const addr = address.toLowerCase();

    for (let i = 1; i <= count; i++) {
      const taskRes = await getTaskRef.current(i);
      if (!taskRes.success || !taskRes.data.exists) continue;

      const task = taskRes.data;
      const creator = (task.creator ?? "").toLowerCase();
      const member = (task.member ?? "").toLowerCase();

      if (creator !== addr && member !== addr) continue;

      const submitRes = await getTaskSubmitRef.current(i);
      matched.push({
        ...task,
        submit: submitRes.success ? submitRes.data : null,
      });
    }

    return matched;
  }, []); // stable — no deps needed, uses refs above

  // ── load also has NO deps on external functions (only stable fetchChainTasks)
  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Read from refs so we always have the latest values without
      // adding them to the dependency array
      const currentSigner = signerRef.current;
      const currentId = idRef.current;

      if (!currentSigner) {
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
      }

      const [onChainResult, offChainData] = await Promise.all([
        getUsersRef.current(),
        getUserById(currentId),
      ]);

      if (!onChainResult?.success || !offChainData) {
        throw new Error("Failed to fetch user data");
      }

      let addr = "";
      if (currentSigner) {
        try {
          addr = await currentSigner.getAddress();
        } catch {
          addr = "";
        }
      }

      setWalletAddress(addr as `0x${string}`);
      setUser(mapDashboardUser(addr, onChainResult.data, offChainData));

      if (addr) {
        const [apiTasks, chainTasks] = await Promise.all([
          fetchApiTasks(),
          fetchChainTasks(addr),
        ]);

        const merged: MergedTask[] = [];
        for (const chainTask of chainTasks) {
          const apiTask = apiTasks.find(
            (item) => Number(item.id) === Number(chainTask.taskId),
          );
          if (!apiTask) continue;

          const taskId =
            apiTask.id ||
            apiTask._id ||
            `task-${Math.random().toString(36).substr(2, 9)}`;

          merged.push({
            ...apiTask,
            id: taskId as string,
            onchain: chainTask,
            submit: chainTask.submit,
          });
        }

        setRawTasks(merged);
      } else {
        const apiTasks = await fetchApiTasks();
        setRawTasks(
          apiTasks.map((task) => {
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
          }),
        );
      }
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchChainTasks]); // fetchChainTasks is stable (empty deps), so load is stable too

  // ── FIX 3: Only `id` in deps — `load` is now stable so this runs exactly
  //    once on mount and again only when `id` changes. Previously, including
  //    `load` here caused a fire on every render because `load` changed every
  //    render (due to the unstable getUsers / getTask* refs in its deps).
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── FIX 4: Only trigger a re-load when signer transitions null → value
  //    (i.e., wallet just connected). Previously this fired on every render
  //    where `signer` was truthy, and the `loadingRef.current = false` line
  //    before `load()` actively defeated the concurrent-load guard.
  useEffect(() => {
    const prev = prevSignerRef.current;
    prevSignerRef.current = signer;

    // Only reload on the exact null→signer moment, not on every render
    if (signer && prev === null && !loadingRef.current) {
      load();
    }
  }, [signer, load]);

  // ── Derived data (unchanged) ───────────────────────────────────────────────

  const kanbanTasks = useMemo(
    () => rawTasks.map((t) => mapToKanban(t, walletAddress ?? "")),
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
    () => kanbanTasks.filter((t) => t.tab === "Disputed"),
    [kanbanTasks],
  );

  const activity = useMemo(() => deriveActivity(rawTasks), [rawTasks]);
  const transactions = useMemo(() => deriveTransactions(rawTasks), [rawTasks]);

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