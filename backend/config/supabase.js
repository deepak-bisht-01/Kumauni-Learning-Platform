// backend/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Ensure dotenv is loaded
dotenv.config();

// Get environment variables (REQUIRED - no fallback values for security)
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim();

console.log("Supabase configuration:");
console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("Key:", supabaseKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase configuration missing!");
  console.error("Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file");
  console.error("Current values:", { 
    url: supabaseUrl ? "Found" : "Missing", 
    key: supabaseKey ? "Found" : "Missing" 
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection (simple check)
console.log("✅ Supabase client initialized");

export default supabase;
