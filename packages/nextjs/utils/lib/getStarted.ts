// utils/lib/getStarted.ts
import axios from 'axios';

export type Role = 'developer' | 'designer' | 'project_manager'; // match backend enum

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function handleCreateAccount(
  formData: CreateAccountPayload,
  jwtToken: string
): Promise<string> {
    console.log('Creating account with data:', formData);
    console.log(jwtToken);
  const response = await axios.post<{ id: string }>(
    `${API_BASE}/api/users`,
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  if (!response.data.id) {
    throw new Error('No account ID returned from server');
  }
  return response.data.id;
}