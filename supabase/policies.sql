-- Enable Row Level Security (RLS) on all tables
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE dragdrop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dragdrop_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dragdrop_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspot_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (Quiz Content)
-- Allow anyone (anon) to read questions and related data
CREATE POLICY "Allow public read access" ON case_studies FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON questions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON question_options FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON dragdrop_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON dragdrop_targets FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON dragdrop_mappings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON hotspot_areas FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON dropdown_menus FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON dropdown_options FOR SELECT TO anon USING (true);

-- Create policies for user sessions and attempts (Analytics)
-- Allow anyone to create a session
CREATE POLICY "Allow public insert sessions" ON user_sessions FOR INSERT TO anon WITH CHECK (true);
-- Allow reading own session (optional, but good if we want to confirm creation) - actually for now just allow public read for simplicity in this anonymously sessioned app
CREATE POLICY "Allow public read sessions" ON user_sessions FOR SELECT TO anon USING (true);

-- Allow recording attempts
CREATE POLICY "Allow public insert attempts" ON question_attempts FOR INSERT TO anon WITH CHECK (true);
-- Allow reading attempts (linked to session)
CREATE POLICY "Allow public read attempts" ON question_attempts FOR SELECT TO anon USING (true);
