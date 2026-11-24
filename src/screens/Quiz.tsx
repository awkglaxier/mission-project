import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Heart, CheckCircle2, XCircle, Flame, Clock } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { useVoice } from '@/context/VoiceContext';
import { lessons, type Vocab } from '@/lib/lessons';
import { completeLesson, loseHeart, fetchProgress, saveLessonResult } from '@/lib/progress-store';
import { playCorrect, playWrong, playFanfare, playAce } from '@/lib/sounds';
import { formatDuration } from '@/lib/time';
import Celebration from '@/components/Celebration';
import QuizResultDialog from '@/components/QuizResultDialog';
import { AnimateIcon } from '@/components/animate-ui/animate-icon';
import { AnimatedVolumeIcon } from '@/components/animate-ui/icons';

interface QuizProps {
    lessonId: number;
    onExit: () => void;
}

interface QuizItem {
    prompt: Vocab;
    options: Vocab[];
    answerIndex: number;
}

function buildQuiz(words: Vocab[]): QuizItem[] {
    const items: QuizItem[] = [];
    const rounds = [...words];
    rounds.forEach((prompt) => {
        const wrongPool = words.filter((w) => w.word !== prompt.word);
        const wrong = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [...wrong, prompt].sort(() => Math.random() - 0.5);
        items.push({
            prompt,
            options,
            answerIndex: options.indexOf(prompt),
        });
    });
    return items.sort(() => Math.random() - 0.5);
}

