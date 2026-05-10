import express from "express"
import rateLimit from "express-rate-limit"

import { authMiddleware } from "../middlewares/authMiddleware.js"
import { ownershipMiddleware } from "../middlewares/ownershipMiddleware.js"

import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasksController.js"

import Task from "../schema/tasks.js"

const router = express.Router()

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many tasks created, please try again later",
})

// ownership check pakai mongoose
const taskOwnershipCheck = ownershipMiddleware(async (req) => {
  return await Task.findById(req.params.id)
})

router.get("/", getTasks)
router.get("/:id", getTask)

router.post("/", authMiddleware, createLimiter, createTask)

router.put(
  "/:id",
  authMiddleware,
  taskOwnershipCheck,
  updateTask
)

router.delete(
  "/:id",
  authMiddleware,
  taskOwnershipCheck,
  deleteTask
)

export default router