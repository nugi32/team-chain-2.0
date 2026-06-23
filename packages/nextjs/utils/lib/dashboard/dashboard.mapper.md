import { resolveTab } from "./kanban";
import { KanbanTask, MergedTask } from "./types";

export function mapToKanban(
task: MergedTask,
walletAddress: string,
): KanbanTask {

return {
id: task.id,
tab: resolveTab(task),
project: task.title,
role: "Member",
stake: 0,
stakeUSD: 0,
deadline: "",
milestone: "",
risk: "on-track",
progress: 0,
tags: [],
};
}
