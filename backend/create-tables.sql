-- Quick SQL Script to Create All Tables
-- Copy and paste this into Supabase SQL Editor and run it
-- Based on actual production schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY DEFAULT nextval('users_id_seq'),
  full_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  phone VARCHAR,
  password VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGINT PRIMARY KEY DEFAULT nextval('leaderboard_id_seq'),
  user_id BIGINT UNIQUE,
  xp_total INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id BIGINT PRIMARY KEY DEFAULT nextval('lessons_id_seq'),
  title VARCHAR NOT NULL,
  description TEXT,
  content TEXT,
  content_type VARCHAR DEFAULT 'text',
  level VARCHAR,
  video_url TEXT,
  audio_url TEXT,
  duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lesson Blocks table
CREATE TABLE IF NOT EXISTS lesson_blocks (
  id BIGINT PRIMARY KEY DEFAULT nextval('lesson_blocks_id_seq'),
  lesson_id BIGINT,
  block_type VARCHAR NOT NULL,
  title VARCHAR,
  data JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Lesson Block Progress table
CREATE TABLE IF NOT EXISTS lesson_block_progress (
  id BIGINT PRIMARY KEY DEFAULT nextval('lesson_block_progress_id_seq'),
  user_id BIGINT,
  block_id BIGINT,
  status VARCHAR DEFAULT 'not_started',
  score INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (block_id) REFERENCES lesson_blocks(id)
);

-- Progress table (lesson progress)
CREATE TABLE IF NOT EXISTS progress (
  id BIGINT PRIMARY KEY DEFAULT nextval('progress_id_seq'),
  user_id BIGINT,
  lesson_id BIGINT,
  status VARCHAR DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id BIGINT PRIMARY KEY DEFAULT nextval('quiz_questions_id_seq'),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  module VARCHAR,
  level VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Quiz Progress table
CREATE TABLE IF NOT EXISTS quiz_progress (
  id BIGINT PRIMARY KEY DEFAULT nextval('quiz_progress_id_seq'),
  user_id BIGINT,
  quiz_id BIGINT,
  status VARCHAR DEFAULT 'not_started',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id BIGINT PRIMARY KEY DEFAULT nextval('stories_id_seq'),
  title VARCHAR NOT NULL,
  subtitle VARCHAR,
  description TEXT,
  content TEXT,
  category VARCHAR,
  level VARCHAR,
  image_url TEXT,
  audio_url TEXT,
  estimated_time INTEGER,
  word_count INTEGER,
  xp_reward INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_famous BOOLEAN DEFAULT false
);

-- Story Favorites table
CREATE TABLE IF NOT EXISTS story_favorites (
  id BIGINT PRIMARY KEY DEFAULT nextval('story_favorites_id_seq'),
  user_id BIGINT,
  story_id BIGINT,
  is_favorite BOOLEAN DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (story_id) REFERENCES stories(id)
);

-- Story Progress table
CREATE TABLE IF NOT EXISTS story_progress (
  id BIGINT PRIMARY KEY DEFAULT nextval('story_progress_id_seq'),
  user_id BIGINT,
  story_id BIGINT,
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'not_started',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (story_id) REFERENCES stories(id)
);

