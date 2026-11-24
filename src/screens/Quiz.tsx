import { useMemo, useState } from 'react';
import { X, Heart, Star, Volume2, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { lessons, type Vocab } from '@/lib/lessons';
import { completeLesson, loseHeart, fetchProgress, saveLessonResult } from '@/lib/supabase';
import { playCorrect, playWrong, playFanfare } from '@/lib/sounds';
import Celebration from '@/components/Celebration';

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

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // speech synthesis unavailable
  }
}

export default function Quiz({ lessonId, onExit }: QuizProps) {
  const { t, lang } = useLang();
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

  useMemo(() => {
    fetchProgress()
      .then((p) => setStreak(p.streak))
      .catch(() => {});
  }, []);

  const item = quiz[index];
  const xpEarned = useMemo(() => correctCount * 10, [correctCount]);

  const handleCheck = async () => {
    if (selected === null) return;
    const correct = selected === item.answerIndex;
    setAnswered(true);
    if (correct) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      const heat = streak + nextCombo;
      playCorrect(heat);
      setCelebrate((n) => n + 1);
      speak(item.prompt.word);
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
    if (hearts <= 0) {
      try {
        await saveLessonResult(lessonId, correctCount, quiz.length, false);
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
        await saveLessonResult(lessonId, correctCount, quiz.length, true);
        playFanfare();
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

  if (finished) {
    const perfect = correctCount === quiz.length;
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border-2 border-emerald-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-11 h-11 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800">
            {hearts <= 0 ? t.outOfHearts : t.lessonComplete}
          </h2>
          {hearts > 0 && (
            <>
              <p className="mt-2 text-slate-500 font-medium">{t.xpEarned}: {xpEarned} {t.xp}</p>
              {perfect && (
                <p className="mt-1 font-bold text-emerald-600">{t.perfectScore}</p>
              )}
              {resultMsg && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 font-bold px-3 py-1.5 text-sm">
                  <Star className="w-4 h-4" /> {resultMsg}
                </p>
              )}
            </>
          )}
          {hearts <= 0 && (
            <p className="mt-2 text-slate-500 font-medium">{t.outOfHeartsMsg}</p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onExit}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 transition-colors"
            >
              {t.backHome}
            </button>
            {hearts <= 0 && (
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-2xl border-2 border-slate-200 text-slate-600 font-bold py-3 hover:border-sky-300 transition-colors"
              >
                {t.retry}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-4 pt-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600" aria-label="close">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${((index + (answered ? 1 : 0)) / quiz.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-rose-500 font-bold">
            <Heart className="w-5 h-5 fill-rose-500" />
            {hearts}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <p className="text-sm font-bold text-slate-400">
          {t.question} {index + 1} {t.questionOf} {quiz.length}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-slate-800">{item.prompt.word}</h1>
          <button
            onClick={() => speak(item.prompt.word)}
            className="p-2 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
            aria-label={t.listen}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-2 text-slate-500 font-medium">{t.chooseAnswer}</p>

        <div className="mt-6 grid gap-3">
          {item.options.map((opt, i) => {
            let style = 'border-slate-200 hover:border-sky-300 bg-white';
            if (answered) {
              if (i === item.answerIndex) style = 'border-emerald-400 bg-emerald-50';
              else if (i === selected) style = 'border-rose-400 bg-rose-50';
              else style = 'border-slate-100 bg-white opacity-60';
            } else if (i === selected) {
              style = 'border-sky-400 bg-sky-50';
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setSelected(i)}
                className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left font-semibold text-slate-700 transition-all ${style}`}
              >
                <span>
                  {opt.th}
                  {lang === 'en' && <span className="block text-sm text-slate-400 font-normal">{opt.word}</span>}
                </span>
                {answered && i === item.answerIndex && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {answered && i === selected && i !== item.answerIndex && <XCircle className="w-5 h-5 text-rose-500" />}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="border-t-2 border-slate-100 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {answered && (
            <div
              className={`mb-3 rounded-2xl px-4 py-3 font-bold flex items-center gap-2 ${
                selected === item.answerIndex
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {selected === item.answerIndex ? (
                <>
                  <Flame className="w-5 h-5 text-orange-500" />
                  {t.correct}
                  {combo >= 2 && (
                    <span className="ml-auto rounded-full bg-orange-100 text-orange-600 px-2.5 py-0.5 text-sm animate-pop">
                      x{combo}
                    </span>
                  )}
                </>
              ) : (
                `${t.wrong} "${item.prompt.word}"`
              )}
            </div>
          )}
          <button
            onClick={answered ? handleContinue : handleCheck}
            disabled={!answered && selected === null}
            className={`w-full rounded-2xl py-3.5 font-bold text-white transition-colors ${
              (!answered && selected === null)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
      {celebrate > 0 && <Celebration key={celebrate} streak={streak + combo} onDone={() => {}} />}
    </div>
  );
}
