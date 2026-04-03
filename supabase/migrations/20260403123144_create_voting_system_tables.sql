/*
  # DecVote Admin Panel - Voting System Database

  1. New Tables
    - `elections`
      - `id` (uuid, primary key)
      - `title` (text, election title)
      - `description` (text, election description)
      - `start_date` (timestamptz, when election starts)
      - `end_date` (timestamptz, when election ends)
      - `created_at` (timestamptz, record creation time)
    
    - `candidates`
      - `id` (uuid, primary key)
      - `election_id` (uuid, foreign key to elections)
      - `name` (text, candidate name)
      - `description` (text, candidate description)
      - `emoji` (text, emoji avatar)
      - `created_at` (timestamptz, record creation time)
    
    - `votes`
      - `id` (uuid, primary key)
      - `election_id` (uuid, foreign key to elections)
      - `candidate_id` (uuid, foreign key to candidates)
      - `created_at` (timestamptz, when vote was cast)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (voting system is public)
    - Add policies for authenticated insert/update/delete (admin only)
*/

CREATE TABLE IF NOT EXISTS elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  emoji text DEFAULT '👤',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view elections"
  ON elections
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view candidates"
  ON candidates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view votes"
  ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage elections"
  ON elections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage candidates"
  ON candidates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_candidates_election_id ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);