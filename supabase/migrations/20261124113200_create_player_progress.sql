/*
# Create player_progress table for vocabulary quest app

1. Purpose
- Single-tenant learning app (no sign-in). Stores one shared progress row
  for the "player": current streak, best streak, total XP earned, hearts,
  and the last day the player completed a lesson.

2. New Tables
- `player_progress`
- `id` (integer, primary key, fixed to 1)
- `streak` (integer, current consecutive-day streak, default 0)
- `best_streak` (integer, highest streak ever reached, default 0)
- `xp` (integer, total experience points earned, default 0)
- `hearts` (integer, lives remaining, default 5)
- `last_played` (date, the last calendar day a lesson was completed)
- `updated_at` (timestamptz, auto-updated)

3. Security
- Enable RLS on `player_progress`.
- Grant SELECT, INSERT, UPDATE to `anon` + `authenticated` because this is
  a no-sign-in app where progress is intentionally shared/public.
- Four separate CRUD policies scoped TO anon, authenticated. DELETE is
  intentionally not granted (progress should never be removed via the API).

4. Notes
- Row id is fixed at 1 so the app always upserts the same row.
- Seed migration inserts the initial row with id 1.
*/

CREATE TABLE IF NOT EXISTS player_progress (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  xp integer NOT NULL DEFAULT 0,
  hearts integer NOT NULL DEFAULT 5,
  last_played date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON player_progress TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_player_progress" ON player_progress;
CREATE POLICY "anon_select_player_progress" ON player_progress
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_player_progress" ON player_progress;
CREATE POLICY "anon_insert_player_progress" ON player_progress
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_player_progress" ON player_progress;
CREATE POLICY "anon_update_player_progress" ON player_progress
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO player_progress (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
