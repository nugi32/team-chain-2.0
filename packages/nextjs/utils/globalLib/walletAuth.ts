import { wagmiConfig } from "@/services/web3/wagmiConfig";
import { getAccount, signMessage } from "@wagmi/core";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

interface JwtResponse {
  token: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function fetchNonce(address: string): Promise<string> {
  const res = await axios.get<{ nonce: string }>(`${API_BASE}/api/auth/nonce`, {
    params: { address },
  });

  return res.data.nonce;
}

export async function signNonceWithWallet(nonce: string): Promise<string> {
  const { address, connector } = getAccount(wagmiConfig);

  if (!address || !connector) {
    throw new Error("Wallet not connected");
  }

  return signMessage(wagmiConfig, {
    message: nonce,
    account: address,
  });
}

export async function exchangeForJwt(address: string, nonce: string, signature: string): Promise<string> {
  const res = await axios.post<JwtResponse>(
    `${API_BASE}/api/auth/verify`,
    {
      address,
      nonce,
      signature,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return res.data.token;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("wallet_jwt");
  const expiry = localStorage.getItem("wallet_jwt_expiry");

  if (!token || !expiry) return null;

  const expiryTime = Number(expiry);

  if (Date.now() >= expiryTime) {
    localStorage.removeItem("wallet_jwt");
    localStorage.removeItem("wallet_jwt_expiry");
    return null;
  }

  cachedToken = token;
  tokenExpiry = expiryTime;

  return token;
}

function saveToken(token: string) {
  const expiry = Date.now() + TOKEN_EXPIRY;

  cachedToken = token;
  tokenExpiry = expiry;

  localStorage.setItem("wallet_jwt", token);
  localStorage.setItem("wallet_jwt_expiry", expiry.toString());
}

export async function getValidJwt(address: string, forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!forceRefresh) {
    const storedToken = getStoredToken();

    if (storedToken) {
      return storedToken;
    }
  }

  const nonce = await fetchNonce(address);
  const signature = await signNonceWithWallet(nonce);
  const token = await exchangeForJwt(address, nonce, signature);

  saveToken(token);

  return token;
}

export function clearJwt() {
  cachedToken = null;
  tokenExpiry = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem("wallet_jwt");
    localStorage.removeItem("wallet_jwt_expiry");
  }
}

export function initCachedToken() {
  getStoredToken();
}
