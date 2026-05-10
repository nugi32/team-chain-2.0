import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me"
const TOKEN_EXPIRY = "24h"

/**
 * Generate JWT token from wallet address
 * Payload contains ONLY the address, no sensitive data
 */
export function generateToken(address) {
  const payload = {
    address: address.toLowerCase(),
  }

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  })

  return token
}

/**
 * Verify and decode JWT token
 * Returns the payload if valid, null if invalid
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}
