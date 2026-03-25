# PitchBridge — Final V4 Setup

## Fix these in index.html (search for each):

1. YOUR_SUPABASE_URL_HERE → your Supabase URL
2. YOUR_SUPABASE_ANON_KEY_HERE → your Supabase anon key
3. YOUR_EMAILJS_SERVICE_ID → your EmailJS service ID
4. YOUR_EMAILJS_USER_TEMPLATE_ID → Template for entrepreneur confirmation email
5. YOUR_EMAILJS_COMPANY_TEMPLATE_ID → Template for company email with all 22 answers
6. YOUR_EMAILJS_PUBLIC_KEY → your EmailJS public key
7. YOUR_COMPANY_EMAIL_HERE → your company email

## EmailJS Templates Setup:
Template 1 (EJS_TPL_USER): For entrepreneur confirmation
- To: {{to_email}}
- Subject: {{subject}}
- Body: {{message}}

Template 2 (EJS_TPL_COMPANY): For company with all answers
- To: {{to_email}}
- Subject: {{subject}}
- Body: {{message}}

## Run database.sql in Supabase SQL Editor
## Upload to Netlify — done!
