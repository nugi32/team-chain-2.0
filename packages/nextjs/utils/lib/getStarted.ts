import axios from "axios";

// Match the exact roles from your component
export type Role = "Developer" | "Designer" | "Project Manager";

export interface CreateAccountPayload {
  name: string;
  role: Role;
  linkedin: string;
  github: string;
  email?: string;
  avatar?: string;
  description: {
    header: string;
    summary: string;
    points: string[];
    footer: string;
  };
}

interface CreateAccountResponse {
  id: string;
  message?: string;
}

// Replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

console.log("API Base URL:", API_BASE_URL);

export const handleCreateAccount = async (
  formData: CreateAccountPayload
): Promise<string> => {
  try {
    const response = await axios.post<CreateAccountResponse>(
      `${API_BASE_URL}/api/users`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Ensure the response contains an id
    if (!response.data.id) {
      throw new Error("No account ID returned from server");
    }

    return response.data.id;
  } catch (error: unknown) {
    console.error("Failed to create account:", error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to create account";
      throw new Error(message);
    }

    throw new Error("Unexpected error occurred");
  }
};