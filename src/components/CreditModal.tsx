import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, CheckCircle2, KeyRound, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { developers } from '@/lib/i18n';

const UNLOCK_CODE = '67';
const UNLOCKED_DEVELOPER = 'ตัวซีเคร็ท กฤตภาส กันใจ';

interface CreditModalProps {
    onClose: () => void;
}

export default function CreditModal({ onClose }: CreditModalProps) {
    const { t } = useLang();
    const [unlockOpen, setUnlockOpen] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (unlockOpen) {
                setUnlockOpen(false);
            } else {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose, unlockOpen]);

    const openUnlock = () => {
        setCode('');
        setError(false);
        setUnlockOpen(true);
    };

    const handleUnlock = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (code.trim() === UNLOCK_CODE) {
            if (!audioRef.current) {
                const audio = new Audio('/sixseven.ogg');
                audio.loop = true;
                audio.volume = 0.5;
                audioRef.current = audio;
            }
            const audio = audioRef.current;
            if (audio) {
                try {
                    audio.currentTime = 0;
                    void audio.play().catch(() => undefined);
                } catch {
                    // audio unavailable
                }
            }
            setUnlocked(true);
            setError(false);
            setCode('');
            return;
        }
        setError(true);
    };

    const allDevelopers = unlocked ? [...developers, UNLOCKED_DEVELOPER] : developers;

    return (
        <>
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
                    aria-label={t.credit}
                    className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 8 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800 dark:text-slate-100">
                            <Award className="w-5 h-5 text-sky-500" />
                            {t.credit}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label={t.close}
                            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-4 text-white">
                        <p className="font-extrabold">{t.appName}</p>
                        <p className="mt-1 text-sm font-medium text-emerald-50">{t.tagline}</p>
                    </div>

                    <p className="mt-5 text-sm font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t.developers}
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4">
                        {allDevelopers.map((name, i) => (
                            <li
                                key={name}
                                className={`flex items-center gap-2 text-sm font-semibold ${name === UNLOCKED_DEVELOPER
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <span className="w-5 h-5 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 text-white text-[10px] flex items-center justify-center font-bold">
                                    {i + 1}
                                </span>
                                {name}
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        onClick={openUnlock}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:border-sky-400 hover:text-sky-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-sky-400 dark:hover:text-sky-300"
                    >
                        {unlocked ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <KeyRound className="h-4 w-4" />
                        )}
                        {unlocked ? t.unlocked : t.unlockCredits}
                    </button>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {unlockOpen && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                        onClick={() => setUnlockOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="credit-unlock-title"
                            className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.94, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 8 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 27 }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3
                                        id="credit-unlock-title"
                                        className="flex items-center gap-2 text-lg font-extrabold text-slate-800 dark:text-slate-100"
                                    >
                                        <KeyRound className="h-5 w-5 text-sky-500" />
                                        {t.unlockCredits}
                                    </h3>
                                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {t.unlockCreditsHint}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setUnlockOpen(false)}
                                    aria-label={t.close}
                                    className="shrink-0 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <img
                                src="/sixseven.gif"
                                alt=""
                                aria-hidden="true"
                                className={`mx-auto mt-5 h-40 w-auto rounded-2xl border-2 object-cover ${unlocked
                                    ? 'border-emerald-400 shadow-lg shadow-emerald-100 dark:shadow-emerald-950/40'
                                    : 'border-slate-200 dark:border-slate-600'
                                    }`}
                            />

                            {unlocked ? (
                                <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 p-5 text-center text-white">
                                    <CheckCircle2 className="mx-auto h-8 w-8" />
                                    <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-emerald-50">
                                        {t.unlocked}
                                    </p>
                                    <p className="mt-1 text-xl font-extrabold">{UNLOCKED_DEVELOPER}</p>
                                </div>
                            ) : (
                                <form className="mt-5" onSubmit={handleUnlock}>
                                    <label
                                        htmlFor="credit-unlock-code"
                                        className="text-sm font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                                    >
                                        {t.enterCode}
                                    </label>
                                    <input
                                        id="credit-unlock-code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        autoFocus
                                        value={code}
                                        onChange={(e) => {
                                            setCode(e.target.value);
                                            if (error) setError(false);
                                        }}
                                        aria-invalid={error}
                                        aria-describedby={error ? 'credit-unlock-error' : undefined}
                                        className="mt-1.5 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-lg font-extrabold tracking-[0.3em] text-slate-800 outline-none transition-colors focus:border-sky-400 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:focus:border-sky-400"
                                    />
                                    {error && (
                                        <p
                                            id="credit-unlock-error"
                                            role="alert"
                                            className="mt-2 text-sm font-semibold text-red-500"
                                        >
                                            {t.wrongCode}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-100 transition-opacity hover:opacity-90 dark:shadow-emerald-950/30"
                                    >
                                        {t.unlock}
                                    </button>
                                </form>
                            )}

                            {unlocked && (
                                <button
                                    onClick={() => setUnlockOpen(false)}
                                    className="mt-3 w-full rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:border-sky-400 hover:text-sky-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
                                >
                                    {t.close}
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
