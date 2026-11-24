import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Lang, type Translations } from '@/lib/i18n';

interface LangContextValue {
    lang: Lang;
    t: Translations;
    setLang: (lang: Lang) => void;
    toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
    lang: 'th',
    t: translations.th,
    setLang: () => { },
    toggleLang: () => { },
});

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>(() => {
        const saved = localStorage.getItem('vocab-quest-lang');
        return saved === 'en' ? 'en' : 'th';
    });

    useEffect(() => {
        localStorage.setItem('vocab-quest-lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const toggleLang = () => setLang((l) => (l === 'th' ? 'en' : 'th'));

    return (
        <LangContext.Provider value={{ lang, t: translations[lang], setLang, toggleLang }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    return useContext(LangContext);
}
