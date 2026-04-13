-- Day Planner: Supabase schema migration
-- Run this in the Supabase SQL Editor

-- Helper function to extract user_id from Clerk JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_categories_user ON categories(user_id);

CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_url TEXT,
  date DATE NOT NULL,
  start_hour INTEGER NOT NULL,
  end_hour INTEGER NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_time_blocks_user_date ON time_blocks(user_id, date);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  date DATE,
  sort_order INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);

CREATE TABLE daily_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_daily_notes_user_date ON daily_notes(user_id, date);

CREATE TABLE note_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_note_sections_user ON note_sections(user_id);

CREATE TABLE note_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES note_sections(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_note_pages_user_section ON note_pages(user_id, section_id);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  country_code TEXT DEFAULT 'US',
  latitude DOUBLE PRECISION DEFAULT 41.8781,
  longitude DOUBLE PRECISION DEFAULT -87.6298,
  temp_unit TEXT DEFAULT 'celsius',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Macro: create SELECT/INSERT/UPDATE/DELETE policies for a table
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'categories', 'time_blocks', 'tasks',
    'daily_notes', 'note_sections', 'note_pages',
    'user_preferences'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY "Users can view own %1$s" ON %1$s FOR SELECT USING (user_id = requesting_user_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Users can insert own %1$s" ON %1$s FOR INSERT WITH CHECK (user_id = requesting_user_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Users can update own %1$s" ON %1$s FOR UPDATE USING (user_id = requesting_user_id())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Users can delete own %1$s" ON %1$s FOR DELETE USING (user_id = requesting_user_id())',
      tbl
    );
  END LOOP;
END;
$$;
