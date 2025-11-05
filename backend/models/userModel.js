// backend/models/userModel.js
import db from "../config/database.js";

class User {
  static async create(userData) {
    const { full_name, email, phone, password } = userData;
    const [result] = await db.query(
      "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)",
      [full_name, email, phone, password]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone, created_at, last_login FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async updateLastLogin(userId) {
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [userId]);
  }
}

export default User;
