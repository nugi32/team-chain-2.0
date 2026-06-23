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
  const API_BASE_URL = process.env.API_URL ;
  
  try {
    // Test connectivity to main database
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 15 second timeout for Vercel

    const response = await fetch(`${API_BASE_URL}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const isDatabaseActive = response.ok;

    res.status(200).json({
      message: "TeamChain API is running!",
      databaseStatus: isDatabaseActive ? "active" : "inactive",
      mainDatabaseUrl: API_BASE_URL,
      statusCode: response.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(200).json({
      message: "TeamChain API is running!",
      databaseStatus: "inactive",
      mainDatabaseUrl: API_BASE_URL,
      error: error.message,
      errorName: error.name,
      timestamp: new Date().toISOString()
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksData);
app.use("/api/users", usersData);

// Export app for Vercel serverless functions
export default app;

// Local development server (only runs outside Vercel environment)
if (process.env.NODE_ENV !== "production") {
  app.listen(5000, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:5000`);
  });
}