import dotenv from "dotenv";
dotenv.config();

const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

let client;
let dbType;

if (hasSupabase) {
  const mod = await import("./supabase.js");
  client = mod.default;
  dbType = "supabase";
} else {
  const mod = await import("./database.js");
  client = mod.default;
  dbType = "mysql";
}

export { dbType };
export default client;