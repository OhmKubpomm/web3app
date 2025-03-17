import { createClient } from "@supabase/supabase-js"

// ฟังก์ชันสำหรับตรวจสอบตัวแปรสภาพแวดล้อม
const checkEnvVariables = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables. Using fallback values for development.")
    return false
  }
  return true
}

// ฟังก์ชันสำหรับสร้าง Supabase client
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback-key-for-development"

  // ตรวจสอบตัวแปรสภาพแวดล้อมในโหมด development
  if (process.env.NODE_ENV !== "production") {
    checkEnvVariables()
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// สร้าง Supabase client
export const supabaseClient = getSupabaseClient()

