import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import client, { dbType } from "./config/dbClient.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"; // ✅ NEW
import learningRoutes from "./routes/learningRoutes.js";
import storiesRoutes from "./routes/storiesRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes); // ✅ NEW
app.use("/api/learning", learningRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/quiz", quizRoutes);

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running fine!" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("❌ Stack:", err.stack);
  console.error("❌ Request path:", req.path);
  console.error("❌ Request method:", req.method);
  
  // Don't send stack trace in production
  const isDevelopment = process.env.NODE_ENV !== "production";
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ✅ Start Server After DB Initialization
const PORT = process.env.PORT || 5000;

try {
  if (dbType === "mysql") {
    const [rows] = await client.query("SELECT 1 + 1 AS solution");
    console.log("✅ MySQL connected successfully:", rows[0].solution);
  } else {
    console.log("✅ Using Supabase as database");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("❌ Failed to initialize DB:", error.message);
  process.exit(1);
}