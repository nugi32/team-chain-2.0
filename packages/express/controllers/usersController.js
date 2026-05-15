import { ObjectId } from "mongodb"
import { createUserSchema } from "../models/users.js"
import User from "../schema/users.js"

// GET semua user (public endpoint - no auth required)
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// POST tambah user (create profile)
// ✅ Protected with auth + rate limiting
export const createUser = async (req, res) => {
  try {
    // ✅ Validate request body (owner will be added by middleware)
    const { error, value } = createUserSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      })
    }

    // ✅ CRITICAL: Add owner from authenticated user
    // We never trust the owner field from the request body
    const userData = {
      ...value,
      owner: req.user.walletAddress,
    }

    const result = await User.insertOne(userData)

    res.status(201).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// PUT update user berdasarkan id
// ✅ Protected with auth + ownership middleware
export const updateUser = async (req, res) => {
  try {

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" })
    }

    // ✅ CRITICAL: Never allow client to change owner
    // Remove owner from update payload if it exists
    const updateData = { ...req.body }
    delete updateData.owner

    const result = await User.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    )

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

// DELETE user berdasarkan id
// ✅ Protected with auth + ownership middleware
export const deleteUser = async (req, res) => {
  try {

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" })
    }

    const result = await User.deleteOne({
      _id: new ObjectId(req.params.id),
    })

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}