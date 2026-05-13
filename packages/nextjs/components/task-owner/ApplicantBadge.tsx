import type { ApplicantStatus } from "./types";

export default function ApplicantBadge({ status }: { status: ApplicantStatus }) {
  const map = {
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accepted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rejected: "text-gray-500 bg-gray-800 border-gray-700",
  };
  const labels = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${map[status]}`}>
      {labels[status]}
    </span>
  );
}