import { useEffect, useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useWalletClient } from "wagmi";
import { BrowserProvider, ethers } from "ethers";

export const useUsersContractService = () => {
  const { data: walletClient } = useWalletClient();

  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    async function loadSigner() {
      if (!walletClient) {
        setSigner(null);
        return;
      }

      const provider = new BrowserProvider(walletClient.transport);

      const signerInstance = await provider.getSigner();

      setSigner(signerInstance);
    }

    loadSigner();
  }, [walletClient]);

  const { data: contractData } = useScaffoldContract({
    contractName: "UsersContract",
  });

  const contract =
    contractData?.address && contractData?.abi && signer
      ? new ethers.Contract(
        contractData.address,
        contractData.abi,
        signer,
      )
      : null;

  //---------------------------------------------------------
  // wrapper section
  //---------------------------------------------------------

  // state var getters
  async function getUsers() {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const address = await signer.getAddress();

      const result = await contract.Users(address);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Failed to get users:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function getUsedGitUrl(bytecode: string) {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const result = await contract.usedGitURL(bytecode);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Failed to get used Git URL:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function Register(githubURL: string) {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const address = await signer.getAddress();

      const tx = await contract.Register(githubURL, address);
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      console.error("Registration failed:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function UnRegister() {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const address = await signer.getAddress();

      const tx = await contract.Unregister(address);
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      console.error("Unregistration failed:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function withdrawUserFund(amount: number | bigint) {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const address = await signer.getAddress();

      const tx = await contract.withdrawUserFund(address, amount);
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      console.error("Failed to withdraw user fund:", error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function withdrawAllUserFund() {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const address = await signer.getAddress();

      const tx = await contract.withdrawAllUserFund(address);
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  //

  async function pause() {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const tx = await contract.pause();
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async function unpause() {
    try {
      if (!contract || !signer) {
        throw new Error("Contract not initialized");
      }

      const tx = await contract.unpause();
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  return {
    signer,
    contract,
    getUsers,
    getUsedGitUrl,
    Register,
    UnRegister,
    withdrawUserFund,
    withdrawAllUserFund,
    pause,
    unpause,
  };
};