import { getValidJwt } from "@/utils/globalLib/walletAuth";
import { handleCreateAccount, type CreateAccountPayload } from "@/utils/lib/express/mutations/users";

export async function useCreateAccount(_data: CreateAccountPayload, address: string) {

  try {
    const jwt = await getValidJwt(address);
    const result = await handleCreateAccount(_data,jwt,address);

    if(!result) {
      throw new Error("databased not return id")
    }
    console.warn(result)
    return result;
  } catch(err) {
    console.error(`An error occured while registering ${err}`)
    return err;
  }
}