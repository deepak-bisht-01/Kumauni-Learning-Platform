-- Quick SQL Script to Create All Tables
-- Copy and paste this into Supabase SQL Editor and run it

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS stories (
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
CREATE TABLE IF NOT EXISTS story_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  story_id BIGINT REFERENCES stories(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'not_started',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Story Favorites table
CREATE TABLE IF NOT EXISTS story_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  story_id BIGINT REFERENCES stories(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  UNIQUE(user_id, story_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
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

-- Lesson Blocks: flexible content units per lesson
CREATE TABLE IF NOT EXISTS lesson_blocks (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  block_type VARCHAR(50) NOT NULL, -- e.g., 'text', 'quiz', 'word_meaning', 'sentence_making', 'audio', 'video'
  title VARCHAR(255),
  data JSONB, -- flexible payload: questions, words, sentences, html, urls
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-user progress per block (optional)
CREATE TABLE IF NOT EXISTS lesson_block_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  block_id BIGINT REFERENCES lesson_blocks(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started', -- e.g., 'completed', 'in_progress'
  score INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, block_id)
);

-- Progress table (for lessons)
CREATE TABLE IF NOT EXISTS progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  xp_total INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id BIGINT REFERENCES achievements(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);


-- Quizzes table (optional)
CREATE TABLE IF NOT EXISTS quizzes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50),
  questions_count INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Progress table (optional)
CREATE TABLE IF NOT EXISTS quiz_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  UNIQUE(user_id, quiz_id)
);

-- Assignments table (optional)
CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Progress table (optional)
CREATE TABLE IF NOT EXISTS assignment_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  assignment_id BIGINT REFERENCES assignments(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  UNIQUE(user_id, assignment_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_progress_user ON story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_story ON story_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_level ON stories(level);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_lesson_blocks_lesson ON lesson_blocks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_block_progress_user ON lesson_block_progress(user_id);

