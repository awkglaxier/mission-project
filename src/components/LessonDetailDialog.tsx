import { useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Brain, CheckCircle2, Clock, Play, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';
import { formatDuration } from '@/lib/time';
import type { Lesson } from '@/lib/lessons';
import type { LessonProgressRow } from '@/lib/progress-store';

interface LessonDetailDialogProps {
    lesson: Lesson;
    progress: LessonProgressRow | null;
    onClose: () => void;
    onStart: () => void;
}

export default function LessonDetailDialog({
    lesson,
    progress,
    onClose,
    onStart,
}: LessonDetailDialogProps) {
    const { t } = useLang();
    const totalPoints = lesson.words.length * 10;
    const bestCorrect = progress?.best_correct ?? 0;
    const points = Math.min(totalPoints, bestCorrect * 10);
    const pct = Math.round((points / totalPoints) * 100);
    const completed = progress?.completed ?? false;
    const bestTime = progress?.best_time_seconds ?? null;
    const LevelIcon = lesson.level === 'advanced' ? Brain : BookOpen;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lesson-detail-title"
                className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
                <button
                    onClick={onClose}
                    aria-label={t.close}
                    className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-3 pr-8">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${lesson.color} text-white`}>
                        <LevelIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {t.levels[lesson.level]} · {lesson.words.length} {t.words}
                        </p>
                        <h2
                            id="lesson-detail-title"
                            className="mt-0.5 text-xl font-extrabold leading-snug text-slate-800 dark:text-slate-100"
                        >
                            {t.units[lesson.id].title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {t.units[lesson.id].desc}
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/30">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {t.bestScore}
                        </span>
                        <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                            <SlidingNumber number={points} />
                            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                                /{totalPoints} {t.xp}
                            </span>
                        </span>
                    </div>
                    <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600/60"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="mt-1 text-right text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <SlidingNumber number={pct} />%
                    </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700">
                        <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {t.bestTime}
                        </p>
                        <p className="mt-0.5 text-lg font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
                            {bestTime !== null ? formatDuration(bestTime) : '—'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700">
                        <CheckCircle2 className={`h-4 w-4 ${completed ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {t.completed}
                        </p>
                        <p className={`mt-0.5 text-sm font-bold ${completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {completed ? t.completed : t.notCompleted}
                        </p>
                    </div>
                </div>

                {!progress && (
                    <p className="mt-3 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {t.noRecord}
                    </p>
                )}

                <motion.button
                    onClick={onStart}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 font-bold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                    <Play className="h-4 w-4 fill-current" />
                    {completed ? t.playAgain : t.startLesson}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
