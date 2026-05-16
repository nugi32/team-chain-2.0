import { Router } from "express"
import rateLimit from "express-rate-limit"
import { getNonce, verify } from "../controllers/authController.js"

const router = Router()

// Rate limiting for auth endpoints (stricter than normal)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: "Too many auth attempts, please try again later",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
})

router.get("/nonce", authLimiter, getNonce)
router.post("/verify", authLimiter, verify)

export default router
