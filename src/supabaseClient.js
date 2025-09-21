import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbjkpqqcouybdtqiuafo.supabase.co' // Yahan apna URL paste karein
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiamtwcXFjb3V5YmR0cWl1YWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzIxMjcsImV4cCI6MjA3NDAwODEyN30.rUq01v1GaUWEeqe-Cb93yT2ZoDWDFcyK3p8-qrr4hL8' // Yahan apni anon key paste karein

export const supabase = createClient(supabaseUrl, supabaseAnonKey)