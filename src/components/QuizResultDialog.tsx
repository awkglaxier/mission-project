import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, HeartCrack, Home, RotateCcw, Star, Trophy, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';
import { formatDuration } from '@/lib/time';

interface QuizResultDialogProps {
    lessonTitle: string;
    hearts: number;
    correctCount: number;
    total: number;
    xpEarned: number;
    perfect: boolean;
    elapsedSeconds: number;
    resultMsg: string | null;
    onExit: () => void;
    onRetry: () => void;
}

export default function QuizResultDialog({
    lessonTitle,
    hearts,
    correctCount,
    total,
    xpEarned,
    perfect,
    elapsedSeconds,
    resultMsg,
    onExit,
    onRetry,
}: QuizResultDialogProps) {
    const { t } = useLang();
    const passed = hearts > 0;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const stars = !passed ? 0 : accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : accuracy > 0 ? 1 : 0;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onExit();
        };
        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onExit]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="quiz-result-title"
                aria-describedby="quiz-result-desc"
                className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-white/60 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                initial={{ opacity: 0, y: 28, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
                <motion.div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl ${passed ? 'bg-emerald-300/40 dark:bg-emerald-500/20' : 'bg-rose-300/40 dark:bg-rose-500/20'}`}
                    animate={{ x: [0, -14, 0], y: [0, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -bottom-20 -left-14 h-52 w-52 rounded-full blur-3xl ${passed ? 'bg-sky-300/40 dark:bg-sky-500/20' : 'bg-orange-300/40 dark:bg-orange-500/20'}`}
                    animate={{ x: [0, 12, 0], y: [0, -8, 0], scale: [1, 0.92, 1] }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                />

                <button
                    onClick={onExit}
                    aria-label={t.close}
                    className="absolute right-4 top-4 z-10 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative max-h-[calc(90vh-3rem)] overflow-y-auto overscroll-contain">
                    <div className="relative mx-auto h-24 w-24">
                        <motion.span
                            aria-hidden="true"
                            className={`absolute inset-0 rounded-full ${passed ? 'bg-emerald-400/25' : 'bg-rose-400/25'}`}
                            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            initial={{ scale: 0, rotate: -24 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.08 }}
                            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-xl ${passed
                                ? 'from-emerald-400 to-sky-500 shadow-emerald-500/30'
                                : 'from-rose-400 to-orange-400 shadow-rose-500/30'
                                }`}
                        >
                            {passed ? <Trophy className="h-11 w-11" /> : <HeartCrack className="h-11 w-11" />}
                        </motion.div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-1.5" aria-label={`${stars} / 3`}>
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                initial={{ scale: 0, rotate: -30, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ delay: 0.22 + i * 0.1, type: 'spring', stiffness: 420, damping: 14 }}
                            >
                                <Star
                                    className={`h-7 w-7 ${i < stars
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                        : 'text-slate-200 dark:text-slate-600'
                                        }`}
                                />
                            </motion.span>
                        ))}
                    </div>

                    <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {lessonTitle}
                    </p>
                    <h2
                        id="quiz-result-title"
                        className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-slate-100"
                    >
                        {passed ? t.lessonComplete : t.outOfHearts}
                    </h2>
                    <p id="quiz-result-desc" className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {passed ? t.resultSubtitle : t.outOfHeartsMsg}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/40">
                            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {t.accuracy}
                            </p>
                            <p className="mt-1 text-xl font-extrabold text-slate-800 dark:text-slate-100">
                                <SlidingNumber number={accuracy} />%
                            </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/40">
                            <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {t.correctAnswers}
                            </p>
                            <p className="mt-1 text-xl font-extrabold text-slate-800 dark:text-slate-100">
                                <SlidingNumber number={correctCount} />
                                <span className="text-slate-400 dark:text-slate-500">/{total}</span>
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-50 py-2 text-sm font-bold text-slate-500 dark:bg-slate-700/40 dark:text-slate-400">
                        <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        {t.time}:{' '}
                        <span className="tabular-nums text-slate-700 dark:text-slate-200">
                            {formatDuration(elapsedSeconds)}
                        </span>
                    </div>

                    {passed && (
                        <div className="mt-4 flex flex-col items-center gap-1.5">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                {t.xpEarned}:{' '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    <SlidingNumber number={xpEarned} /> {t.xp}
                                </span>
                            </p>
                            {perfect && (
                                <p className="font-bold text-emerald-600 dark:text-emerald-400">{t.perfectScore}</p>
                            )}
                            {resultMsg && (
                                <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                    <Star className="h-4 w-4" /> {resultMsg}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-2">
                        <motion.button
                            autoFocus
                            onClick={onExit}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:from-emerald-600 hover:to-sky-600"
                        >
                            <Home className="h-4 w-4" />
                            {t.backHome}
                        </motion.button>
                        {!passed && (
                            <motion.button
                                onClick={onRetry}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-600 transition-colors hover:border-sky-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-sky-400"
                            >
                                <RotateCcw className="h-4 w-4" />
                                {t.retry}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
