import { ethers } from "ethers";

function getContractError(error: unknown): string {
  // Ethers v6 typed checks
  if (ethers.isError(error, "CALL_EXCEPTION")) {
    return error.reason || error.shortMessage || "Contract call reverted";
  }

  if (ethers.isError(error, "ACTION_REJECTED")) {
    return "Transaction rejected in wallet";
  }

  // Metamask / nested RPC errors
  const err = error as any;

  return (
    err?.reason ||
    err?.shortMessage ||
    err?.data?.message ||
    err?.error?.reason ||
    err?.error?.message ||
    err?.message ||
    "Unknown contract error"
  );
}

function getCustomContractError(error: unknown, contract?: ethers.Contract) {
  const err = error as any;

  // custom solidity error
  if (err?.data && contract) {
    try {
      const decoded = contract.interface.parseError(err.data);

      return decoded ? `${decoded.name}: ${decoded.args.join(", ")}` : "Contract reverted";
    } catch {}
  }

  return err?.reason || err?.shortMessage || err?.message || "Unknown error";
}

// Export for easy use in hooks - decodes custom contract errors
export function decodeSmartContractError(error: unknown): string {
  console.log("[decodeSmartContractError] Raw error:", error);

  // Prioritize custom contract errors, then fall back to generic errors
  const customError = getCustomContractError(error);
  console.log("[decodeSmartContractError] Custom error decoded:", customError);

  if (customError && customError !== "Unknown error") {
    return customError;
  }

  const genericError = getContractError(error);
  console.log("[decodeSmartContractError] Generic error decoded:", genericError);

  return genericError || "Failed to process transaction";
}
