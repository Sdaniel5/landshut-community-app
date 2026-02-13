-- Landshut Community App - Supabase Schema
-- ⚠️ WICHTIG: Keine Kennzeichen-Speicherung (Datenschutz!)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Reports Table (Blitzer & Zivilstreife)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('blitzer', 'zivilstreife')),
    street VARCHAR(255) NOT NULL,
    description TEXT,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Community Messages Table
CREATE TABLE community_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_votes ON reports(votes);
CREATE INDEX idx_reports_coordinates ON reports USING GIST(coordinates);
CREATE INDEX idx_messages_created_at ON community_messages(created_at DESC);
CREATE INDEX idx_messages_user_id ON community_messages(user_id);

-- Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reports
-- Anyone can view reports
CREATE POLICY "Reports are viewable by everyone"
    ON reports FOR SELECT
    USING (true);

-- Only authenticated users can insert reports
CREATE POLICY "Authenticated users can insert reports"
    ON reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update (vote on) reports
CREATE POLICY "Authenticated users can update reports"
    ON reports FOR UPDATE
    USING (auth.role() = 'authenticated');

-- RLS Policies for Community Messages
-- Anyone can view messages
CREATE POLICY "Messages are viewable by everyone"
    ON community_messages FOR SELECT
    USING (true);

-- Only authenticated users can insert messages
CREATE POLICY "Authenticated users can insert messages"
    ON community_messages FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Function to auto-delete reports with >= 15 votes
CREATE OR REPLACE FUNCTION delete_high_vote_reports()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.votes >= 15 THEN
        DELETE FROM reports WHERE id = NEW.id;
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-delete reports
CREATE TRIGGER trigger_delete_high_vote_reports
    AFTER UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION delete_high_vote_reports();

-- Function to clean old messages (optional: keep last 1000 messages)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM community_messages
    WHERE id NOT IN (
        SELECT id FROM community_messages
        ORDER BY created_at DESC
        LIMIT 1000
    );
END;
$$ LANGUAGE plpgsql;

-- Sample data (for testing)
INSERT INTO reports (type, street, description, coordinates, votes) VALUES
('blitzer', 'Altstadt 15', 'Fest installiert, beide Richtungen', ST_GeogFromText('POINT(12.1511 48.5376)'), 3),
('zivilstreife', 'Ländgasse', 'Silberner BMW gesichtet', ST_GeogFromText('POINT(12.1520 48.5380)'), 7);
