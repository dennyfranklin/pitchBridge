-- ============================================================
-- PITCHBRIDGE V4 — FULL DATABASE SETUP
-- Run this in Supabase → SQL Editor → New Query
-- ============================================================

-- PROFILES
create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  role text check (role in ('entrepreneur','investor','both')),
  profession text,
  bio text,
  is_admin boolean default false,
  is_verified boolean default false,
  avatar_color text default '#5b4fcf',
  avatar_emoji text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- IDEAS / POSTS
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  body text not null,
  funding_ask text,
  category text default 'Tech',
  likes integer default 0,
  created_at timestamp with time zone default now()
);

-- COMMENTS
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default now()
);

-- FOLLOWS (Network)
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- MESSAGES (Chat)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  body text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  from_user_id uuid references profiles(id) on delete cascade,
  type text,
  message text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- CONNECT REQUESTS
create table if not exists connect_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles(id) on delete cascade,
  to_user_id uuid references profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- NDA REQUESTS
create table if not exists nda_requests (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  investor_id uuid references profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- ============================================================
-- SECURITY (Row Level Security)
-- ============================================================
alter table profiles enable row level security;
alter table ideas enable row level security;
alter table comments enable row level security;
alter table follows enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table connect_requests enable row level security;
alter table nda_requests enable row level security;

-- PROFILES policies
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users insert own profile" on profiles for insert with check (auth.uid()=id);
create policy "Users update own profile" on profiles for update using (auth.uid()=id);

-- IDEAS policies
create policy "Anyone can read ideas" on ideas for select using (true);
create policy "Auth users post ideas" on ideas for insert with check (auth.uid()=user_id);
create policy "Users update own ideas" on ideas for update using (auth.uid()=user_id);
create policy "Anyone update likes" on ideas for update using (true);
create policy "Users delete own ideas" on ideas for delete using (auth.uid()=user_id);

-- COMMENTS policies
create policy "Anyone read comments" on comments for select using (true);
create policy "Auth users comment" on comments for insert with check (auth.uid()=user_id);
create policy "Users delete own comments" on comments for delete using (auth.uid()=user_id);

-- FOLLOWS policies
create policy "Anyone read follows" on follows for select using (true);
create policy "Auth users follow" on follows for insert with check (auth.uid()=follower_id);
create policy "Users unfollow" on follows for delete using (auth.uid()=follower_id);

-- MESSAGES policies
create policy "Users read own messages" on messages for select using (auth.uid()=sender_id or auth.uid()=receiver_id);
create policy "Auth users send messages" on messages for insert with check (auth.uid()=sender_id);

-- NOTIFICATIONS policies
create policy "Users read own notifs" on notifications for select using (auth.uid()=user_id);
create policy "Auth users insert notifs" on notifications for insert with check (true);
create policy "Users update own notifs" on notifications for update using (auth.uid()=user_id);

-- CONNECT REQUESTS policies
create policy "Users read own requests" on connect_requests for select using (auth.uid()=from_user_id or auth.uid()=to_user_id);
create policy "Auth users insert requests" on connect_requests for insert with check (auth.uid()=from_user_id);
create policy "Admin update requests" on connect_requests for update using (true);

-- NDA policies
create policy "Investors insert nda" on nda_requests for insert with check (auth.uid()=investor_id);
create policy "Users read nda" on nda_requests for select using (auth.uid()=investor_id);

-- ============================================================
-- STORAGE (for profile photo uploads)
-- ============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Anyone read avatars" on storage.objects for select using (bucket_id='avatars');
create policy "Auth users upload avatars" on storage.objects for insert with check (bucket_id='avatars' and auth.uid() is not null);
create policy "Users update own avatar" on storage.objects for update using (bucket_id='avatars' and auth.uid() is not null);

-- ============================================================
-- REALTIME (for live chat)
-- ============================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- PITCHES (full pitch submissions)
create table if not exists pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  user_name text, user_email text,
  problem text, target_customer text, market_size text,
  differentiation text, competitors text, has_product text,
  users_count text, monthly_revenue text, growth_rate text, loi text,
  funding_ask text, funding_use text, equity_offered text,
  prev_funding text, valuation text, founders text,
  employees text, advisors text, business_model text,
  burn_rate text, runway text, profitable_when text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);
alter table pitches enable row level security;
create policy "Users read own pitches" on pitches for select using (auth.uid()=user_id);
create policy "Auth users submit pitches" on pitches for insert with check (auth.uid()=user_id);
create policy "Admin update pitches" on pitches for update using (true);

-- Add images and video columns to ideas table (run if not already added)
alter table ideas add column if not exists images text[];
alter table ideas add column if not exists video_url text;

-- Add meta column to notifications for routing
alter table notifications add column if not exists meta text;

-- Add pitches table
create table if not exists pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  user_name text, user_email text,
  problem text, target_customer text, market_size text,
  differentiation text, competitors text, has_product text,
  users_count text, monthly_revenue text, growth_rate text, loi text,
  funding_ask text, funding_use text, equity_offered text,
  prev_funding text, valuation text, founders text,
  employees text, advisors text, business_model text,
  burn_rate text, runway text, profitable_when text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);
alter table pitches enable row level security;
create policy "Users read own pitches" on pitches for select using (auth.uid()=user_id);
create policy "Auth users submit pitches" on pitches for insert with check (auth.uid()=user_id);
create policy "Admin update pitches" on pitches for update using (true);

-- Add is_read to messages
alter table messages add column if not exists is_read boolean default false;

-- Update connect_requests to allow anyone to insert
drop policy if exists "Auth users insert requests" on connect_requests;
create policy "Auth users insert requests" on connect_requests for insert with check (auth.uid()=from_user_id);
create policy "Users read own connect requests" on connect_requests for select using (auth.uid()=from_user_id or auth.uid()=to_user_id);
create policy "Users update own connect requests" on connect_requests for update using (auth.uid()=to_user_id or auth.uid()=from_user_id);
