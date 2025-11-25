// backend/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Ensure dotenv is loaded
dotenv.config();

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL?.trim() || "https://pozyefnlhopwyxgbphyg.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvenllZm5saG9wd3l4Z2JwaHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTc2MjgsImV4cCI6MjA3ODE3MzYyOH0.NCg66_BKkTuny_Xvu0TKJeB9v6UOCOD5DX2VqYlaD20";

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