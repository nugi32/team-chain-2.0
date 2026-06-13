import {getUserById} from "@/utils/lib/express/queries/users"; 

type UserResponse = {
  profilePicture: string;
  name: string;
  githubUrl: string;
  email: string;
};

export async function handleFetchUserHeader(_id: string) {
  try {
    const response = await getUserById(_id);

    return {
      profilePicture: response.profilePicture,
      name: response.name,
      githubUrl: response.github,
      email: response.email,
    } as UserResponse;
    
  } catch (err) {
    throw new Error("Unexpected error occurred");
  }
}