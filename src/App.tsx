import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { LangProvider } from '@/context/LangContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { VoiceProvider } from '@/context/VoiceContext';
import Home from '@/screens/Home';
import Quiz from '@/screens/Quiz';

const screenMotion = {
    initial: { opacity: 0, y: 16 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.18, ease: 'easeIn' as const },
    },
};

function AppShell() {
    const [lessonId, setLessonId] = useState<number | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [lessonId]);

    return (
        <AnimatePresence mode="wait" initial={false}>
            {lessonId !== null ? (
                <motion.div key={`quiz-${lessonId}`} {...screenMotion}>
                    <Quiz
                        key={lessonId}
                        lessonId={lessonId}
                        onExit={() => setLessonId(null)}
                    />
                </motion.div>
            ) : (
                <motion.div key="home" {...screenMotion}>
                    <Home onStartLesson={setLessonId} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <MotionConfig reducedMotion="user">
            <ThemeProvider>
                <LangProvider>
                    <VoiceProvider>
                        <AppShell />
                    </VoiceProvider>
                </LangProvider>
            </ThemeProvider>
        </MotionConfig>
    );
}
