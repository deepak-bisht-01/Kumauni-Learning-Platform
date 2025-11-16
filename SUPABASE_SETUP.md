# Supabase Setup Guide

This guide will help you set up Supabase as your centralized database for the Kumauni Siksha application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Your project dependencies installed (`npm install` in both `backend` and `frontend` directories)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: Kumauni Siksha (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to be ready (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (keep this secret!)

## Step 3: Set Up Environment Variables

### Backend Environment Variables

Create or update `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration (keep your existing values)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
```

### Frontend Environment Variables (Optional)

If you want to use Supabase directly from the frontend, create `frontend/.env`:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create Database Tables

Go to your Supabase project → **SQL Editor** and run the following SQL to create the necessary tables:

```sql
-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Stories table
CREATE TABLE stories (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  content TEXT,
  category VARCHAR(50),
  level VARCHAR(50),
  image_url TEXT,
  audio_url TEXT,
  estimated_time INTEGER,
  word_count INTEGER,
  xp_reward INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story Progress table
CREATE TABLE story_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  story_id BIGINT REFERENCES stories(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'not_started',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Story Favorites table
CREATE TABLE story_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  story_id BIGINT REFERENCES stories(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  UNIQUE(user_id, story_id)
);

-- Lessons table
CREATE TABLE lessons (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  content_type VARCHAR(50) DEFAULT 'text',
  level VARCHAR(50),
  video_url TEXT,
  audio_url TEXT,
  duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress table (for lessons)
CREATE TABLE progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Leaderboard table
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  xp_total INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements table
CREATE TABLE user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id BIGINT REFERENCES achievements(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Flashcards table
CREATE TABLE flashcards (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  english_word VARCHAR(255) NOT NULL,
  kumaoni_word VARCHAR(255) NOT NULL,
  reviewed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table (optional)
CREATE TABLE quizzes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50),
  questions_count INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Progress table (optional)
CREATE TABLE quiz_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  UNIQUE(user_id, quiz_id)
);

-- Assignments table (optional)
CREATE TABLE assignments (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Progress table (optional)
CREATE TABLE assignment_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  assignment_id BIGINT REFERENCES assignments(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  UNIQUE(user_id, assignment_id)
);

-- Create indexes for better performance
CREATE INDEX idx_story_progress_user ON story_progress(user_id);
CREATE INDEX idx_story_progress_story ON story_progress(story_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_level ON stories(level);
CREATE INDEX idx_lessons_level ON lessons(level);
```

## Step 5: Set Up Row Level Security (RLS)

For security, enable Row Level Security on your tables. Run this in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- For now, allow all operations (you should restrict this in production)

-- Users: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Stories: Everyone can read stories
CREATE POLICY "Anyone can read stories" ON stories
  FOR SELECT USING (true);

-- Story Progress: Users can manage their own progress
CREATE POLICY "Users can manage own story progress" ON story_progress
  FOR ALL USING (auth.uid() = user_id);

-- Story Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON story_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Progress: Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

-- Leaderboard: Everyone can read leaderboard
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- Flashcards: Users can manage their own flashcards
CREATE POLICY "Users can manage own flashcards" ON flashcards
  FOR ALL USING (auth.uid() = user_id);
```

**Note**: The above RLS policies use `auth.uid()` which requires Supabase Auth. Since you're using JWT authentication, you may need to adjust these policies or disable RLS temporarily and handle authentication in your backend.

## Step 6: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. You should see:
   ```
   ✅ Supabase connected successfully!
   🚀 Server running on port 5000
   ```

## Step 7: Migrate Existing Data (Optional)

If you have existing MySQL data, you'll need to export it and import it into Supabase. You can:

1. Export your MySQL data to CSV/JSON
2. Use Supabase's Table Editor to import data, or
3. Write a migration script to transfer data

## Troubleshooting

### Connection Issues

- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure your network allows connections to Supabase

### Query Errors

- Make sure all tables are created
- Check that column names match (Supabase uses snake_case by default)
- Verify RLS policies if you're getting permission errors

### Performance

- Add indexes on frequently queried columns
- Use Supabase's query optimization features
- Consider using database functions for complex queries

## Next Steps

1. **Update your frontend** to optionally use Supabase client directly for real-time features
2. **Set up Supabase Auth** if you want to migrate from JWT to Supabase authentication
3. **Configure backups** in Supabase dashboard
4. **Set up monitoring** and alerts

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)



