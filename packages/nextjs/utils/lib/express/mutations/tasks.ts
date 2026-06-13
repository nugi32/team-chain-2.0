import axios from "axios";
import { getUserById } from "@/utils/lib/express/queries/users";

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
  _id: string;
  title: string;
  projectName: string;
  objective: string;
  category: TaskCategory;
  effort?: TaskEffort;
  minReputation?: string;
  roles?: string[];
  skills: string[];
  description: string;
  badges?: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function handleCreateTask(
  formData: CreateTaskPayload,
  jwtToken: string,
  walletAddress: string
): Promise<string> {
  const user = await getUserById(formData._id);

  if (user.owner !== walletAddress) {
    throw new Error("User data did not match");
  }

  const backendData = {
    owner: formData._id,
    title: formData.title,
    projectName: formData.projectName,
    objective: formData.objective,
    category: formData.category,
    effort: formData.effort,
    minReputation: formData.minReputation,
    roles: formData.roles,
    skills: formData.skills,
    description: formData.description,
    badges: formData.badges,
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
  jwtToken: string,
  walletAddress: string
) {
  if (formData._id) {
    const user = await getUserById(formData._id);

    if (user.owner !== walletAddress) {
      throw new Error("User data did not match");
    }
  }

  const backendData = {
    ...(formData.title !== undefined && { title: formData.title }),
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