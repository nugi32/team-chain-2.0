import { useState } from "react";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import {
  handleCreateAccount,
  type CreateAccountPayload,
} from "@/utils/lib/express/mutations/users";
import { useUsersContract } from "@/utils/lib/smartContractWrapper/user/User";
import { decodeSmartContractError } from "@/utils/lib/helper/smartCotntractErrDecoder";
import { getStartedFindUserByAddress } from "@/utils/lib/express/queries/users";

export function useCreateAccount() {
  const { form, actions, user } = useUsersContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccount = async (data: CreateAccountPayload, address: string) => {
    setLoading(true);
    setError(null);

    try {
      // Smart contract registration - pass parameters directly to avoid state closure issue
      console.log("[createAccount] Starting Register transaction for:", data.github);

      const existingUser = await getStartedFindUserByAddress(address);

      if (user.isRegistered && (!existingUser)) {
        const jwt = await getValidJwt(address);
        const accountId = await handleCreateAccount(data, jwt, address);

        if (!accountId) throw new Error("Database did not return id");

        return accountId;
      }

      // Call the action handler with parameters directly (no state setting needed)
      console.log("[createAccount] Calling handleRegister with GitHub URL:", data.github, "and address:", address);
      await actions.handleRegister(data.github, address);
      console.log("[createAccount] Register transaction succeeded");

      const jwt = await getValidJwt(address);
      const accountId = await handleCreateAccount(data, jwt, address);

      if (!accountId) throw new Error("Database did not return id");

      return accountId;
    } catch (err: unknown) {
      console.error("[createAccount] Error caught:", err);

      const decodedError = decodeSmartContractError(err);
      console.error("[createAccount] Decoded error:", decodedError);

      setError(decodedError);
      throw new Error(decodedError);
    } finally {
      setLoading(false);
    }
  };

  return {
    createAccount,
    loading,
    error,
  };
}