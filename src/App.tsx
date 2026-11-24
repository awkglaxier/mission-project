import { useState } from 'react';
import { LangProvider } from '@/context/LangContext';
import Home from '@/screens/Home';
import Quiz from '@/screens/Quiz';

function AppShell() {
  const [lessonId, setLessonId] = useState<number | null>(null);

  if (lessonId !== null) {
    return <Quiz key={lessonId} lessonId={lessonId} onExit={() => setLessonId(null)} />;
  }
  return <Home onStartLesson={setLessonId} />;
}

export default function App() {
  return (
    <LangProvider>
      <AppShell />
    </LangProvider>
  );
}
