// utils/lib/express/mutations/users.ts
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
    skills: string[];
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Helper function to compute keccak256 hash (same as smart contract)
async function computeGitHashForDebug(githubUrl: string): Promise<string> {
    // This is just for debugging - shows what hash the contract will compute
    console.log('[DEBUG] GitHub URL being registered:', githubUrl);
    try {
        // Try to use web3.js if available, otherwise just log the URL for manual checking
        const web3Module = await import('web3').catch(() => null);
        if (web3Module) {
            const { keccak256 } = web3Module.default.utils;
            const hash = keccak256(githubUrl);
            console.log('[DEBUG] keccak256 hash of GitHub URL:', hash);
            return hash;
        }
    } catch (e) {
        console.log('[DEBUG] Could not compute hash, but GitHub URL is:', githubUrl);
    }
    return '';
}

export async function handleCreateAccount(
    formData: CreateAccountPayload,
    jwtToken: string,
    walletAddress: string
): Promise<string> {
    console.log('=== CREATING ACCOUNT ===');
    console.log('Creating account with data:', formData);
    console.log('GitHub URL:', formData.github);
    
    // Compute and log the hash for debugging
    await computeGitHashForDebug(formData.github);
    console.log('JWT Token provided:', !!jwtToken);

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
        skills: formData.skills,
    };

    try {
        console.log('[handleCreateAccount] Sending POST to:', `${API_BASE}/api/users`);
        console.log('[handleCreateAccount] GitHub URL in payload:', backendData.github);
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

        console.log('[handleCreateAccount] Response:', response.data);

        if (!response.data.id) {
            throw new Error('No account ID returned from server');
        }
        return response.data.id;
    } catch (error: any) {
        console.error('[handleCreateAccount] API call failed:', error);
        
        // Extract meaningful error message from axios error
        if (error.response?.data?.message) {
            console.error('[handleCreateAccount] Backend error:', error.response.data.message);
            throw new Error(error.response.data.message);
        }
        
        if (error.response?.data?.error) {
            console.error('[handleCreateAccount] Backend error:', error.response.data.error);
            throw new Error(error.response.data.error);
        }

        if (error.message) {
            throw new Error(error.message);
        }

        throw new Error('Failed to create account on server');
    }
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
    const { data } = await axios.put(
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

