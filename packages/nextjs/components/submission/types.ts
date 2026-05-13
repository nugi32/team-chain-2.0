export interface Milestone {
  label: string;
  pct: number;
  done: boolean;
  active?: boolean;
}

export interface Reviewer {
  name: string;
  rep: number;
  avatar: string;
  status: string;
}

export interface Transaction {
  event: string;
  amount: string;
  time: string;
  hash: string;
}

export interface TaskData {
  id: string;
  title: string;
  project: string;
  stakeAmount: number;
  rewardAmount: number;
  deadline: string;
  daysLeft: number;
  progress: number;
  currentMilestone: number;
  milestones: Milestone[];
  requiredDocs: string[];
  reviewers: Reviewer[];
  txHistory: Transaction[];
}