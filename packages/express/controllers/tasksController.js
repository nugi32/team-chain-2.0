import { createTaskSchema } from "../models/tasks.js"
import Task from "../schema/tasks.js"

// GET all
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET single
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// CREATE
export const createTask = async (req, res) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      })
    }

    const newTask = new Task({
      ...value,
      owner: req.user.address.toLowerCase(), // tetap secure
    })

    const saved = await newTask.save()

    res.status(201).json(saved)
  } catch (error) {
    console.error("Create task error:", error)
    res.status(400).json({ message: error.message })
  }
}

// UPDATE
export const updateTask = async (req, res) => {
  try {
    const updateData = { ...req.body }

    // ❗ penting: jangan allow owner diubah
    delete updateData.owner

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// DELETE
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id)

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json({ message: "Task deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}