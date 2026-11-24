import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const CODE = ['↑', '↑', '↓', '↓', '←', '→', 'B', 'A'];

interface SecretDialogProps {
    onClose: () => void;
}

export default function SecretDialog({ onClose }: SecretDialogProps) {
    const { t } = useLang();

    useEffect(() => {
        let audio: HTMLAudioElement | null = null;
        try {
            audio = new Audio('/cat-meme.ogg');
            audio.volume = 0.3;
            void audio.play().catch(() => undefined);
        } catch {
            // audio unavailable
        }
        return () => {
            audio?.pause();
        };
    }, []);

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="secret-title"
                className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 px-6 pb-6 pt-8 text-center text-white">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl"
                    />

                    <button
                        onClick={onClose}
                        aria-label={t.close}
                        className="absolute right-4 top-4 z-10 rounded-xl p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="relative mx-auto flex items-center justify-center gap-2">
                        <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white/80 bg-white shadow-xl shadow-emerald-950/20">
                            <img
                                src="/logo.png"
                                alt={t.appName}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white/80 bg-white shadow-xl shadow-emerald-950/20">
                            <img
                                src="/cat-meme.gif"
                                alt=""
                                aria-hidden="true"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-white/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t.secretCode}
                    </span>
                    <h2 id="secret-title" className="relative mt-2 text-2xl font-extrabold">
                        {t.secretTitle}
                    </h2>
                    <p className="relative mt-1 text-sm font-medium text-emerald-50">
                        {t.secretMessage}
                    </p>
                </div>

                <div className="p-5">
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {CODE.map((key, index) => (
                            <kbd
                                key={`${key}-${index}`}
                                className="flex h-9 min-w-9 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 px-2 font-mono text-sm font-extrabold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200"
                            >
                                {key}
                            </kbd>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-100 transition-opacity hover:opacity-90 dark:shadow-emerald-950/30"
                    >
                        {t.close}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
