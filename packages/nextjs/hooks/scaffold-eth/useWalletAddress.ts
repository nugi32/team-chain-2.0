"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getUserById } from "@/utils/lib/express/queries/users";
import { Address } from "viem";

/**
 * Hook that gets wallet address from either:
 * 1. Connected wallet (if user is connected)
 * 2. localStorage userId -> backend API (if not connected)
 * 
 * This allows reading contract data without wallet connection
 */
export const useWalletAddress = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [backendWalletAddress, setBackendWalletAddress] = useState<Address | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If wallet is connected, use that address
    if (isConnected && connectedAddress) {
      setBackendWalletAddress(undefined);
      setError(null);
      return;
    }

    // Otherwise, fetch from backend using userId from localStorage
    const fetchBackendAddress = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError(new Error("No userId found in localStorage"));
          setIsLoading(false);
          return;
        }

        const user = await getUserById(userId);
        if (user.walletAddress) {
          setBackendWalletAddress(user.walletAddress as Address);
        } else {
          setError(new Error("User has no wallet address"));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch user wallet"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendAddress();
  }, [isConnected, connectedAddress]);

  // Priority: connected wallet > backend wallet
  const walletAddress = (connectedAddress || backendWalletAddress) as Address | undefined;
  const source = isConnected ? "connected" : "backend";

  return {
    walletAddress,
    source,
    isLoading,
    error,
    isConnected,
  };
};
