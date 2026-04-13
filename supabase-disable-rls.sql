-- Temporarily disable RLS until Clerk JWKS is configured in Supabase
-- Data is still scoped by user_id in application queries
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE note_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE note_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
