/*
# Create lesson_progress table for per-lesson completion tracking

1. Purpose
- Single-tenant learning app (no sign-in). Stores quiz progress per lesson
  so the home screen can show a real "Completed" badge only for lessons
  the player actually finished, and a percentage progress otherwise.

2. New Tables
- `lesson_progress`
- `lesson_id` (integer, primary key; matches lesson index 0-5)
- `best_correct` (integer, highest correct-answer count achieved in one run)
- `completed` (boolean, true once the lesson was finished successfully)
- `updated_at` (timestamptz, auto-updated)

3. Security
- Enable RLS on `lesson_progress`.
- Grant SELECT, INSERT, UPDATE to `anon` + `authenticated` because this is
  a no-sign-in app where progress is intentionally shared/public.
- Separate SELECT/INSERT/UPDATE policies scoped TO anon, authenticated.
  DELETE is intentionally not granted.

4. Notes
- `best_correct` uses a GREATEST upsert so a worse later run never
  overwrites a better previous score.
*/

CREATE TABLE IF NOT EXISTS lesson_progress (
  lesson_id integer PRIMARY KEY,
  best_correct integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON lesson_progress TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_lesson_progress" ON lesson_progress;
CREATE POLICY "anon_select_lesson_progress" ON lesson_progress
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lesson_progress" ON lesson_progress;
CREATE POLICY "anon_insert_lesson_progress" ON lesson_progress
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lesson_progress" ON lesson_progress;
CREATE POLICY "anon_update_lesson_progress" ON lesson_progress
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
