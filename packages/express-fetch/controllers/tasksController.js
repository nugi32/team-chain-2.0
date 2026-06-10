import { createTaskSchema } from "../models/tasks.js";
import dotenv from "dotenv";
dotenv.config();

const API_BASE_URL = process.env.API_URL || "http://localhost:4000";

console.log( API_BASE_URL);
console.log(process.env.JWT_SECRET);

// Helper function to perform fetch with timeout and common headers
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `${process.env.JWT_SECRET}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// GET all tasks
export const getTasks = async (req, res) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ message: "Failed to fetch tasks" });
    }
    const tasks = await response.json();
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET single task
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: "Task not found" });
      }
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ message: "Failed to fetch task" });
    }
    const task = await response.json();
    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE task
export const createTask = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Add owner from authenticated user
    const taskData = {
      ...value,
      owner: req.user.address.toLowerCase(),
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ message: "Failed to create task" });
    }

    const savedTask = await response.json();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(400).json({ message: error.message });
  }
};

// UPDATE task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Prevent owner from being updated
    delete updateData.owner;

    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: "Task not found" });
      }
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ message: "Failed to update task" });
    }

    const updatedTask = await response.json();
    res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: "Task not found" });
      }
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ message: "Failed to delete task" });
    }

    // Some APIs return the deleted task or just a success message
    // Here we assume a success message or empty response
    const result = await response.json().catch(() => ({}));
    res.json(result.message ? result : { message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: error.message });
  }
};