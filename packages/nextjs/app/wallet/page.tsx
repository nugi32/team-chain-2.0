"use client";

import { useWalletAddress } from "@/hooks/scaffold-eth/useWalletAddress";
import { useScaffoldReadContract } from "@/hooks/scaffold-eth";
import { Address } from "@scaffold-ui/components";

/**
 * Wallet page that reads contract data without wallet connection
 * Uses userId from localStorage to fetch wallet address from backend
 */
export default function WalletPage() {
  const { walletAddress, source, isLoading, error, isConnected } = useWalletAddress();

  // Read: Contract owner
  const { data: contractOwner, isLoading: isReadingOwner, error: ownerError } = useScaffoldReadContract({
    contractName: "AccessControl",
    functionName: "owner",
    args: [],
  });

  // Read: Employee count
  const { data: employeeCount, isLoading: isReadingCount, error: countError } = useScaffoldReadContract({
    contractName: "AccessControl",
    functionName: "employeeCount",
    args: [],
  });

  // Read: Check if wallet is an employee
  const { data: isEmployee, isLoading: isCheckingEmployee, error: employeeError } = useScaffoldReadContract({
    contractName: "AccessControl",
    functionName: "employees",
    args: walletAddress ? [walletAddress] : undefined,
  });

  const isReading = isReadingOwner || isReadingCount || isCheckingEmployee;
  const hasError = ownerError || countError || employeeError;

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Wallet Information</h1>

        {/* Wallet Address Section */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Your Wallet</h2>

            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Loading wallet address...</span>
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span>{error.message}</span>
              </div>
            ) : walletAddress ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Wallet Address ({source})</p>
                  <Address address={walletAddress} format="long" />
                </div>
                <div className="badge badge-primary">
                  {isConnected ? "Wallet Connected" : "Using Backend Address"}
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>No wallet address found. Please connect your wallet or log in.</span>
              </div>
            )}
          </div>
        </div>

        {/* Contract Data Section */}
        {walletAddress && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">AccessControl Contract Data</h2>

              {isReading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Reading contract...</span>
                </div>
              ) : hasError ? (
                <div className="alert alert-error">
                  <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Error Reading Contract</h3>
                    <div className="text-xs">{(ownerError || countError || employeeError)?.message}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Contract Owner */}
                  <div className="divider my-0"></div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Contract Owner</p>
                    {contractOwner ? (
                      <Address address={String(contractOwner)} format="long" />
                    ) : (
                      <p className="text-gray-400">No data</p>
                    )}
                  </div>

                  {/* Employee Count */}
                  <div className="divider my-0"></div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Total Employees</p>
                    <p className="font-mono text-lg font-bold text-primary">
                      {employeeCount !== undefined ? String(employeeCount) : "0"}
                    </p>
                  </div>

                  {/* Is Current Wallet an Employee */}
                  <div className="divider my-0"></div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Is Your Wallet an Employee?</p>
                    <div className="flex items-center gap-2">
                      {isEmployee ? (
                        <>
                          <span className="badge badge-success">YES</span>
                          <span className="text-sm text-success-content">Your wallet is registered</span>
                        </>
                      ) : (
                        <>
                          <span className="badge badge-error">NO</span>
                          <span className="text-sm text-error-content">Your wallet is not registered</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="alert alert-success mt-4">
                    <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>✓ Contract data successfully fetched without wallet connection!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="alert alert-info mt-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            This page reads AccessControl contract data using your wallet address from localStorage without needing wallet connection.
          </span>
        </div>
      </div>
    </div>
  );
}
