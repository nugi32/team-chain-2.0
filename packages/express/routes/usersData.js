import { ObjectId } from "mongodb"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { ownershipMiddleware } from "../middlewares/ownershipMiddleware.js"
import rateLimit from "express-rate-limit"
import express from "express"
import { getAllUsers, createUser, updateUser, deleteUser } from "../controllers/usersController.js"

const router = express.Router()

// Rate limiting for creation endpoints
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 user profiles per hour
  message: "Too many user profiles created, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})

const taskOwnershipCheck = ownershipMiddleware(async (req) => {
  return await Task.findById(req.params.id)
})


// GET semua user (public endpoint - no auth required)
router.get("/", getAllUsers)

// POST tambah user (create profile)
// ✅ Protected with auth + rate limiting
router.post(
  "/",
  authMiddleware,
  createLimiter,
  createUser
)

// PUT update user berdasarkan id
// ✅ Protected with auth + ownership middleware
router.put(
  "/:id",
  authMiddleware,
  taskOwnershipCheck,
  updateUser
)

// DELETE user berdasarkan id
// ✅ Protected with auth + ownership middleware
router.delete(
  "/:id",
  authMiddleware,
  taskOwnershipCheck
  , deleteUser
)

export default router