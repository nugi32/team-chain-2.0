import { ethers } from "ethers"
import { v4 as uuidv4 } from "uuid"

// In-memory nonce storage (with TTL)
// In production, use Redis for distributed systems
const nonceStore = {
  nonce: null,
  createdAt: null,
  used: false
};

const NONCE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Generate a new nonce and store it with TTL
 */
export function generateNonce() {
  const nonce = uuidv4()
  nonceStore[nonce] = {
    nonce,
    createdAt: Date.now(),
    used: false,
  }

  // Schedule cleanup after TTL
  setTimeout(() => {
    delete nonceStore[nonce]
  }, NONCE_TTL)

  return nonce
}

/**
 * Verify nonce exists, is not expired, and hasn't been used yet
 */
export function verifyNonce(nonce) {
  const stored = nonceStore[nonce]

  if (!stored) {
    return false
  }

  // Check if expired
  if (Date.now() - stored.createdAt > NONCE_TTL) {
    delete nonceStore[nonce]
    return false
  }

  // Check if already used
  if (stored.used) {
    return false
  }

  return true
}

/**
 * Mark nonce as used (consumed) to prevent replay attacks
 */
export function consumeNonce(nonce) {
  if (nonceStore[nonce]) {
    nonceStore[nonce].used = true
    // Delete immediately after consuming
    delete nonceStore[nonce]
  }
}

/**
 * Verify signed message and extract wallet address
 * Uses ethers.verifyMessage to recover the signer
 */
export function verifySignature(
  nonce,
  signature
) {
  try {
    // Recover the address that signed the message
    const recoveredAddress = ethers.verifyMessage(nonce, signature)

    // Return normalized (lowercase) address
    return recoveredAddress.toLowerCase()
  } catch (error) {
    console.error("Signature verification failed:", error)
    return null
  }
}
