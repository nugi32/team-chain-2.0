export type ApplicantStatus = "pending" | "accepted" | "rejected";
export type SubmissionStatus = "pending_review" | "approved" | "revision_requested" | "disputed";
export type TabKey = "applicants" | "submissions" | "milestones" | "settings";

export interface Applicant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  rep: number;
  successRate: number;
  tasksCompleted: number;
  skills: string[];
  pitch: string;
  appliedAt: string;
  status: ApplicantStatus;
  walletShort: string;
}

export interface Submission {
  id: string;
  workerName: string;
  workerAvatar: string;
  workerColor: string;
  milestone: number;
  milestoneLabel: string;
  submittedAt: string;
  notes: string;
  links: string[];
  files: string[];
  selfRating: number;
  status: SubmissionStatus;
  revisionNote?: string;
}