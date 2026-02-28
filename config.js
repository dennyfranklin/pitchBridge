// ============================================================
// PITCHBRIDGE — SUPABASE CONFIG
// ============================================================
// Step 1: Go to https://supabase.com and create a free account
// Step 2: Create a new project called "pitchbridge"
// Step 3: Go to Project Settings → API
// Step 4: Copy your Project URL and anon/public key below
// ============================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize Supabase client
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
