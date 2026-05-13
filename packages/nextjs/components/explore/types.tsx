export type RiskBadge = "Low Risk" | "Verified Team" | "High Stake" | "Fast Review" | "New Team" | "Urgent";
export type TaskStatus = "open" | "review" | "filled";
export type SortKey = "newest" | "highest_reward" | "urgent" | "low_rep";

export interface Task {
  id: string;
  title: string;
  project: string;
  teamAvatar: string;
  objective: string;
  stake: number;
  reward: number;
  effort: string;
  deadline: string;
  deadlineDays: number;
  requiredRep: number;
  role: string;
  skills: string[];
  applicants: number;
  slots: number;
  teamRep: number;
  teamCompletions: number;
  badges: RiskBadge[];
  status: TaskStatus;
  category: string;
  description: string;
  featured?: boolean;
}