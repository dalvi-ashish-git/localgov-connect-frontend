import { createClient } from '@supabase/supabase-js'

// Ab keys code se hatkar environment variables se aayengi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)