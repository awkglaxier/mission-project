import { BookOpen, Flame, Heart, Star, Trophy, ChevronRight, Globe, Sparkles } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { useEffect, useState } from 'react';
import { fetchLessonProgress, type LessonProgressRow } from '@/lib/supabase';
import { lessons } from '@/lib/lessons';
import { developers } from '@/lib/i18n';
import { useProgress } from '@/hooks/useProgress';

const lessonIcons: Record<string, typeof BookOpen> = {
  sun: BookOpen,
  palette: Sparkles,
  cat: Heart,
  utensils: Star,
  users: Trophy,
  plane: Globe,
};

interface HomeProps {
  onStartLesson: (id: number) => void;
}

export default function Home({ onStartLesson }: HomeProps) {
  const { t, toggleLang } = useLang();
  const { progress, error } = useProgress();
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRow[]>([]);

  useEffect(() => {
    fetchLessonProgress()
      .then(setLessonProgress)
      .catch(() => setLessonProgress([]));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const playedToday = progress?.last_played === today;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b-2 border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-800 text-lg">{t.appName}</span>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-200 font-semibold text-sm text-slate-600 hover:border-sky-400 hover:text-sky-600 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {t.language}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <section className="mt-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white p-6 shadow-lg shadow-emerald-100">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{t.appName}</h1>
          <p className="mt-2 text-emerald-50 font-medium">{t.tagline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 font-bold">
              <Flame className="w-4 h-4" />
              {progress ? progress.streak : '…'} {t.days}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 font-bold">
              <Star className="w-4 h-4" />
              {progress ? progress.xp : '…'} {t.xp}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 font-bold">
              <Heart className="w-4 h-4" />
              {progress ? progress.hearts : '…'}
            </div>
          </div>
          {progress && !playedToday && (
            <p className="mt-3 text-sm font-semibold text-amber-100 flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              {t.dailyReminder}
            </p>
          )}
          {error && (
            <p className="mt-3 text-sm font-semibold bg-red-500/80 rounded-lg px-3 py-1.5">{error}</p>
          )}
        </section>

        <h2 className="mt-8 mb-3 text-lg font-extrabold text-slate-700">{t.selectLesson}</h2>
        <div className="grid gap-3">
          {lessons.map((lesson) => {
            const Icon = lessonIcons[lesson.icon] ?? BookOpen;
            const lp = lessonProgress.find((r) => r.lesson_id === lesson.id);
            const pct = lp ? Math.min(100, Math.round((lp.best_correct / lesson.words.length) * 100)) : 0;
            return (
              <button
                key={lesson.id}
                onClick={() => onStartLesson(lesson.id)}
                className="group flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className={`w-12 h-12 shrink-0 rounded-2xl ${lesson.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{t.units[lesson.id].title}</p>
                  <p className="text-sm text-slate-500 truncate">{t.units[lesson.id].desc}</p>
                  {lp && !lp.completed && pct > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-2 flex-1 max-w-32 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-sky-600">{pct}%</span>
                    </div>
                  )}
                </div>
                {lp?.completed && (
                  <span className="hidden sm:inline-block rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1">
                    {t.completed}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
              </button>
            );
          })}
        </div>

        <footer className="mt-12 rounded-2xl border-2 border-slate-200 bg-white p-5">
          <p className="text-sm font-extrabold uppercase tracking-wide text-slate-400">{t.developers}</p>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {developers.map((name, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 text-white text-[10px] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {name}
              </li>
            ))}
          </ul>
        </footer>
      </main>
    </div>
  );
}
