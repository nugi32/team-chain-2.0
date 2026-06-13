
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { ownershipMiddleware } from "../middlewares/ownershipMiddleware.js"
import rateLimit from "express-rate-limit"
import express from "express"
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/usersController.js"

const router = express.Router()

// Rate limiting for creation endpoints
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 user profiles per hour
  message: "Too many user profiles created, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})

// ✅ Express-fetch is a proxy layer, so we fetch user from backend to check ownership
const userOwnershipCheck = ownershipMiddleware(async (req) => {
  const API_BASE_URL = process.env.API_URL || "http://localhost:8000";
  const response = await fetch(`${API_BASE_URL}/users/${req.params.id}`, {
    headers: {
      Authorization: req.headers.authorization || "",
    },
  });
  if (!response.ok) return null;
  return await response.json();
})


// GET semua user (public endpoint - no auth required)
router.get("/", getAllUsers)

router.get("/:id", getUserById)
// POST tambah user (create profile)
// ✅ Protected with auth + rate limiting
router.post(
  "/",
  authMiddleware,
//  createLimiter,
  createUser
)

// PUT update user berdasarkan id
// ✅ Protected with auth + ownership middleware
router.put(
  "/:id",
  authMiddleware,
  userOwnershipCheck,
  updateUser
)

// DELETE user berdasarkan id
// ✅ Protected with auth + ownership middleware
router.delete(
  "/:id",
  authMiddleware,
  userOwnershipCheck,
  deleteUser
)

export default router