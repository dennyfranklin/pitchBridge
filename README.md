# PitchBridge V6 Setup

## Step 1 - Add Supabase keys to index.html
Find these lines and replace with your real keys:
  const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
  const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

## Step 2 - Run database.sql in Supabase SQL Editor

## Step 3 - Setup EmailJS (for pitch emails)
1. Go to emailjs.com - sign up free
2. Create a service (Gmail)
3. Create an email template
4. Get your Service ID, Template ID, Public Key
5. Add them to index.html where it says YOUR_EMAILJS_SERVICE_ID etc.
6. Also add YOUR_COMPANY_EMAIL_HERE

## Step 4 - Upload to Netlify
Drag the whole folder to netlify.com - done!
