import express from "express";
import cors from "cors";

import tasksData from "../routes/tasksData.js";
import usersData from "../routes/usersData.js";
import authRoutes from "../routes/authRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://TeamChain.netlify.app",
    "https://TeamChain.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Health check endpoint - tests main database connectivity
app.get("/", async (req, res) => {
  try {
    const API_BASE_URL = process.env.API_URL || "http://localhost:4000";

    // Test connectivity to main database by pinging the tasks endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response1 = await fetch(`${API_BASE_URL}/teamChain_users`, {
      signal: controller.signal,
      headers: {
        Authorization: `${process.env.JWT_SECRET}`,
      },
    });

    const response2 = await fetch(`${API_BASE_URL}/teamChain_tasks`, {
      signal: controller.signal,
      headers: {
        Authorization: `${process.env.JWT_SECRET}`,
      },
    });

    clearTimeout(timeoutId);
    const isDatabaseActive = response1.ok && response2.ok;

    res.json({
      message: "TeamChain API is running!",
      databaseStatus: isDatabaseActive ? "active" : "inactive",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      message: "TeamChain API is running!",
      databaseStatus: "inactive",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksData);
app.use("/api/users", usersData);

app.listen(5000, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:5000`);
})

//export default app;