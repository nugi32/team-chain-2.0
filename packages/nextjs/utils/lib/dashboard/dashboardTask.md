import axios from "axios";
import type { MergedTask } from "./kanban";

const API_BASE_URL =
process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TaskApiData = {
\_id?: string;
id: string;
title: string;
picture: string;
owner: string;
description: {
header: string;
summary: string;
points: string[];
footer: string;
};
};

export type TaskCreateInput = {
title: string;
description: {
header: string;
summary: string;
points: string[];
footer: string;
};
picture?: string;
owner: string;
};

// ── API Helpers ───────────────────────────────────────────────────────────────

export async function fetchAllTasks(): Promise<TaskApiData[]> {
try {
const res = await axios.get(`${API_BASE_URL}/api/tasks`);
return res.data.map((task: any) => {
const taskId =
task.id ||
task.\_id ||
`task-${Math.random().toString(36).substr(2, 9)}`;
return { ...task, id: taskId };
});
} catch (error) {
console.error("Failed to fetch tasks:", error);
return [];
}
}

export async function fetchTaskById(taskId: string): Promise<TaskApiData | null> {
try {
const res = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}`);
return res.data;
} catch (error) {
console.error(`Failed to fetch task ${taskId}:`, error);
return null;
}
}

export async function createTask(taskData: TaskCreateInput): Promise<TaskApiData | null> {
try {
const res = await axios.post(`${API_BASE_URL}/api/tasks`, taskData);
return res.data;
} catch (error) {
console.error("Failed to create task:", error);
return null;
}
}

export async function updateTask(
taskId: string,
taskData: Partial<TaskCreateInput>,
): Promise<TaskApiData | null> {
try {
const res = await axios.put(`${API_BASE_URL}/api/tasks/${taskId}`, taskData);
return res.data;
} catch (error) {
console.error(`Failed to update task ${taskId}:`, error);
return null;
}
}

export async function deleteTask(taskId: string): Promise<boolean> {
try {
await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
return true;
} catch (error) {
console.error(`Failed to delete task ${taskId}:`, error);
return false;
}
}

// ── Task Processing ───────────────────────────────────────────────────────────

export function mergeTasks(
apiTasks: TaskApiData[],
onchainData?: any,
submitData?: any,
): MergedTask[] {
return apiTasks.map((task) => {
const taskId = task.id || task.\_id || `task-${Math.random().toString(36).substr(2, 9)}`;
return {
...task,
id: taskId as string,
onchain: onchainData?.[taskId] || { exists: false },
submit: submitData?.[taskId] || null,
};
});
}

export function filterTasksByOwner(
tasks: MergedTask[],
ownerAddress: string,
): MergedTask[] {
return tasks.filter(
(task) =>
task.onchain?.creator?.toLowerCase() === ownerAddress.toLowerCase(),
);
}

export function filterTasksByStatus(
tasks: MergedTask[],
status: number,
): MergedTask[] {
return tasks.filter((task) => Number(task.onchain?.status ?? 0) === status);
}

export function filterTasksByDeadline(
tasks: MergedTask[],
before: number,
after?: number,
): MergedTask[] {
return tasks.filter((task) => {
const deadline = Number(task.onchain?.deadlineAt ?? 0);
if (after !== undefined && deadline < after) return false;
if (deadline > before) return false;
return true;
});
}

export function sortTasksByDeadline(tasks: MergedTask[], ascending = true): MergedTask[] {
return [...tasks].sort((a, b) => {
const deadlineA = Number(a.onchain?.deadlineAt ?? 0);
const deadlineB = Number(b.onchain?.deadlineAt ?? 0);
return ascending ? deadlineA - deadlineB : deadlineB - deadlineA;
});
}

export function sortTasksByReward(tasks: MergedTask[], descending = true): MergedTask[] {
return [...tasks].sort((a, b) => {
const rewardA = Number(a.onchain?.reward ?? 0);
const rewardB = Number(b.onchain?.reward ?? 0);
return descending ? rewardB - rewardA : rewardA - rewardB;
});
}

export function countTasksByStatus(
tasks: MergedTask[],
statusMap: Record<number, string>,
): Record<string, number> {
const counts: Record<string, number> = {};

for (const statusName of Object.values(statusMap)) {
counts[statusName] = 0;
}

for (const task of tasks) {
const status = Number(task.onchain?.status ?? 0);
const statusName = statusMap[status];
if (statusName) {
counts[statusName]++;
}
}

return counts;
}

export function calculateTaskStats(tasks: MergedTask[]) {
return {
total: tasks.length,
withDeadline: tasks.filter((t) => Number(t.onchain?.deadlineAt ?? 0) > 0)
.length,
withReward: tasks.filter((t) => Number(t.onchain?.reward ?? 0) > 0).length,
totalReward: tasks.reduce(
(sum, t) => sum + Number(t.onchain?.reward ?? 0),
0,
),
};
}
