/**
 * Admin Authentication Middleware
 * Verifies JWT tokens and ensures admin role for protected routes
 */

import jwt from "jsonwebtoken";

/**
 * Middleware function to authenticate admin users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON error response or calls next()
 */
function adminAuth(req, res, next) {
  // Extract Authorization header
  const authHeader = req.headers.authorization;

  // Check if token is provided
  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(" ")[1];

  try {
    // Verify and decode the JWT token
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Check if user has admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Proceed to next middleware/route handler
    next();
    console.log("SECRET BACKEND:", JSON.stringify(process.env.JWT_SECRET));

  } catch (error) {
    console.log("JWT verify error:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
}

export default adminAuth;