// utils/lib/getStarted.ts
import axios from 'axios';
import { getUserById } from "@/utils/lib/express/queries/users";

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

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

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

export async function handleUpdateAccount(
  _id: string,
  formData: UpdateAccountPayload,
  jwtToken: string,
  walletAddress: string
) {
  const user = await getUserById(_id);

  if (user.owner !== walletAddress) {
    throw new Error("User data did not match");
  }

  const roleMap: Record<string, string> = {
    developer: "Developer",
    designer: "Designer",
    project_manager: "Project Manager",
  };

  const backendData = {
    ...(formData.name && { name: formData.name }),
    ...(formData.email && { email: formData.email }),
    ...(formData.github && { github: formData.github }),
    ...(formData.linkedin && { linkedin: formData.linkedin }),
    ...(formData.avatar && {
      profilePicture: formData.avatar,
    }),
    ...(formData.role && {
      role: roleMap[formData.role],
    }),
    ...(formData.description && {
      description: formData.description,
    }),
  };

  try {
    const { data } = await axios.patch(
      `${API_BASE}/api/users/${_id}`,
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
    console.error("Error while updating user:", err);
    throw err;
  }
}

export async function handleDelleteAccount(
    _id: string,
    jwtToken: string,
    walletAddress: string
) {

    const user = await getUserById(_id);

    if (user.owner != walletAddress) {
        throw new Error("User data did not match")
    }
    try {
        const response = await axios.delete(
            `${API_BASE}/api/users/${_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
        );
        if (!response) throw new Error("An error ocured while deleting data")
    } catch (err) {
        console.error("An error ocured while deleting data")
        throw err;
    }
}