export default function Quiz({ lessonId, onExit }: QuizProps) {
    const { t, lang } = useLang();
    const { speak } = useVoice();
    const lesson = lessons[lessonId];
    const [quiz] = useState(() => buildQuiz(lesson.words));
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [finished, setFinished] = useState(false);
    const [resultMsg, setResultMsg] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);
    const [combo, setCombo] = useState(0);
    const [celebrate, setCelebrate] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [autoAdvance, setAutoAdvance] = useState(false);
    const continueRef = useRef<() => Promise<void>>(async () => { });

    useMemo(() => {
        fetchProgress()
            .then((p) => setStreak(p.streak))
            .catch(() => { });
    }, []);

    const item = quiz[index];
    const xpEarned = useMemo(() => correctCount * 10, [correctCount]);

    useEffect(() => {
        if (!finished) {
            speak(item.prompt.word);
        }
    }, [index, finished, item.prompt.word, speak]);

    useEffect(() => {
        if (finished) return;
        const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
        return () => window.clearInterval(timer);
    }, [finished]);

    const handleCheck = async (choiceOverride?: number) => {
        if (answered) return;
        const choice = choiceOverride ?? selected;
        if (choice === null) return;
        const correct = choice === item.answerIndex;
        setSelected(choice);
        setAnswered(true);
        if (correct) {
            const nextCombo = combo + 1;
            const nextCorrectCount = correctCount + 1;
            setCombo(nextCombo);
            setCorrectCount(nextCorrectCount);
            const heat = streak + nextCombo;
            if (nextCorrectCount === quiz.length) {
                playAce();
            } else {
                playCorrect(heat);
            }
            setCelebrate((n) => n + 1);
        } else {
            setCombo(0);
            playWrong();
            const nextHearts = hearts - 1;
            setHearts(nextHearts);
            try {
                await loseHeart(nextHearts);
            } catch {
                // ignore persistence failure in quiz flow
            }
        }
    };

    const handleContinue = async () => {
        setAutoAdvance(false);
        if (hearts <= 0) {
            try {
                await saveLessonResult(lessonId, correctCount, quiz.length, false, elapsedSeconds);
            } catch {
                // ignore persistence failure
            }
            setFinished(true);
            setResultMsg(null);
            return;
        }
        if (index + 1 >= quiz.length) {
            try {
                const res = await completeLesson(correctCount * 10);
                await saveLessonResult(lessonId, correctCount, quiz.length, true, elapsedSeconds);
                if (correctCount !== quiz.length) {
                    playFanfare();
                }
                setResultMsg(
                    res.streakChanged
                        ? `${t.streakIncreased} ${res.streak} ${t.days}`
                        : t.streakKept,
                );
            } catch {
                setResultMsg(null);
            }
            setFinished(true);
            return;
        }
        setIndex((i) => i + 1);
        setSelected(null);
        setAnswered(false);
    };

    useEffect(() => {
        continueRef.current = handleContinue;
    });

    useEffect(() => {
        if (!answered || !autoAdvance) return;
        const timer = window.setTimeout(() => {
            setAutoAdvance(false);
            void continueRef.current();
        }, 900);
        return () => window.clearTimeout(timer);
    }, [answered, autoAdvance]);

    const perfect = correctCount === quiz.length;

    return (
        <div className="min-h-screen bg-white flex flex-col dark:bg-slate-900">
            <div
                className={`flex flex-1 flex-col transition-[filter] duration-300 ${finished ? 'pointer-events-none select-none blur-sm' : ''}`}
                aria-hidden={finished}
            >
            <header className="px-4 pt-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={onExit} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" aria-label="close">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-700">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${((index + (answered ? 1 : 0)) / quiz.length) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 180, damping: 26 }}
                        />
                    </div>
                    <div
                        className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums text-slate-400 dark:text-slate-500"
                        title={t.time}
                    >
                        <Clock className="h-4 w-4" />
                        {formatDuration(elapsedSeconds)}
                    </div>
                    <motion.div
                        key={hearts}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                        className="flex items-center gap-1 text-rose-500 font-bold"
                    >
                        <Heart className="w-5 h-5 fill-rose-500" />
                        {hearts}
                    </motion.div>
                </div>
            </header>

            <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                    {t.question} {index + 1} {t.questionOf} {quiz.length}
                </p>
                <div className="mt-4 flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{item.prompt.word}</h1>
                    <AnimateIcon>
                        <button
                            onClick={() => speak(item.prompt.word)}
                            className="p-2 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors dark:bg-slate-800 dark:text-sky-400 dark:hover:bg-slate-700"
                            aria-label={t.listen}
                        >
                            <AnimatedVolumeIcon size={20} />
                        </button>
                    </AnimateIcon>
                </div>
                <p className="mt-2 text-slate-500 font-medium dark:text-slate-400">{t.chooseAnswer}</p>
                <p className="mt-1 hidden text-xs font-semibold text-slate-400 sm:block dark:text-slate-500">
                    {t.doubleClickHint}
                </p>

                <div className="mt-6 grid gap-3">
                    {item.options.map((opt, i) => {
                        let style = 'border-slate-200 hover:border-sky-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-400';
                        if (answered) {
                            if (i === item.answerIndex) style = 'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-500/10';
                            else if (i === selected) style = 'border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-500/10';
                            else style = 'border-slate-100 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-800';
                        } else if (i === selected) {
                            style = 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-500/10';
                        }
                        const isWrongSelection = answered && i === selected && i !== item.answerIndex;
                        return (
                            <motion.button
                                key={i}
                                disabled={answered}
                                onClick={() => setSelected(i)}
                                onDoubleClick={() => {
                                    if (answered) return;
                                    setAutoAdvance(true);
                                    void handleCheck(i);
                                }}
                                title={answered ? undefined : t.doubleClickHint}
                                initial={{ opacity: 0, y: 10 }}
                                animate={
                                    isWrongSelection
                                        ? { opacity: 1, y: 0, x: [0, -7, 7, -5, 5, 0] }
                                        : { opacity: 1, y: 0, x: 0 }
                                }
                                transition={
                                    isWrongSelection
                                        ? { duration: 0.35, ease: 'easeInOut' }
                                        : { duration: 0.2, delay: 0.05 + i * 0.05 }
                                }
                                whileTap={answered ? undefined : { scale: 0.98 }}
                                className={`flex select-none items-center justify-between rounded-2xl border-2 px-5 py-4 text-left font-semibold text-slate-700 transition-colors dark:text-slate-200 ${style}`}
                            >
                                <span>
                                    {opt.th}
                                    {lang === 'en' && <span className="block text-sm text-slate-400 font-normal dark:text-slate-500">{opt.word}</span>}
                                </span>
                                {answered && i === item.answerIndex && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                {answered && i === selected && i !== item.answerIndex && <XCircle className="w-5 h-5 text-rose-500" />}
                            </motion.button>
                        );
                    })}
                </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="border-t-2 border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <AnimatePresence initial={false}>
                        {answered && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className={`mb-3 rounded-2xl px-4 py-3 font-bold flex items-center gap-2 ${selected === item.answerIndex
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                                    }`}
                            >
                            {selected === item.answerIndex ? (
                                <>
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    {t.correct}
                                    {combo >= 2 && (
                                        <span className="ml-auto rounded-full bg-orange-100 text-orange-600 px-2.5 py-0.5 text-sm animate-pop dark:bg-orange-500/15 dark:text-orange-300">
                                            x{combo}
                                        </span>
                                    )}
                                </>
                            ) : (
                                `${t.wrong} "${item.prompt.word}"`
                            )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => {
                            if (answered) {
                                void handleContinue();
                            } else {
                                void handleCheck();
                            }
                        }}
                        disabled={!answered && selected === null}
                        className={`w-full rounded-2xl py-3.5 font-bold text-white transition-colors ${(!answered && selected === null)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                                : answered
                                    ? 'bg-emerald-500 hover:bg-emerald-600'
                                    : 'bg-sky-500 hover:bg-sky-600'
                            }`}
                    >
                        {answered
                            ? index + 1 >= quiz.length || hearts <= 0
                                ? t.finish
                                : t.continue
                            : t.checkAnswer}
                    </button>
                </div>
            </footer>
            </div>

            <AnimatePresence>
                {finished && (
                    <QuizResultDialog
                        lessonTitle={t.units[lessonId].title}
                        hearts={hearts}
                        correctCount={correctCount}
                        total={quiz.length}
                        xpEarned={xpEarned}
                        perfect={perfect}
                        elapsedSeconds={elapsedSeconds}
                        resultMsg={resultMsg}
                        onExit={onExit}
                        onRetry={() => window.location.reload()}
                    />
                )}
            </AnimatePresence>

            {!finished && celebrate > 0 && <Celebration key={celebrate} streak={streak + combo} onDone={() => { }} />}
            {finished && perfect && <Celebration key={`perfect-${celebrate}`} streak={10} onDone={() => { }} />}
        </div>
    );
}
