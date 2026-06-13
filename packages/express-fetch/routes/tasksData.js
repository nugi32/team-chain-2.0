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

import {taskSchema} from "../models/tasks.js"

const router = express.Router()

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many tasks created, please try again later",
})

// ownership check pakai mongoose
const taskOwnershipCheck = ownershipMiddleware(async (req) => {
  const API_BASE_URL = process.env.API_URL || "http://localhost:8000";
  const response = await fetch(`${API_BASE_URL}/tasks/${req.params.id}`, {
    headers: {
      Authorization: req.headers.authorization || "",
    },
  });
  if (!response.ok) return null;
  return await response.json();
})

router.get("/", getTasks)
router.get("/:id", getTask)

router.post("/", authMiddleware, 
  //createLimiter, 
  createTask)

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