import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    match: /^0x[a-fA-F0-9]{40}$/,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
  },
  github: {
    type: String,
    required: true,
  },
  linkedin: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Developer", "Designer", "Project Manager"],
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  description: {
    header: { type: String, required: true },
    summary: { type: String, required: true },
    points: [{ type: String, required: true }],
    footer: { type: String, required: true },
  },
  owner: {
    type: String,
    required: true,
    match: /^0x[a-fA-F0-9]{40}$/,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;