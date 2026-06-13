export interface Milestone {
  id: string;
  title: string;
  reward: string;
  deadline: string;
  description: string;
}

export interface FormData {
  title: string; // Required for smart contract
  projectName: string;
  objective: string;
  category: string;
  stakeRequired: string;
  reward: string;
  effort: string;
  deadline: string;
  minReputation: string;
  roles: string[];
  skills: string[];
  description: string;
  milestones: Milestone[];
  badges: string[];
  githubIssueUrl: string;
  maxRevisions: string;
  slots?: string;
}

/**
 * On-chain payload for smart contract transaction
 * Maps FormData to SmartContractTaskPayload
 */
export interface OnChainPayload {
  title: string;
  githubURL: string;
  deadlineHours: bigint;
  maximumRevision: bigint;
  user: `0x${string}`;
  value: string; // ETH amount as string, will be parsed to wei
}