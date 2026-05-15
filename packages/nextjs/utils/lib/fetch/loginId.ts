// utils/authApi.ts
export type LoginMethod = "wallet" | "github";

/**
 * Call the backend to obtain the user ID after a successful authentication.
 * @param method - "wallet" or "github"
 * @param identifier - wallet address OR github username
 * @returns user ID as string
 */
export async function fetchUserIdFromBackend(
  method: LoginMethod,
  identifier: string
): Promise<string> {
  const endpoint =
    method === "wallet" ? "/api/login/wallet" : "/api/login/github";

  const body =
    method === "wallet"
      ? { address: identifier }
      : { username: identifier };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`);
  }

  const data = await res.json();

  // Expect { id: "..." } from the backend
  if (!data.id) throw new Error("Backend did not return an id");
  return data.id as string;
}