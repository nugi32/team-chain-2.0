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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function handleCreateAccount(
  formData: CreateAccountPayload,
  jwtToken: string,
  walletAddress: string
): Promise<string> {
    console.log('Creating account with data:', formData);
    console.log(jwtToken);
    
    // Map role from lowercase to capitalized format expected by backend
    const roleMap: Record<string, string> = {
      'developer': 'Developer',
      'designer': 'Designer',
      'project_manager': 'Project Manager'
    };

    // Map frontend data to backend schema
    const backendData = {
      walletAddress,
      name: formData.name,
      email: formData.email || '',
      github: formData.github,
      linkedin: formData.linkedin,
      role: roleMap[formData.role] || formData.role,
      profilePicture: formData.avatar || '',
      description: formData.description,
    };

  const response = await axios.post<{ id: string }>(
    `${API_BASE}/api/users`,
    backendData,
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