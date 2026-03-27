# PitchBridge V6 — Setup Guide

## Step 1 — Add your keys to index.html (search for each):
1. YOUR_SUPABASE_URL_HERE
2. YOUR_SUPABASE_ANON_KEY_HERE
3. YOUR_EMAILJS_SERVICE_ID
4. YOUR_EMAILJS_USER_TEMPLATE_ID    ← Template 1: confirmation to entrepreneur
5. YOUR_EMAILJS_COMPANY_TEMPLATE_ID ← Template 2: all answers to company
6. YOUR_EMAILJS_PUBLIC_KEY
7. YOUR_COMPANY_EMAIL_HERE

## Step 2 — EmailJS Template Setup (IMPORTANT)
BOTH templates must have exactly these variables:
  To:      {{to_email}}
  Subject: {{subject}}
  Body:    {{message}}

Template 1 sends confirmation to entrepreneur
Template 2 sends all 22 answers to your company email

## Step 3 — Run database.sql in Supabase SQL Editor
This adds: images, video_url, reply_to, is_read columns

## Step 4 — Make yourself Admin
Supabase → Table Editor → profiles → is_admin = true

## Step 5 — Upload index.html + netlify.toml to Netlify
