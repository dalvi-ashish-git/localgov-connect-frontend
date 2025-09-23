// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Get these values from your Supabase project settings
const SUPABASE_URL = 'https://kbjkpqqcouybdtqiuafo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiamtwcXFjb3V5YmR0cWl1YWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzIxMjcsImV4cCI6MjA3NDAwODEyN30.rUq01v1GaUWEeqe-Cb93yT2ZoDWDFcyK3p8-qrr4hL8';

// Create a single supabase client for use throughout your app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
