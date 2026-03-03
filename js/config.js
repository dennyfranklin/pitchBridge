// ============================================================
// PITCHBRIDGE — SUPABASE CONFIG
// ============================================================
// Step 1: Go to supabase.com → Your Project → Settings → API
// Step 2: Copy your Project URL and anon/public key below
// Step 3: Save this file
// ⚠️ NEVER share these keys publicly!
// ============================================================

const SUPABASE_URL = 'https://melodic-hamster-146aca.netlify.app/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdndwZW5reHhrenp5amhkbnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzQxMzEsImV4cCI6MjA4ODExMDEzMX0.HNwv2-JWxEHxwS_-W-gJ35ds3RVh2grxhm3_uymQUX0';

// Initialize Supabase
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Sign-In
async function signInWithGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) showToast('❌ Google Sign-In failed: ' + error.message);
}
