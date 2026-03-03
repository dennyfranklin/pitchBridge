# 🚀 PitchBridge — Setup Guide for Denny
## Go live in under 30 minutes — no coding needed!

---

## STEP 1 — Add Your Supabase Keys

1. Go to supabase.com → your pitchbridge project
2. Click ⚙️ Settings → API
3. Copy your **Project URL** and **anon/public key**
4. Open `js/config.js` in Notepad
5. Paste them in replacing the placeholder text
6. Save the file ✅

---

## STEP 2 — Run the Database SQL

1. In Supabase → click **SQL Editor** → New Query
2. Paste and run this:

```sql
create table profiles (
  id uuid references auth.users primary key,
  full_name text, email text,
  role text check (role in ('entrepreneur','investor','both')),
  focus text, is_admin boolean default false,
  is_verified boolean default false,
  avatar_color text default '#5b4fcf',
  created_at timestamp with time zone default now()
);
create table ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text, body text not null,
  funding_ask text default 'TBD',
  category text default 'Tech',
  likes integer default 0,
  created_at timestamp with time zone default now()
);
create table connect_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles(id),
  to_user_id uuid references profiles(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);
create table nda_requests (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id),
  investor_id uuid references profiles(id),
  status text default 'pending',
  created_at timestamp with time zone default now()
);
alter table profiles enable row level security;
alter table ideas enable row level security;
alter table connect_requests enable row level security;
alter table nda_requests enable row level security;
create policy "Public profiles" on profiles for select using (true);
create policy "Insert own profile" on profiles for insert with check (auth.uid()=id);
create policy "Update own profile" on profiles for update using (auth.uid()=id);
create policy "Public ideas" on ideas for select using (true);
create policy "Insert ideas" on ideas for insert with check (auth.uid()=user_id);
create policy "Update own ideas" on ideas for update using (auth.uid()=user_id);
create policy "Update likes" on ideas for update using (true);
create policy "Insert connect" on connect_requests for insert with check (auth.uid()=from_user_id);
create policy "Read connect" on connect_requests for select using (auth.uid()=from_user_id or auth.uid()=to_user_id);
create policy "Update connect" on connect_requests for update using (true);
create policy "Insert nda" on nda_requests for insert with check (auth.uid()=investor_id);
create policy "Read nda" on nda_requests for select using (auth.uid()=investor_id);
```

---

## STEP 3 — Make Yourself Admin

1. Sign up on your app first
2. Go to Supabase → Table Editor → profiles
3. Find your row → set `is_admin` to `true`
4. Now you'll see the 🛡 Admin tab!

---

## STEP 4 — Deploy to Vercel (Free!)

1. Go to 👉 vercel.com → sign up free
2. Click "Add New Site" → "Deploy manually"  
3. Drag your entire `pitchbridge_final` folder onto the page
4. Your app is LIVE! 🎉

---

## ✅ You're Done!

Total cost: $0/month
Handles up to: 50,000 users free
Questions? Just ask Claude! 😄
