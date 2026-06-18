import axios from "axios";

export type Role = "developer" | "designer" | "project_manager";

export type TaskCategory =
  | "Smart Contracts"
  | "Frontend"
  | "Backend"
  | "Security Audit"
  | "Design / UX"
  | "Documentation";

export type TaskEffort =
  | "< 4 hrs"
  | "4–8 hrs"
  | "1–3 days"
  | "1 week"
  | "2+ weeks"
  | "";

export interface CreateTaskPayload {
  contractId: string; // Smart contract task ID (uint256 as string)
  projectName: string;
  objective: string;
  category: TaskCategory;
  effort?: TaskEffort;
  minReputation?: string;
  roles?: string[];
  skills: string[];
  description: string;
  badges?: string[];
  reward: string; // ETH amount as string, used for stake calculation
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function handleCreateTask(
  formData: CreateTaskPayload,
  jwtToken: string
): Promise<string> {

  const backendData = {
    contractId: formData.contractId,
    projectName: formData.projectName,
    objective: formData.objective,
    category: formData.category,
    effort: formData.effort,
    minReputation: formData.minReputation,
    roles: formData.roles,
    skills: formData.skills,
    description: formData.description,
    badges: formData.badges,
    reward: formData.reward,
  };

  const response = await axios.post<{ id: string }>(
    `${API_BASE}/api/tasks`,
    backendData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  if (!response.data.id) {
    throw new Error("No task ID returned from server");
  }

  return response.data.id;
}

export async function handleUpdateTask(
  taskId: string,
  formData: UpdateTaskPayload,
  jwtToken: string
) {
  const backendData = {
    ...(formData.contractId !== undefined && {
      contractId: formData.contractId,
    }),
    ...(formData.projectName !== undefined && {
      projectName: formData.projectName,
    }),
    ...(formData.objective !== undefined && {
      objective: formData.objective,
    }),
    ...(formData.category !== undefined && {
      category: formData.category,
    }),
    ...(formData.effort !== undefined && {
      effort: formData.effort,
    }),
    ...(formData.minReputation !== undefined && {
      minReputation: formData.minReputation,
    }),
    ...(formData.roles !== undefined && {
      roles: formData.roles,
    }),
    ...(formData.skills !== undefined && {
      skills: formData.skills,
    }),
    ...(formData.description !== undefined && {
      description: formData.description,
    }),
    ...(formData.badges !== undefined && {
      badges: formData.badges,
    }),
    ...(formData.reward !== undefined && {
      reward: formData.reward,
    }),
  };

  const { data } = await axios.patch(
    `${API_BASE}/api/tasks/${taskId}`,
    backendData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  return data;
}

export async function handleDeleteTask(
  taskId: string,
  jwtToken: string,
) {

  const response = await axios.delete(
    `${API_BASE}/api/tasks/${taskId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  return response.data;
}