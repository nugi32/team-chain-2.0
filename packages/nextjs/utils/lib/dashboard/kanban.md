import {
TaskStatus,
SubmitStatus,
TabType,
MergedTask,
} from "./types";

export function resolveTab(
task: MergedTask,
): TabType {
const status = Number(task.onchain?.status ?? 0);

const submitStatus = Number(
task.submit?.status ?? 0,
);

if (
submitStatus === SubmitStatus.Pending ||
submitStatus === SubmitStatus.RevisionNeeded
) {
return "Review";
}

switch (status) {
case TaskStatus.Created:
return "Created";

    case TaskStatus.Active:
      return "Active";

    case TaskStatus.OpenRegistration:
      return "OpenRegistration";

    case TaskStatus.InProgres:
      return "InProgres";

    case TaskStatus.Completed:
      return "Completed";

    case TaskStatus.Cancelled:
      return "Cancelled";

    default:
      return "Created";

}
}
