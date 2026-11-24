import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlayerProgress {
  streak: number;
  best_streak: number;
  xp: number;
  hearts: number;
  last_played: string | null;
}

export async function fetchProgress(): Promise<PlayerProgress> {
  const { data, error } = await supabase
    .from('player_progress')
    .select('streak, best_streak, xp, hearts, last_played')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const { data: inserted, error: insertError } = await supabase
      .from('player_progress')
      .insert({ id: 1 })
      .select('streak, best_streak, xp, hearts, last_played')
      .single();
    if (insertError) throw insertError;
    return inserted;
  }
  return data;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function completeLesson(xpEarned: number): Promise<{ streak: number; best_streak: number; streakChanged: boolean }> {
  const current = await fetchProgress();
  const today = todayISO();

  let streak = current.streak;
  let streakChanged = false;
  if (current.last_played === today) {
    // already played today, streak unchanged
  } else if (current.last_played === yesterdayISO()) {
    streak = current.streak + 1;
    streakChanged = true;
  } else {
    streak = 1;
    streakChanged = true;
  }

  const best = Math.max(current.best_streak, streak);

  const { error } = await supabase
    .from('player_progress')
    .update({
      streak,
      best_streak: best,
      xp: current.xp + xpEarned,
      hearts: 5,
      last_played: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw error;

  return { streak, best_streak: best, streakChanged };
}

export interface LessonProgressRow {
  lesson_id: number;
  best_correct: number;
  completed: boolean;
}

export async function fetchLessonProgress(): Promise<LessonProgressRow[]> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, best_correct, completed');
  if (error) throw error;
  return data ?? [];
}

export async function saveLessonResult(
  lessonId: number,
  correct: number,
  total: number,
  finished: boolean
): Promise<void> {
  const { error } = await supabase
    .from('lesson_progress')
    .upsert({
      lesson_id: lessonId,
      best_correct: correct,
      completed: finished,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'lesson_id', ignoreDuplicates: false });
  if (error) throw error;
}

export async function loseHeart(heartsLeft: number): Promise<void> {
  const { error } = await supabase
    .from('player_progress')
    .update({ hearts: Math.max(0, heartsLeft) })
    .eq('id', 1);
  if (error) throw error;
}
