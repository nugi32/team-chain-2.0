import { useState } from "react";
import { getValidJwt } from "@/utils/globalLib/walletAuth";
import {
  handleCreateAccount,
  type CreateAccountPayload,
} from "@/utils/lib/express/mutations/users";
import { useUsersContractService } from "@/utils/lib/smartContractWrapper/user/User";

export function useCreateAccount() {
  const { Register } = useUsersContractService();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccount = async (
    data: CreateAccountPayload,
    address: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      await Register(data.github);

      const jwt = await getValidJwt(address);

      const result = await handleCreateAccount(data, jwt, address);

      if (!result) {
        throw new Error("Database did not return id");
      }

      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error occurred";

      setError(message);
      throw new Error(message);
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