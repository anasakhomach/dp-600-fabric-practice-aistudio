-- DP-600 Practice App Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  content_markdown TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions Table (Polymorphic - type discriminator)
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  domain VARCHAR(50) NOT NULL CHECK (domain IN ('Prepare', 'Model', 'Analyze', 'Maintain')),
  type VARCHAR(50) NOT NULL DEFAULT 'MultipleChoice' CHECK (type IN ('MultipleChoice', 'DragDrop', 'Hotspot', 'Dropdown')),
  explanation TEXT,
  exhibit_url VARCHAR(255),
  code_snippet TEXT,
  case_study_id INTEGER REFERENCES case_studies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Options Table (for MultipleChoice questions)
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, option_key)
);

-- DragDrop Items Table
CREATE TABLE IF NOT EXISTS dragdrop_items (
  id VARCHAR(50) PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

-- DragDrop Targets Table
CREATE TABLE IF NOT EXISTS dragdrop_targets (
  id VARCHAR(50) PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL
);

-- DragDrop Correct Mappings
CREATE TABLE IF NOT EXISTS dragdrop_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id VARCHAR(50) NOT NULL REFERENCES dragdrop_items(id) ON DELETE CASCADE,
  target_id VARCHAR(50) NOT NULL REFERENCES dragdrop_targets(id) ON DELETE CASCADE,
  UNIQUE(item_id)
);

-- Hotspot Areas Table
CREATE TABLE IF NOT EXISTS hotspot_areas (
  id VARCHAR(50) PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  label VARCHAR(255),
  is_correct BOOLEAN DEFAULT FALSE
);

-- Dropdown Menus Table
CREATE TABLE IF NOT EXISTS dropdown_menus (
  id VARCHAR(50) PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL
);

-- Dropdown Options Table
CREATE TABLE IF NOT EXISTS dropdown_options (
  id VARCHAR(50) PRIMARY KEY,
  menu_id VARCHAR(50) NOT NULL REFERENCES dropdown_menus(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

-- User Sessions Table (anonymous tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Question Attempts Table (analytics)
CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_session ON question_attempts(user_session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON question_attempts(created_at);

-- Insert default case studies
INSERT INTO case_studies (id, title, content_markdown) VALUES
(1, 'Contoso', '# Contoso Case Study

Contoso is a multinational manufacturing company...'),
(2, 'Litware', '# Litware Case Study

Litware is a technology consulting firm...')
ON CONFLICT (id) DO NOTHING;
