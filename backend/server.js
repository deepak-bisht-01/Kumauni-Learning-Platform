import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js"; // your MySQL connection/pool
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running fine!" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// ✅ Start Server After DB Connection
const PORT = process.env.PORT || 5000;

try {
  // Optional test query to verify DB connection
  const [rows] = await db.query("SELECT 1 + 1 AS solution");
  console.log("✅ MySQL connected successfully:", rows[0].solution);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("❌ Failed to connect to DB:", error.message);
  process.exit(1);
}
