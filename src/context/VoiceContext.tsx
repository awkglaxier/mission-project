import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type TtsVoice = 'system' | 'female' | 'male';

const STORAGE_KEY = 'vocab-quest-tts-voice';
const PRESET_PREFIX = 'preset:';
const DEVICE_PREFIX = 'voice:';

const FEMALE_HINTS = ['female', 'samantha', 'victoria', 'zira', 'susan', 'karen', 'moira', 'tessa', 'serena', 'google us english'];
const MALE_HINTS = ['male', 'daniel', 'alex', 'david', 'fred', 'george', 'arthur', 'google uk english male'];

function getEnglishVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

function pickVoice(option: Exclude<TtsVoice, 'system'>): SpeechSynthesisVoice | null {
    const voices = getEnglishVoices();
    if (voices.length === 0) return null;
    const hints = option === 'female' ? FEMALE_HINTS : MALE_HINTS;
    return voices.find((v) => hints.some((hint) => v.name.toLowerCase().includes(hint))) ?? null;
}

function presetOf(selection: string): TtsVoice {
    const value = selection.slice(PRESET_PREFIX.length);
    return value === 'female' || value === 'male' ? value : 'system';
}

function normalizeSelection(saved: string | null): string {
    if (saved && (saved === 'female' || saved === 'male' || saved === 'system')) {
        return `${PRESET_PREFIX}${saved}`;
    }
    if (saved && (saved.startsWith(PRESET_PREFIX) || saved.startsWith(DEVICE_PREFIX))) {
        return saved;
    }
    return `${PRESET_PREFIX}system`;
}

interface VoiceContextValue {
    voice: TtsVoice;
    deviceVoiceUri: string | null;
    voices: SpeechSynthesisVoice[];
    setVoice: (voice: TtsVoice) => void;
    setDeviceVoice: (uri: string) => void;
    speak: (text: string, selectionOverride?: string) => void;
}

const VoiceContext = createContext<VoiceContextValue>({
    voice: 'system',
    deviceVoiceUri: null,
    voices: [],
    setVoice: () => { },
    setDeviceVoice: () => { },
    speak: () => { },
});

export function VoiceProvider({ children }: { children: ReactNode }) {
    const [selection, setSelection] = useState<string>(() => normalizeSelection(localStorage.getItem(STORAGE_KEY)));
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (!('speechSynthesis' in window)) return;
        const syncVoices = () => setVoices(getEnglishVoices());
        syncVoices();
        window.speechSynthesis.addEventListener('voiceschanged', syncVoices);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
    }, []);

    const saveSelection = useCallback((next: string) => {
        setSelection(next);
        localStorage.setItem(STORAGE_KEY, next);
    }, []);

    const setVoice = useCallback(
        (next: TtsVoice) => saveSelection(`${PRESET_PREFIX}${next}`),
        [saveSelection],
    );

    const setDeviceVoice = useCallback(
        (uri: string) => saveSelection(`${DEVICE_PREFIX}${uri}`),
        [saveSelection],
    );

    const speak = useCallback(
        (text: string, selectionOverride?: string) => {
            try {
                const key = selectionOverride ?? selection;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';

                const deviceVoice = key.startsWith(DEVICE_PREFIX)
                    ? getEnglishVoices().find((v) => v.voiceURI === key.slice(DEVICE_PREFIX.length)) ?? null
                    : null;

                if (deviceVoice) {
                    utterance.voice = deviceVoice;
                    utterance.lang = deviceVoice.lang;
                } else {
                    const option = presetOf(key);
                    if (option === 'system') {
                        const fallback = getEnglishVoices()[0];
                        if (fallback) {
                            utterance.voice = fallback;
                            utterance.lang = fallback.lang;
                        }
                    } else {
                        const picked = pickVoice(option);
                        if (picked) {
                            utterance.voice = picked;
                            utterance.lang = picked.lang;
                        } else {
                            // No matching voice on this device: fall back to pitch so the
                            // chosen option still sounds different from the default.
                            utterance.pitch = option === 'female' ? 1.25 : 0.75;
                        }
                    }
                }

                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            } catch {
                // speech synthesis unavailable
            }
        },
        [selection],
    );

    const deviceVoiceUri = selection.startsWith(DEVICE_PREFIX) ? selection.slice(DEVICE_PREFIX.length) : null;

    return (
        <VoiceContext.Provider
            value={{
                voice: presetOf(selection),
                deviceVoiceUri,
                voices,
                setVoice,
                setDeviceVoice,
                speak,
            }}
        >
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoice() {
    return useContext(VoiceContext);
}
