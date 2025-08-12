import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' +
      '!!! WARNING: Supabase URL or service key not set.           !!!\n' +
      '!!! Using placeholder values. The app will not function     !!!\n' +
      '!!! correctly at runtime without real environment variables.!!!\n' +
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    );
}

// Note: this client has admin privileges and should only be used on the server.
// The || fallbacks are essential for the build process to succeed when env vars are not provided.
export const supabaseAdmin = createClient(
  supabaseUrl || 'http://localhost:54321',
  serviceRoleKey || 'placeholder-key-for-build-only'
)
