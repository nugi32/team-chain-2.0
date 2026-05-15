import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function handleLogin(
  method: "wallet" | "github",
  identifier: string
): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      params:
        method === "wallet"
          ? { walletAddress: identifier }
          : { github: identifier },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Login response:", response.data);

    if (!response.data?.id) {
      throw new Error("Backend did not return an id");
    }

    return "10"//response.data.id as string;
  } catch (error: any) {
    console.error("Login failed:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          `Backend responded with ${error.response?.status}`
      );
    }

    throw new Error("Unexpected error occurred");
  }
}