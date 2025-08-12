import { createClient } from "@supabase/supabase-js";

// ฟังก์ชันสำหรับตรวจสอบตัวแปรสภาพแวดล้อม
const checkEnvVariables = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Supabase] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return false;
  }
  return true;
};

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSimulationMode = process.env.NEXT_PUBLIC_SIMULATION_MODE === "true";

  // If simulation mode is enabled, return a mock client
  if (isSimulationMode) {
    console.log("[Supabase] Running in simulation mode, using mock client");
    return createClient("https://example.supabase.co", "simulation-mode-key");
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Supabase] Using fallback values for development only");
      return createClient(
        "https://example.supabase.co",
        "fallback-key-for-development"
      );
    } else {
      throw new Error(
        "[Supabase] Environment variables missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("[Supabase] Error creating client:", error);
    console.warn("[Supabase] Falling back to simulation mode");
    return createClient("https://example.supabase.co", "error-fallback-key");
  }
};
