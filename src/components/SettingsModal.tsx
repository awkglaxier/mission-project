import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Moon, Settings, Sun, Volume2, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { useTheme, type Theme } from '@/context/ThemeContext';
import { useVoice, type TtsVoice } from '@/context/VoiceContext';
import type { Lang } from '@/lib/i18n';

interface SettingsModalProps {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { t, lang, setLang } = useLang();
    const { theme, setTheme } = useTheme();
    const { voice, deviceVoiceUri, voices, setVoice, setDeviceVoice, speak } = useVoice();

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

    const langOptions: { value: Lang; label: string }[] = [
        { value: 'th', label: 'ไทย' },
        { value: 'en', label: 'English' },
    ];

    const themeOptions: { value: Theme; label: string; Icon: typeof Sun }[] = [
        { value: 'light', label: t.light, Icon: Sun },
        { value: 'dark', label: t.dark, Icon: Moon },
    ];

    const voiceOptions: { value: TtsVoice; label: string }[] = [
        { value: 'system', label: t.voiceSystem },
        { value: 'female', label: t.voiceFemale },
        { value: 'male', label: t.voiceMale },
    ];

    const choosePreset = (value: TtsVoice) => {
        setVoice(value);
        speak('Hello', `preset:${value}`);
    };

    const chooseDeviceVoice = (uri: string) => {
        setDeviceVoice(uri);
        speak('Hello', `voice:${uri}`);
    };

    const optionClass = (selected: boolean) =>
        `flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors ${selected
            ? 'border-sky-400 bg-sky-50 text-sky-600 dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-300'
            : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300 dark:hover:border-sky-400'
        }`;

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
                aria-label={t.settings}
                className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800 dark:text-slate-100">
                        <Settings className="w-5 h-5 text-sky-500" />
                        {t.settings}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label={t.close}
                        className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <section className="mt-6">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t.language}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {langOptions.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setLang(value)}
                                className={optionClass(lang === value)}
                                aria-pressed={lang === value}
                            >
                                {label}
                                {lang === value && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mt-6">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t.theme}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {themeOptions.map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={optionClass(theme === value)}
                                aria-pressed={theme === value}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </span>
                                {theme === value && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mt-6">
                    <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {t.voice}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{t.voiceHint}</span>
                    </div>
                    <div className="mt-2 grid gap-2">
                        {voiceOptions.map(({ value, label }) => {
                            const selected = voice === value && !deviceVoiceUri;
                            return (
                                <button
                                    key={value}
                                    onClick={() => choosePreset(value)}
                                    className={optionClass(selected)}
                                    aria-pressed={selected}
                                >
                                    <span className="flex items-center gap-2">
                                        <Volume2 className="w-4 h-4" />
                                        {label}
                                    </span>
                                    {selected && <Check className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>

                    <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t.moreVoices}
                    </p>
                    {voices.length === 0 ? (
                        <p className="mt-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">{t.noVoices}</p>
                    ) : (
                        <div className="mt-1.5 grid max-h-44 gap-1.5 overflow-y-auto pr-1">
                            {voices.map((deviceVoice) => {
                                const selected = deviceVoiceUri === deviceVoice.voiceURI;
                                return (
                                    <button
                                        key={deviceVoice.voiceURI}
                                        onClick={() => chooseDeviceVoice(deviceVoice.voiceURI)}
                                        className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition-colors ${selected
                                            ? 'border-sky-400 bg-sky-50 text-sky-600 dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-300'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300 dark:hover:border-sky-400'
                                            }`}
                                        aria-pressed={selected}
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <Volume2 className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{deviceVoice.name}</span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                                                {deviceVoice.lang}
                                            </span>
                                            {selected && <Check className="w-4 h-4" />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            </motion.div>
        </motion.div>
    );
}
