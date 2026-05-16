import { createUserSchema } from "../models/users.js";

const API_BASE_URL = process.env.API_URL || "http://localhost:4000";

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

// GET semua user (public endpoint - no auth required)
export const getAllUsers = async (_req, res) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ error: "Failed to fetch users" });
    }
    const users = await response.json();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST tambah user (create profile)
// ✅ Protected with auth + rate limiting
export const createUser = async (req, res) => {
  try {
    // ✅ Validate request body
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // ✅ CRITICAL: Add owner from authenticated user
    const userData = {
      ...value,
      owner: req.user.walletAddress,
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}`, {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        Authorization: req.headers.authorization, // forward auth token
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ error: "Failed to create user" });
    }

    const result = await response.json();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUT update user berdasarkan id
// ✅ Protected with auth + ownership middleware
export const updateUser = async (req, res) => {
  try {
    // No need for ObjectId validation – the external API will handle ID format validation
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // ✅ CRITICAL: Never allow client to change owner
    const updateData = { ...req.body };
    delete updateData.owner;

    const response = await fetchWithTimeout(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "User not found" });
      }
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ error: "Failed to update user" });
    }

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE user berdasarkan id
// ✅ Protected with auth + ownership middleware
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "User not found" });
      }
      const errorText = await response.text();
      console.error(errorText);
      return res.status(response.status).json({ error: "Failed to delete user" });
    }

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};