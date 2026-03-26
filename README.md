# PitchBridge V5 — Setup Guide

## Step 1 — Add your keys to index.html
Search for each and replace:

1. YOUR_SUPABASE_URL_HERE → your Supabase Project URL
2. YOUR_SUPABASE_ANON_KEY_HERE → your Supabase anon key
3. YOUR_EMAILJS_SERVICE_ID → your EmailJS Service ID
4. YOUR_EMAILJS_USER_TEMPLATE_ID → Template 1 (entrepreneur confirmation)
5. YOUR_EMAILJS_COMPANY_TEMPLATE_ID → Template 2 (company with all answers)
6. YOUR_EMAILJS_PUBLIC_KEY → your EmailJS Public Key
7. YOUR_COMPANY_EMAIL_HERE → your company email address

## Step 2 — EmailJS Template Setup
BOTH templates need these exact variables:
- To email: {{to_email}}
- Subject: {{subject}}
- Body: {{message}}

Template 1 = sends confirmation to entrepreneur
Template 2 = sends all 22 answers to your company

## Step 3 — Run database.sql in Supabase SQL Editor
IMPORTANT: This adds the images and video_url columns needed for media posts!

## Step 4 — Make yourself Admin
Sign up → Supabase → Table Editor → profiles → set is_admin = true

## Step 5 — Upload to Netlify
Drag the folder → done!
