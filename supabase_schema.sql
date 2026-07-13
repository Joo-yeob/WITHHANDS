-- Supabase SQL Schema for HandsDex (핸즈덱스)
-- Run this in your Supabase SQL Editor

-- ============================================
-- user_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID,
  login_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  friend_code TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  status_message TEXT DEFAULT '',
  profile_image_url TEXT DEFAULT ''
);

-- ============================================
-- creatures table
-- ============================================
CREATE TABLE IF NOT EXISTS creatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID,
  name TEXT NOT NULL,
  species TEXT,
  types JSONB DEFAULT '[]',
  rarity TEXT DEFAULT 'Common',
  owner_profile_id UUID REFERENCES user_profiles(id),
  description TEXT DEFAULT '',
  fantasy_location TEXT DEFAULT '',
  world_description TEXT DEFAULT '',
  scene_summary TEXT DEFAULT '',
  main_focus TEXT DEFAULT '',
  detected_objects JSONB DEFAULT '[]',
  capture_date TEXT,
  image_url TEXT DEFAULT '',
  primary_colors JSONB DEFAULT '[]',
  is_human BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false
);

-- ============================================
-- friends table
-- ============================================
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID,
  owner_profile_id UUID REFERENCES user_profiles(id),
  friend_profile_id UUID REFERENCES user_profiles(id),
  friend_code TEXT,
  friend_nickname TEXT,
  friend_profile_image_url TEXT DEFAULT ''
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_creatures_owner ON creatures(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_creatures_created ON creatures(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_friends_owner ON friends(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_login_id ON user_profiles(login_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_friend_code ON user_profiles(friend_code);

-- ============================================
-- Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- For development: allow all operations with anon key
-- In production, tighten these policies as needed
CREATE POLICY "Allow all on user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on creatures" ON creatures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on friends" ON friends FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- updated_date trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_date BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER update_creatures_updated_date BEFORE UPDATE ON creatures FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER update_friends_updated_date BEFORE UPDATE ON friends FOR EACH ROW EXECUTE FUNCTION update_updated_date();