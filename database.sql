-- ============================================================
-- PITCHBRIDGE COMPLETE DATABASE SETUP
-- Run this in Supabase → SQL Editor → New Query
-- ============================================================

create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text, email text,
  role text check (role in ('entrepreneur','investor','both')),
  profession text, bio text,
  is_admin boolean default false,
  is_verified boolean default false,
  avatar_color text default '#5046e4',
  avatar_emoji text, avatar_url text,
  created_at timestamptz default now()
);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text, body text not null,
  funding_ask text, category text default 'Tech',
  likes integer default 0,
  images text[], video_url text,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  body text not null, is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  from_user_id uuid references profiles(id) on delete cascade,
  type text, message text, is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists connect_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles(id) on delete cascade,
  to_user_id uuid references profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists nda_requests (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  investor_id uuid references profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now()
);

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
  created_at timestamptz default now()
);

-- ENABLE RLS
alter table profiles enable row level security;
alter table ideas enable row level security;
alter table comments enable row level security;
alter table follows enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table connect_requests enable row level security;
alter table nda_requests enable row level security;
alter table pitches enable row level security;

-- POLICIES
create policy "read profiles" on profiles for select using (true);
create policy "insert own profile" on profiles for insert with check (auth.uid()=id);
create policy "update own profile" on profiles for update using (auth.uid()=id);

create policy "read ideas" on ideas for select using (true);
create policy "insert ideas" on ideas for insert with check (auth.uid()=user_id);
create policy "update own ideas" on ideas for update using (auth.uid()=user_id);
create policy "update likes" on ideas for update using (true);
create policy "delete own ideas" on ideas for delete using (auth.uid()=user_id);

create policy "read comments" on comments for select using (true);
create policy "insert comments" on comments for insert with check (auth.uid()=user_id);

create policy "read follows" on follows for select using (true);
create policy "insert follows" on follows for insert with check (auth.uid()=follower_id);
create policy "delete follows" on follows for delete using (auth.uid()=follower_id);

create policy "read own messages" on messages for select using (auth.uid()=sender_id or auth.uid()=receiver_id);
create policy "send messages" on messages for insert with check (auth.uid()=sender_id);

create policy "read own notifs" on notifications for select using (auth.uid()=user_id);
create policy "insert notifs" on notifications for insert with check (true);
create policy "update own notifs" on notifications for update using (auth.uid()=user_id);

create policy "read connect req" on connect_requests for select using (auth.uid()=from_user_id or auth.uid()=to_user_id);
create policy "insert connect req" on connect_requests for insert with check (auth.uid()=from_user_id);
create policy "update connect req" on connect_requests for update using (auth.uid()=to_user_id or auth.uid()=from_user_id);

create policy "insert nda" on nda_requests for insert with check (auth.uid()=investor_id);
create policy "read nda" on nda_requests for select using (auth.uid()=investor_id);

create policy "read own pitches" on pitches for select using (auth.uid()=user_id);
create policy "insert pitches" on pitches for insert with check (auth.uid()=user_id);
create policy "update pitches" on pitches for update using (true);

-- STORAGE
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
create policy "read avatars" on storage.objects for select using (bucket_id='avatars');
create policy "upload avatars" on storage.objects for insert with check (bucket_id='avatars' and auth.uid() is not null);
create policy "update avatars" on storage.objects for update using (bucket_id='avatars' and auth.uid() is not null);

-- REALTIME
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- ============================================================
-- RUN THIS IF YOU ALREADY HAVE THE TABLES (adds media columns)
-- ============================================================
alter table ideas add column if not exists images text[];
alter table ideas add column if not exists video_url text;

-- ============================================================
-- ALSO UPDATE the ideas RLS policy to allow any update (for likes)
-- ============================================================
drop policy if exists "update likes" on ideas;
create policy "update likes" on ideas for update using (true);
