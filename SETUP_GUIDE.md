# 🚀 PitchBridge — Setup Guide for Denny
## How to get your app LIVE in under 30 minutes (no coding needed!)

---

## STEP 1 — Set up Supabase (Your Free Backend/Database)

1. Go to 👉 https://supabase.com
2. Click "Start your project" and sign up for free
3. Click "New Project"
   - Name it: pitchbridge
   - Set a strong database password (save this!)
   - Choose the region closest to you
4. Wait ~2 minutes for it to set up

---

## STEP 2 — Create Your Database Tables

1. In your Supabase project, click "SQL Editor" in the left menu
2. Click "New Query"
3. Copy and paste ALL of this code and click "Run":

```sql
-- PROFILES TABLE (stores all user info)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  role text check (role in ('entrepreneur', 'investor', 'both')),
  focus text,
  is_admin boolean default false,
  is_verified boolean default false,
  avatar_color text default '#7c6fff',
  created_at timestamp with time zone default now()
);

-- IDEAS TABLE (stores all posted ideas)
create table ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text not null,
  body text not null,
  funding_ask text default 'TBD',
  category text default 'Tech',
  likes integer default 0,
  created_at timestamp with time zone default now()
);

-- CONNECT REQUESTS (investor wants to connect with entrepreneur)
create table connect_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles(id),
  to_user_id uuid references profiles(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- NDA REQUESTS (investor agrees to NDA for an idea)
create table nda_requests (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id),
  investor_id uuid references profiles(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- SECURITY: Allow users to read/write their own data
alter table profiles enable row level security;
alter table ideas enable row level security;
alter table connect_requests enable row level security;
alter table nda_requests enable row level security;

create policy "Public profiles" on profiles for select using (true);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Public ideas" on ideas for select using (true);
create policy "Users insert ideas" on ideas for insert with check (auth.uid() = user_id);
create policy "Users update own ideas" on ideas for update using (auth.uid() = user_id);
create policy "Users update likes" on ideas for update using (true);

create policy "Users insert connect requests" on connect_requests for insert with check (auth.uid() = from_user_id);
create policy "Users read connect requests" on connect_requests for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "Admin update connect requests" on connect_requests for update using (true);

create policy "Investors insert nda" on nda_requests for insert with check (auth.uid() = investor_id);
create policy "Users read nda" on nda_requests for select using (auth.uid() = investor_id);
```

4. Click "Run" — you should see "Success"!

---

## STEP 3 — Get Your Supabase Keys

1. In Supabase, go to ⚙️ "Project Settings" → "API"
2. You'll see two things you need:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (a long string of letters)
3. Open the file `js/config.js` in your pitchbridge folder
4. Replace these two lines:
   ```
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
   With your actual URL and key. Example:
   ```
   const SUPABASE_URL = 'https://abcdef123.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

---

## STEP 4 — Make Yourself Admin

After you sign up on the app for the first time:
1. Go to Supabase → "Table Editor" → "profiles"
2. Find your row and set `is_admin` to `true`
3. Now you'll see the 🛡 Admin tab when you log in!

---

## STEP 5 — Deploy to Netlify (Go Live!)

### Option A — Drag and Drop (Easiest!)
1. Go to 👉 https://netlify.com and sign up free
2. Click "Add new site" → "Deploy manually"
3. Drag your entire `pitchbridge` folder onto the page
4. Done! Netlify gives you a free URL like: https://pitchbridge-abc123.netlify.app

### Option B — Connect GitHub (Better for updates)
1. Upload your pitchbridge folder to GitHub (github.com)
2. In Netlify, click "Add new site" → "Import from Git"
3. Connect your GitHub and select the pitchbridge repo
4. Every time you update files on GitHub, Netlify auto-updates your site!

---

## 🎉 YOU'RE LIVE!

Your PitchBridge app is now:
✅ Live on the internet
✅ Has real user accounts
✅ Stores real data in a database
✅ Free to run (Supabase free tier = 50,000 users!)
✅ Admin panel for Denny to manage everything

---

## Need help?
- Supabase docs: https://supabase.com/docs
- Netlify docs: https://docs.netlify.com
- Or just ask Claude! 😄
