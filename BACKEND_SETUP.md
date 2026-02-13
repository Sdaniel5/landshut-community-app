# Backend Setup Guide - Supabase Configuration

This document describes the required Supabase backend configuration for the Landshut Community App v2.

## 🗄️ Database Tables

### 1. Create `user_profiles` Table

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  karma INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Index
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
```

### 2. Modify `reports` Table

```sql
-- Add new columns to existing reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS license_plate TEXT,
ADD COLUMN IF NOT EXISTS karma INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
CREATE POLICY "Anyone can view reports"
  ON reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;
CREATE POLICY "Authenticated users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for user reports
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
```

### 3. Create `report_votes` Table

```sql
-- Track individual votes on reports
CREATE TABLE report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- Enable RLS
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view votes"
  ON report_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON report_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON report_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON report_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_report_votes_report_id ON report_votes(report_id);
CREATE INDEX idx_report_votes_user_id ON report_votes(user_id);
```

### 4. Create `report_verifications` Table (Optional - Community Verification)

```sql
-- Track community verifications
CREATE TABLE report_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- Enable RLS
ALTER TABLE report_verifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view verifications"
  ON report_verifications FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can verify"
  ON report_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_report_verifications_report_id ON report_verifications(report_id);
```

### 5. Update `community_messages` Table (if exists)

```sql
-- Ensure user_id is linked
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages"
  ON community_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post messages"
  ON community_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);
```

## 📦 Storage Buckets

### Create `avatars` Bucket

1. Go to **Storage** in Supabase Dashboard
2. Create new bucket named `avatars`
3. Set as **Public**
4. Configure policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read access
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

## 🔔 Real-time Setup

Enable real-time for these tables:

1. Go to **Database → Replication**
2. Enable real-time for:
   - ✅ `reports`
   - ✅ `community_messages`
   - ✅ `report_votes`
   - ✅ `user_profiles`

## 🔐 Authentication Settings

1. Go to **Authentication → Settings**
2. Configure:
   - ✅ Enable Email/Password auth
   - ✅ Disable email confirmations (or configure SMTP)
   - ✅ Set site URL to your app's URL
   - ✅ Add redirect URLs if needed

## 🔒 Security Settings

### Row Level Security (RLS)

Ensure RLS is enabled on all tables:
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
```

### API Keys

- **anon/public key**: Already in `src/lib/supabase.js`
- Keep the **service_role key** secret (never commit to git)

## 🧪 Database Functions (Optional Enhancements)

### Auto-delete reports at 15 votes

```sql
CREATE OR REPLACE FUNCTION auto_delete_voted_reports()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if report has 15 or more votes
  IF (SELECT votes FROM reports WHERE id = NEW.report_id) >= 15 THEN
    DELETE FROM reports WHERE id = NEW.report_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_delete_voted_reports
  AFTER UPDATE OF votes ON reports
  FOR EACH ROW
  EXECUTE FUNCTION auto_delete_voted_reports();
```

### Update karma on vote

```sql
CREATE OR REPLACE FUNCTION update_user_karma()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment karma for report owner when upvoted
  IF NEW.vote_type = 'up' THEN
    UPDATE user_profiles
    SET karma = karma + 1
    WHERE id = (SELECT user_id FROM reports WHERE id = NEW.report_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_karma
  AFTER INSERT ON report_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_karma();
```

### Update report karma count

```sql
CREATE OR REPLACE FUNCTION update_report_karma()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reports
  SET karma = (
    SELECT COUNT(*) FROM report_votes 
    WHERE report_id = NEW.report_id AND vote_type = 'up'
  )
  WHERE id = NEW.report_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_karma
  AFTER INSERT OR UPDATE OR DELETE ON report_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_report_karma();
```

## ✅ Verification Checklist

After setting up, verify:

- [ ] All tables created successfully
- [ ] RLS policies working (test in Supabase SQL editor)
- [ ] Storage bucket `avatars` created and public
- [ ] Real-time enabled for key tables
- [ ] Authentication configured
- [ ] Test user registration works
- [ ] Test profile creation works
- [ ] Test image upload to avatars bucket
- [ ] Test report creation with user_id
- [ ] Test voting system
- [ ] Verify karma increments correctly

## 🔧 Testing Queries

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public';

-- Test data
SELECT * FROM user_profiles LIMIT 5;
SELECT * FROM reports LIMIT 5;
SELECT * FROM report_votes LIMIT 5;
```

## 📝 Notes

- **Backup**: Always backup your database before running migrations
- **Testing**: Test all policies with different user roles
- **Performance**: Monitor query performance and add indexes as needed
- **Security**: Never expose service_role key in frontend code

---

**Need help?** Check the [Supabase Documentation](https://supabase.com/docs) or ask in the Community feed!
