import { z } from "zod"
import {
  generateNonce,
  verifyNonce,
  consumeNonce,
  verifySignature,
} from "../services/authService.js"
import { generateToken } from "../services/tokenService.js"

// Validation schemas using Zod
const VerifyRequestSchema = z.object({
  nonce: z.string().uuid("Invalid nonce format"),
  signature: z.string().min(10, "Invalid signature"),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
})

/**
 * GET /auth/nonce
 * Generate a fresh nonce for the client to sign
 */
export const getNonce = (_req, res) => {
  try {
    const nonce = generateNonce()

    res.json({
      nonce,
      message: "Please sign this nonce with your wallet",
      ttl: 300, // 5 minutes in seconds
    })
  } catch (error) {
    console.error("Nonce generation error:", error)
    res.status(500).json({ error: "Failed to generate nonce" })
  }
}

/**
 * POST /auth/verify
 * Verify the signed nonce and return JWT token
 *
 * Body:
 * {
 *   nonce: "uuid",
 *   signature: "0x...",
 *   address: "0x..."
 * }
 */
export const verify = async (req, res) => {
  try {
    // Validate request body
    const validation = VerifyRequestSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: validation.error,
      })
    }

    const { nonce, signature, address } = validation.data

    // ✅ CRITICAL: Verify nonce exists and hasn't expired or been used
    if (!verifyNonce(nonce)) {
      return res.status(401).json({
        error: "Invalid or expired nonce",
      })
    }

    // ✅ CRITICAL: Verify signature and recover address
    const recoveredAddress = verifySignature(nonce, signature)

    if (!recoveredAddress) {
      return res.status(401).json({
        error: "Invalid signature",
      })
    }

    // ✅ CRITICAL: Compare recovered address with provided address (case-insensitive)
    // We do NOT trust the address from the request body
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        error: "Address mismatch - signature does not match the provided address",
      })
    }

    // ✅ CRITICAL: Consume nonce to prevent replay attacks
    consumeNonce(nonce)

    // ✅ Generate JWT with only the address
    const token = generateToken(recoveredAddress)

    res.json({
      token,
      address: recoveredAddress,
      expiresIn: "24h",
    })
  } catch (error) {
    console.error("Verify error:", error)
    res.status(500).json({ error: "Verification failed" })
  }
}
