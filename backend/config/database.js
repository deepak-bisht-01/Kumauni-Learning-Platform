// backend/config/database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Test the connection
try {
  const [rows] = await db.query("SELECT 1 + 1 AS result");
  console.log("✅ MySQL connected successfully! Test result:", rows[0].result);
} catch (error) {
  console.error("❌ MySQL connection failed:", error.message);
  process.exit(1);
}

export default db;
