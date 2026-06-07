// utils/lib/express/mutations/tasks.ts
import axios from "axios";
import { getUserById } from "@/utils/lib/express/queries/users";

export type Role = "developer" | "designer" | "project_manager";

interface CreateTaskPayload {
  _id: string;
  smartContractId: number;
  title: string;
  description: {
    header: string;
    summary: string;
    points: string[];
    footer: string;
  };
  picture: string;
  skills: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/* =========================
   TASKS
========================= */

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
    smartContractId: formData.smartContractId,
    title: formData.title,
    description: formData.description,
    picture: formData.picture,
    skills: formData.skills,
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
  const user = await getUserById(formData._id || "");

  if (user.owner !== walletAddress) {
    throw new Error("User data did not match");
  }

  const backendData = {
    ...(formData.smartContractId && {
      smartContractId: formData.smartContractId,
    }),
    ...(formData.title && {
      title: formData.title,
    }),
    ...(formData.description && {
      description: formData.description,
    }),
    ...(formData.picture && {
      picture: formData.picture,
    }),
  };

  try {
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
  } catch (err) {
    console.error("Error while updating task:", err);
    throw err;
  }
}

export async function handleDeleteTask(
  taskId: string,
  userId: string,
  jwtToken: string,
  walletAddress: string
) {
  const user = await getUserById(userId);

  if (user.owner !== walletAddress) {
    throw new Error("User data did not match");
  }

  try {
    const response = await axios.delete(
      `${API_BASE}/api/tasks/${taskId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (!response) {
      throw new Error("An error occurred while deleting task");
    }

    return response.data;
  } catch (err) {
    console.error("An error occurred while deleting task");
    throw err;
  }
}