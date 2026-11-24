export interface PlayerProgress {
    streak: number;
    best_streak: number;
    xp: number;
    hearts: number;
    last_played: string | null;
}

export interface LessonProgressRow {
    lesson_id: number;
    best_correct: number;
    completed: boolean;
    best_time_seconds: number | null;
}

const PROGRESS_KEY = 'vocab-quest-player-progress';
const LESSONS_KEY = 'vocab-quest-lesson-progress';

const DEFAULT_PROGRESS: PlayerProgress = {
    streak: 0,
    best_streak: 0,
    xp: 0,
    hearts: 5,
    last_played: null,
};

function readStorage(key: string): unknown {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Private mode or a full quota should not break the quiz flow.
    }
}

function nonNegativeInt(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : fallback;
}

function normalizeProgress(value: unknown): PlayerProgress {
    const raw = value && typeof value === 'object'
        ? value as Record<string, unknown>
        : {};
    const streak = nonNegativeInt(raw.streak, 0);
    return {
        streak,
        best_streak: Math.max(streak, nonNegativeInt(raw.best_streak, 0)),
        xp: nonNegativeInt(raw.xp, 0),
        hearts: Math.min(5, nonNegativeInt(raw.hearts, DEFAULT_PROGRESS.hearts)),
        last_played: typeof raw.last_played === 'string' ? raw.last_played : null,
    };
}

function normalizeLessonRows(value: unknown): LessonProgressRow[] {
    if (!Array.isArray(value)) return [];

    const rows = new Map<number, LessonProgressRow>();
    for (const item of value) {
        if (!item || typeof item !== 'object') continue;
        const raw = item as Record<string, unknown>;
        const lessonId = raw.lesson_id;
        if (typeof lessonId !== 'number' || !Number.isInteger(lessonId) || lessonId < 0) continue;

        const bestCorrect = nonNegativeInt(raw.best_correct, 0);
        const time = raw.best_time_seconds;
        const bestTime = typeof time === 'number' && Number.isFinite(time) && time > 0
            ? Math.floor(time)
            : null;
        const completed = Boolean(raw.completed);
        const previous = rows.get(lessonId);
        const times = [previous?.best_time_seconds, bestTime].filter(
            (value): value is number => typeof value === 'number' && value > 0,
        );

        rows.set(lessonId, {
            lesson_id: lessonId,
            best_correct: Math.max(previous?.best_correct ?? 0, bestCorrect),
            completed: Boolean(previous?.completed || completed),
            best_time_seconds: times.length > 0 ? Math.min(...times) : null,
        });
    }

    return [...rows.values()].sort((a, b) => a.lesson_id - b.lesson_id);
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
}

export async function fetchProgress(): Promise<PlayerProgress> {
    return normalizeProgress(readStorage(PROGRESS_KEY));
}

export async function completeLesson(
    xpEarned: number,
): Promise<{ streak: number; best_streak: number; streakChanged: boolean }> {
    const current = await fetchProgress();
    const today = todayISO();

    let streak = current.streak;
    let streakChanged = false;
    if (current.last_played === today) {
        // Already played today, streak unchanged.
    } else if (current.last_played === yesterdayISO()) {
        streak = current.streak + 1;
        streakChanged = true;
    } else {
        streak = 1;
        streakChanged = true;
    }

    const best = Math.max(current.best_streak, streak);
    const next: PlayerProgress = {
        ...current,
        streak,
        best_streak: best,
        xp: current.xp + nonNegativeInt(xpEarned, 0),
        hearts: 5,
        last_played: today,
    };
    writeStorage(PROGRESS_KEY, next);

    return { streak, best_streak: best, streakChanged };
}

export async function fetchLessonProgress(): Promise<LessonProgressRow[]> {
    return normalizeLessonRows(readStorage(LESSONS_KEY));
}

export async function saveLessonResult(
    lessonId: number,
    correct: number,
    total: number,
    finished: boolean,
    elapsedSeconds: number,
): Promise<void> {
    const rows = normalizeLessonRows(readStorage(LESSONS_KEY));
    const previous = rows.find((row) => row.lesson_id === lessonId);
    const clampedCorrect = Math.max(0, Math.min(correct, total));
    const bestCorrect = Math.max(previous?.best_correct ?? 0, clampedCorrect);
    const previousTime = previous?.best_time_seconds ?? null;
    const bestTime = finished
        ? previousTime && previousTime > 0
            ? Math.min(previousTime, Math.max(0, Math.floor(elapsedSeconds)))
            : Math.max(0, Math.floor(elapsedSeconds))
        : previousTime;

    const nextRow: LessonProgressRow = {
        lesson_id: lessonId,
        best_correct: bestCorrect,
        completed: Boolean(previous?.completed || finished),
        best_time_seconds: bestTime,
    };
    const nextRows = previous
        ? rows.map((row) => row.lesson_id === lessonId ? nextRow : row)
        : [...rows, nextRow];

    writeStorage(LESSONS_KEY, nextRows);
}

export async function loseHeart(heartsLeft: number): Promise<void> {
    const current = await fetchProgress();
    const next: PlayerProgress = {
        ...current,
        hearts: Math.min(5, nonNegativeInt(heartsLeft, 0)),
    };
    writeStorage(PROGRESS_KEY, next);
}
