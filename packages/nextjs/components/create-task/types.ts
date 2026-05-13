export interface Milestone {
  id: string;
  title: string;
  reward: string;
  deadline: string;
  description: string;
}

export interface FormData {
  title: string;
  teamName: string;
  objective: string;
  category: string;
  taskType: string;
  stakeRequired: string;
  reward: string;
  effort: string;
  deadline: string;
  slots: string;
  minReputation: string;
  roles: string[];
  skills: string[];
  description: string;
  milestones: Milestone[];
  badges: string[];
}