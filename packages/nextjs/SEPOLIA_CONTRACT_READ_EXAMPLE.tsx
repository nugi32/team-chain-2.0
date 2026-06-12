// ============================================================================
// EXAMPLES: Reading Contract Data with and without Wallet Connection
// ============================================================================

import { useWalletAddress } from "@/hooks/scaffold-eth/useWalletAddress";
import { useScaffoldReadContract } from "@/hooks/scaffold-eth";

// ============ OPTION 1: Read without wallet connection (using backend) ============
/**
 * Gets wallet address from localStorage/backend (userId)
 * Reads contract data WITHOUT requiring wallet connection
 */
export function ReadContractWithoutWallet() {
  const { walletAddress, isLoading, error } = useWalletAddress();
  
  const { data: contractData, isLoading: isReadingContract } = useScaffoldReadContract({
    contractName: "AccessControl",
    functionName: "getRoleAdmin",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  if (isLoading) return <p>Loading wallet address...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!walletAddress) return <p>No wallet address found</p>;

  return (
    <div>
      <p>Wallet: {walletAddress}</p>
      <p>Contract Data: {isReadingContract ? "Loading..." : contractData}</p>
    </div>
  );
}

// ============ OPTION 2: Require wallet connection (user connected) ============
/**
 * Only works if wallet is connected
 * Uses connected wallet address to read contract data
 */
export function ReadContractWithWallet() {
  const { walletAddress, isConnected, error } = useWalletAddress();
  
  const { data: contractData, isLoading: isReadingContract } = useScaffoldReadContract({
    contractName: "AccessControl",
    functionName: "getRoleAdmin",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  if (!isConnected) return <p>Please connect your wallet</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!walletAddress) return <p>No wallet address</p>;

  return (
    <div>
      <p>Connected Wallet: {walletAddress}</p>
      <p>Contract Data: {isReadingContract ? "Loading..." : contractData}</p>
    </div>
  );
}

// ============ OPTION 3: Use either (connected wallet or backend) ============
/**
 * Falls back to backend wallet if not connected
 * This is the recommended approach for most use cases
 */
export function ReadContractAnyway() {
  const { walletAddress, source, isLoading, error } = useWalletAddress();
  
  const { data: contractData, isLoading: isReadingContract, error: contractError } = 
    useScaffoldReadContract({
      contractName: "YourContract",
      functionName: "someFunction",
      args: ["0x..."],
    });

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error.message}</div>;
  if (!walletAddress) return <div className="warning">No wallet found</div>;

  return (
    <div className="card">
      <p>Wallet: {walletAddress}</p>
      <p>Source: {source}</p> {/* "connected" or "backend" */}
      
      {contractError && <p className="error">{contractError.message}</p>}
      {isReadingContract ? (
        <p>Reading contract...</p>
      ) : (
        <p>Data: {JSON.stringify(contractData)}</p>
      )}
    </div>
  );
}

// ============ HOW IT WORKS ============
// 1. useWalletAddress() hook:
//    - Checks if wallet is connected → use wallet address
//    - If NOT connected → get userId from localStorage
//    - Fetch user via getUserById(userId)
//    - Return user.walletAddress from backend
//
// 2. useScaffoldReadContract() hook:
//    - Uses any valid wallet address (connected or backend)
//    - Looks up contract ABI from deployedContracts.ts
//    - Reads contract data WITHOUT wallet connection needed
//
// ============ KEY FILES ============
// - hooks/scaffold-eth/useWalletAddress.ts (new hook)
// - utils/lib/express/queries/users.ts (getUserById function)
// - contracts/deployedContracts.ts (contract ABIs)
