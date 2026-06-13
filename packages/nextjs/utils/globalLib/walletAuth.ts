// utils/lib/walletAuth.ts
import axios from 'axios';
import { getAccount, signMessage } from '@wagmi/core'; // or your wallet library (etherjs, viem)
import { wagmiConfig } from '@/services/web3/wagmiConfig'; // adjust path to your wagmi config

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface JwtResponse {
  token: string;
}

/** Fetch a fresh nonce from the backend */
export async function fetchNonce(address: string): Promise<string> {
  const res = await axios.get<{ nonce: string }>(`${API_BASE}/api/auth/nonce`, {
    params: { address },
  });
  return res.data.nonce;
}

/** Sign the nonce using the connected wallet (wagmi example) */
export async function signNonceWithWallet(nonce: string): Promise<string> {
  const { address, connector } = getAccount(wagmiConfig);
  if (!address || !connector) throw new Error('Wallet not connected');

  // Use wagmi's signMessage (or ethers.getSigner().signMessage)
  const signature = await signMessage(wagmiConfig, {
    message: nonce,
    account: address,
  });
  return signature;
}

/** Exchange signature + address + nonce for a JWT */
export async function exchangeForJwt(
  address: string,
  nonce: string,
  signature: string
): Promise<string> {
  const res = await axios.post<JwtResponse>(
    `${API_BASE}/api/auth/verify`, // adjust endpoint if needed
    { address, nonce, signature },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data.token;
}

/** High-level: get a valid JWT, caching it in memory/localStorage */
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getValidJwt(address: string, forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const nonce = await fetchNonce(address);
  const signature = await signNonceWithWallet(nonce);
  const token = await exchangeForJwt(address, nonce, signature);

  // Cache token (example: 1 hour expiry, adjust based on your JWT expiration)
  cachedToken = token;
  tokenExpiry = Date.now() + 60 * 60 * 1000;

  // Optional: store in localStorage for persistence
  localStorage.setItem('wallet_jwt', token);
  localStorage.setItem('wallet_jwt_expiry', tokenExpiry.toString());

  return token;
}

/** Load cached token from localStorage on app start */
export function initCachedToken(): void {
  const stored = localStorage.getItem('wallet_jwt');
  const expiry = localStorage.getItem('wallet_jwt_expiry');
  if (stored && expiry && Date.now() < parseInt(expiry)) {
    cachedToken = stored;
    tokenExpiry = parseInt(expiry);
  }
}