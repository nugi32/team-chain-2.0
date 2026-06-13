import type { SubmissionStatus } from "./types";

export default function SubmissionBadge({ status }: { status: SubmissionStatus }) {
  const map: Record<SubmissionStatus, string> = {
    pending_review: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    revision_requested: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    disputed: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  const labels: Record<SubmissionStatus, string> = {
    pending_review: "Pending Review",
    approved: "Approved",
    revision_requested: "Revision Requested",
    disputed: "Disputed",
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${map[status]}`}>
      {labels[status]}
    </span>
  );
}