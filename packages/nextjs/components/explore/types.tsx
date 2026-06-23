// ─────────────────────────────────────────────────────────────────
// Task status — must mirror Solidity enum ordering
// ─────────────────────────────────────────────────────────────────
export enum TaskStatus {
  Created = 0,
  Active = 1,
  OpenRegistration = 2,
  InProgres = 3,
  Review = 4,
  Completed = 5,
  Cancelled = 6,
}

// ─────────────────────────────────────────────────────────────────
// Merged output from useGetCompleteTasks
// (on-chain + Express backend combined)
// ─────────────────────────────────────────────────────────────────
export interface CompleteTaskOutput {
  // ── Smart-contract ──────────────────────────────────────────
  smartContractId: number;
  status: TaskStatus;
  value: number; // wei
  reward: number; // wei
  deadlineAt: number; // unix seconds
  createdAt: number; // unix seconds
  creatorStake: number; // wei
  memberStake: number; // wei
  maxRevision: number;
  deadlineHours: number;
  creator: string; // on-chain creator wallet
  member: string; // assigned member (or zero address)
  githubURL: string;
  isMemberStakeLocked: boolean;
  isCreatorStakeLocked: boolean;
  isRewardClaimed: boolean;
  exists: boolean;

  // ── Express backend ─────────────────────────────────────────
  expressId: string;
  projectName: string;
  objective: string;
  category: string;
  effort: string;
  minReputation: string;
  roles: string[];
  skills: string[];
  description: string; // may be JSON-encoded object or plain text
  badges: string[];
  milestones: unknown | null;
  stakeRequired: string;
  owner: string; // Express owner wallet
}

// ─────────────────────────────────────────────────────────────────
// User profile returned by useDashboardUserData
// ─────────────────────────────────────────────────────────────────
export interface CreatorProfile {
  _id?: string;
  walletAddress?: string;
  name?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  role?: string;
  profilePicture?: string;
  description?: {
    header?: string;
    summary?: string;
    points?: string[];
    footer?: string;
  };
  skills?: string[];
  owner?: string;
  totalTasksCreated?: string | bigint;
  totalTasksCompleted?: string | bigint;
  totalTasksFailed?: string | bigint;
  reputation?: string | bigint;
  balance?: string | bigint;
  isRegistered?: boolean;
  exists?: boolean;
  GitProfile?: string;
  successRate?: number;
  tier?: "Bronze" | "Silver" | "Gold" | "Platinum";
  formattedBalance?: string;
}
