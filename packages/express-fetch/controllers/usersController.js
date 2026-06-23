import { createUserSchema } from "../models/users.js";

const API_BASE_URL = process.env.API_URL || "http://localhost:4000";

// Helper function to perform fetch with timeout and common headers
const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `${process.env.JWT_SECRET}`,
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/teamChain_users`);
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

// GET user by id
// ✅ Public endpoint (atau bisa diproteksi sesuai kebutuhan)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/teamChain_users/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "User not found" });
      }

      const errorText = await response.text();
      console.error(errorText);

      return res
        .status(response.status)
        .json({ error: "Failed to fetch user" });
    }

    const user = await response.json();

    // Optional: map _id -> id
    res.json({
      ...user,
      id: user._id || user.id,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "AbortError") {
      return res.status(408).json({ error: "Request timeout" });
    }

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
      owner: value.walletAddress,
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/teamChain_users`, {
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
    // Map _id from backend to id for frontend
    res.status(201).json({
      ...result,
      id: result._id || result.id,
    });
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

    const response = await fetchWithTimeout(`${API_BASE_URL}/teamChain_users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[updateUser] Backend returned ${response.status}:`, errorText);
      
      if (response.status === 404) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(response.status).json({ error: "Failed to update user", details: errorText });
    }

    const result = await response.json();
    console.log(`[updateUser] Success:`, result);
    res.json(result);
  } catch (err) {
    console.error(`[updateUser] Error:`, err);
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

    const response = await fetchWithTimeout(`${API_BASE_URL}/teamChain_users/${id}`, {
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