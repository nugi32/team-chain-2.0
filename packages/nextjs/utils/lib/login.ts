import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type UserResponse = {
  _id: string;
  walletAddress?: string;
  github?: string;
};

export async function handleLogin(method: "wallet" | "github", identifier: string): Promise<string> {
  try {
    const response = await axios.get<UserResponse | UserResponse[]>(`${API_BASE_URL}/api/users`, {
      params: method === "wallet" ? { walletAddress: identifier } : { github: identifier },
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    // support both: object or array
    const user = Array.isArray(data) ? data[0] : data;

    if (!user?._id) {
      throw new Error("User not found");
    }

    return user._id;
  } catch (error: unknown) {
    console.error("Login failed:", error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || "Authentication failed";

      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unexpected error occurred");
  }
}
