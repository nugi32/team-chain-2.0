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
    "https://nugiprofile.netlify.app",
    "https://nugi-profile.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksData);
app.use("/api/users", usersData);

app.listen(5000,  "0.0.0.0",() => {
  console.log(`Server is running on http://localhost:5000`);
})

//export default app;