import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // since you're using UUID
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
  },
  description: {
    header: { type: String, required: true },
    summary: { type: String, required: true },
    points: [{ type: String, required: true }],
    footer: { type: String, required: true },
  },
  picture: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
    match: /^0x[a-fA-F0-9]{40}$/,
  },
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;