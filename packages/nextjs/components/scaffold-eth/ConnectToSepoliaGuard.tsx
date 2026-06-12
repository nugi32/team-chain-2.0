"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";
import { sepolia } from "viem/chains";

/**
 * Hook that ensures the user is connected to Sepolia network
 * Automatically switches to Sepolia if wallet is connected but on wrong network
 */
export const useConnectToSepolia = () => {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const isOnSepolia = chain?.id === sepolia.id;
  const needsNetworkSwitch = isConnected && !isOnSepolia;

  useEffect(() => {
    if (needsNetworkSwitch && switchChain) {
      switchChain({ chainId: sepolia.id });
    }
  }, [needsNetworkSwitch, switchChain]);

  return {
    isConnected,
    isOnSepolia,
    needsNetworkSwitch,
    currentChain: chain,
  };
};

/**
 * Component that shows a warning if user is not connected or not on Sepolia
 */
interface ConnectToSepoliaGuardProps {
  children: React.ReactNode;
  hideWarning?: boolean;
}

export const ConnectToSepoliaGuard = ({ children, hideWarning = false }: ConnectToSepoliaGuardProps) => {
  const { isConnected, isOnSepolia, needsNetworkSwitch } = useConnectToSepolia();

  if (!isConnected) {
    return hideWarning ? (
      <>{children}</>
    ) : (
      <div className="alert alert-warning mb-4">
        <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0-10a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z"></path>
        </svg>
        <span>Please connect your wallet to read contract data</span>
      </div>
    );
  }

  if (needsNetworkSwitch) {
    return hideWarning ? (
      <>{children}</>
    ) : (
      <div className="alert alert-info mb-4">
        <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
        </svg>
        <span>Switching to Sepolia network...</span>
      </div>
    );
  }

  return <>{children}</>;
};
