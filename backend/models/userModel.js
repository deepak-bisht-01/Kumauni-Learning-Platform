// backend/models/userModel.js
import client, { dbType } from "../config/dbClient.js";

class User {
  static async create(userData) {
    const { full_name, email, phone, password } = userData;
    if (dbType === "supabase") {
      const { data, error } = await client
        .from("users")
        .insert({ full_name, email, phone, password })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    } else {
      const [result] = await client.query(
        "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)",
        [full_name, email, phone, password]
      );
      return result.insertId;
    }
  }

  static async findByEmail(email) {
    if (dbType === "supabase") {
      const { data, error } = await client
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      if (error) return null;
      return data;
    } else {
      const [rows] = await client.query("SELECT * FROM users WHERE email = ?", [email]);
      return rows[0];
    }
  }

  static async findById(id) {
    if (dbType === "supabase") {
      const { data, error } = await client
        .from("users")
        .select("id, full_name, email, phone, created_at, last_login")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    } else {
      const [rows] = await client.query(
        "SELECT id, full_name, email, phone, created_at, last_login FROM users WHERE id = ?",
        [id]
      );
      return rows[0];
    }
  }

  static async updateLastLogin(userId) {
    if (dbType === "supabase") {
      const { error } = await client
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
    } else {
      await client.query("UPDATE users SET last_login = NOW() WHERE id = ?", [userId]);
    }
  }
}

export default User;
