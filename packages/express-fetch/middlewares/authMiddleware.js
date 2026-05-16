import { verifyToken } from "../services/tokenService.js"

// Extend Express Request to include user data

/**
 * Auth Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 *
 * Expected header format: Authorization: Bearer <token>
 */
export function authMiddleware(
  req,
  res,
  next
) {
  try {
    const authHeader = req.headers.authorization

    // Check if authorization header exists
    if (!authHeader) {
      res.status(401).json({
        error: "Missing authorization header",
      })
      return
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        error: "Invalid authorization header format. Use: Bearer <token>",
      })
      return
    }

    const token = parts[1]

    // Verify and decode token
    const decoded = verifyToken(token)

    if (!decoded) {
      res.status(401).json({
        error: "Invalid or expired token",
      })
      return
    }

    // Attach decoded payload to request
    req.user = decoded

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
}
