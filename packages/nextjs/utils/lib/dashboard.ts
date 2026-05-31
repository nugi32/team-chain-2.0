import { getUserById } from "@/utils/lib/express/queries/users"

export async function handleGetDashboard(_id: string) {
  try {
    const data = await getUserById(_id);
    if(!data) {
      throw new Error("Backend did not return any data")
    }

    return data
  } catch(err) {
    console.error(`An error occured while getting user data ${err}`)
    return err;
  }
}