import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type UserResponse = {
  profilePicture: string;
  name: string;
};

export async function handleFetchUserHeader(_id: string) {
  try {
    const response = await axios.get<UserResponse | UserResponse[]>(
      `${API_BASE_URL}/api/users/${_id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // support both: object or array
    const user = Array.isArray(data) ? data[0] : data;

    return {
      profilePicture: user.profilePicture,
      name: user.name,
    };
  } catch (error: unknown) {
    console.error("Failed to fetch user profile picture:", error);

    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Fetch failed";

      throw new Error(message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unexpected error occurred");
  }
}

export function handleUserInitials(username: string): string {
  const words = username
    .trim()
    .split(/[\s-_]+/) // pisah spasi, dash, underscore
    .filter(Boolean);

  if (words.length === 0) return "";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}