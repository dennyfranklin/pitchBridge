# 🚀 PitchBridge V4 — Full Backend Setup

## What's new in V4 (fully backend connected):
✅ Real user signup & login (email + Google)
✅ Posts saved to real database
✅ Real comments on posts
✅ Real follow/unfollow network
✅ Real chat messages (live/realtime)
✅ Real notifications
✅ Profile photos uploaded to Supabase storage
✅ Admin dashboard with real data

---

## STEP 1 — Add your Supabase keys to index.html

Open index.html in Notepad → find these 2 lines:

  const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

Replace with your real keys from:
  supabase.com → Your Project → Settings → API

---

## STEP 2 — Run the database SQL

1. Go to Supabase → SQL Editor → New Query
2. Open the file database.sql from this folder
3. Copy ALL the content
4. Paste it into Supabase SQL Editor
5. Click Run ✅

---

## STEP 3 — Make yourself Admin

1. Sign up on your app first
2. Go to Supabase → Table Editor → profiles
3. Find your row → set is_admin to true
4. You'll see the 🛡 Admin tab when you log in!

---

## STEP 4 — Upload to GitHub & Go Live

1. Upload ALL files in this folder to your GitHub repo
2. GitHub Pages will update automatically
3. Your app is LIVE with full backend! 🎉

---

## Total cost: $0/month
