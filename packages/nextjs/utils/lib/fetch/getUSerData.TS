import axios from 'axios';
import { useWalletClient } from "wagmi";
import { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Call the backend to obtain the user ID after a successful authentication.
 * @param method - "wallet" or "github"
 * @param identifier - wallet address OR github username
 * @returns user ID as string
 */
export async function fetchUserIdFromBackend(input: any) {
  try {
    const result = await axios.get(`${BASE_URL}/api/users/${input.id}`);
    return result;

  } catch (error) {
    console.error('Error fetching user ID from backend:', error);
    throw error;
  }
}

export const getFromExpress = async (id: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};


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

}