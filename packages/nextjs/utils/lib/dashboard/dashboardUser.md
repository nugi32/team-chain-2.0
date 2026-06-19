// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

const ETH_PRICE_USD = 3_300;

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function calcSuccessRate(completed: number, created: number): number {
  if (!created) return 0;
  return Number(((completed / created) * 100).toFixed(1));
}

export function calcReputationDelta(
  reputation: number,
  completed: number,
  failed: number,
): number {
  return completed * 10 - failed * 5 + reputation;
}

export function calcRank(reputation: number): number {
  if (reputation >= 1000) return 1;
  if (reputation >= 500) return 25;
  if (reputation >= 250) return 100;
  return 999;
}

export function calcPendingRewards(completed: number): number {
  return Number((completed * 0.15).toFixed(2));
}

export function toUSD(eth: number): number {
  return Number((eth * ETH_PRICE_USD).toFixed(2));
}

export function formatUnixDate(unixTs: number | string): string {
  const ts = Number(unixTs);
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

export function mapDashboardUser(
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

export function deriveActivity(
  tasks: any[],
  TaskStatus: any,
  SubmitStatus: any,
): ActivityEntry[] {
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
      status === TaskStatus.InProgress ||
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

export function deriveTransactions(
  tasks: any[],
  TaskStatus: any,
): Transaction[] {
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
