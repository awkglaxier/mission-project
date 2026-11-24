import {
    BookOpen,
    Flame,
    Heart,
    Star,
    Trophy,
    ChevronRight,
    Globe,
    Sparkles,
    Home as HomeIcon,
    CloudSun,
    HeartPulse,
    MapPin,
    GraduationCap,
    Briefcase,
    Brain,
    TrendingUp,
    Leaf,
    List as ListIcon,
    LayoutGrid,
    Award,
    Play,
    Info,
    Check,
    Shirt,
    Zap,
    Clock,
    Smile,
    ShoppingBag,
    ChefHat,
    Bus,
    Hotel,
    UtensilsCrossed,
    Gamepad2,
    Smartphone,
    PenTool,
    BarChart3,
    Scale,
    Stethoscope,
    Cpu,
    BookMarked,
    Newspaper,
    Megaphone,
    ClipboardList,
    Cog,
    Calculator,
    Telescope,
    Dna,
    ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLang } from '@/context/LangContext';
import { useEffect, useRef, useState } from 'react';
import { fetchLessonProgress, type LessonProgressRow } from '@/lib/progress-store';
import { lessons, type Lesson, type LessonLevel } from '@/lib/lessons';
import { useProgress } from '@/hooks/useProgress';
import SettingsModal from '@/components/SettingsModal';
import CreditModal from '@/components/CreditModal';
import LessonDetailDialog from '@/components/LessonDetailDialog';
import SecretDialog from '@/components/SecretDialog';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';
import { AnimateIcon } from '@/components/animate-ui/animate-icon';
import { AnimatedSettingsIcon } from '@/components/animate-ui/icons';

const lessonIcons: Record<string, typeof BookOpen> = {
    sun: BookOpen,
    palette: Sparkles,
    cat: Heart,
    utensils: Star,
    users: Trophy,
    plane: Globe,
    home: HomeIcon,
    'cloud-sun': CloudSun,
    'heart-pulse': HeartPulse,
    'map-pin': MapPin,
    'graduation-cap': GraduationCap,
    briefcase: Briefcase,
    brain: Brain,
    'trending-up': TrendingUp,
    leaf: Leaf,
    shirt: Shirt,
    zap: Zap,
    clock: Clock,
    smile: Smile,
    'shopping-bag': ShoppingBag,
    'chef-hat': ChefHat,
    bus: Bus,
    hotel: Hotel,
    'utensils-crossed': UtensilsCrossed,
    'gamepad-2': Gamepad2,
    smartphone: Smartphone,
    'pen-tool': PenTool,
    'bar-chart-3': BarChart3,
    scale: Scale,
    stethoscope: Stethoscope,
    cpu: Cpu,
    'book-marked': BookMarked,
    'book-open': BookOpen,
    newspaper: Newspaper,
    globe: Globe,
    megaphone: Megaphone,
    'clipboard-list': ClipboardList,
    cog: Cog,
    calculator: Calculator,
    telescope: Telescope,
    dna: Dna,
    'shield-check': ShieldCheck,
};

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface HomeProps {
    onStartLesson: (id: number) => void;
}

type LessonLayout = 'list' | 'grid';

const LAYOUT_STORAGE_KEY = 'vocab-quest-lesson-layout';
const SECRET_SEQUENCE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'b', 'a'];
const SECRET_RESET_MS = 1500;

export default function Home({ onStartLesson }: HomeProps) {
    const { t } = useLang();
    const { progress, error } = useProgress();
    const [lessonProgress, setLessonProgress] = useState<LessonProgressRow[]>([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [creditsOpen, setCreditsOpen] = useState(false);
    const [detailLesson, setDetailLesson] = useState<Lesson | null>(null);
    const [secretOpen, setSecretOpen] = useState(false);
    const secretIndex = useRef(0);
    const secretLastKeyAt = useRef(0);
    const [level, setLevel] = useState<LessonLevel>('basic');
    const [layout, setLayout] = useState<LessonLayout>(() =>
        localStorage.getItem(LAYOUT_STORAGE_KEY) === 'grid' ? 'grid' : 'list',
    );

    const changeLayout = (next: LessonLayout) => {
        setLayout(next);
        localStorage.setItem(LAYOUT_STORAGE_KEY, next);
    };

    useEffect(() => {
        fetchLessonProgress()
            .then(setLessonProgress)
            .catch(() => setLessonProgress([]));
    }, []);

    useEffect(() => {
        secretIndex.current = 0;
        secretLastKeyAt.current = 0;
        if (settingsOpen || creditsOpen || detailLesson || secretOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;

            const target = event.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable)
            ) {
                return;
            }

            const token =
                event.code === 'KeyB'
                    ? 'b'
                    : event.code === 'KeyA'
                        ? 'a'
                        : event.key.toLowerCase();
            const now = Date.now();
            if (now - secretLastKeyAt.current > SECRET_RESET_MS) secretIndex.current = 0;
            secretLastKeyAt.current = now;

            if (token === SECRET_SEQUENCE[secretIndex.current]) {
                event.preventDefault();
                secretIndex.current += 1;
                if (secretIndex.current === SECRET_SEQUENCE.length) {
                    secretIndex.current = 0;
                    setSecretOpen(true);
                }
            } else {
                secretIndex.current = token === SECRET_SEQUENCE[0] ? 1 : 0;
                if (secretIndex.current === 1) event.preventDefault();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [creditsOpen, detailLesson, secretOpen, settingsOpen]);

    const today = new Date().toISOString().slice(0, 10);
    const playedToday = progress?.last_played === today;
    const completedLessonIds = new Set(
        lessonProgress.filter((row) => row.completed).map((row) => row.lesson_id),
    );
    const orderedLessons = [
        ...lessons.filter((lesson) => lesson.level === 'basic'),
        ...lessons.filter((lesson) => lesson.level === 'advanced'),
    ];
    const completedCount = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    const overallPct = Math.round((completedCount / lessons.length) * 100);
    const nextLesson = orderedLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ?? orderedLessons[0];
    const ctaLabel =
        completedCount >= lessons.length
            ? t.playAgain
            : completedCount > 0
                ? t.continueMission
                : t.startMission;

    const levelChipClass = (active: boolean) =>
        `inline-flex shrink-0 items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${active
            ? 'border-sky-500 bg-sky-500 text-white'
            : 'border-slate-200 bg-white text-slate-500 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-500'
        }`;

    const layoutButtonClass = (active: boolean) =>
        `rounded-lg p-1.5 transition-colors ${active
            ? 'bg-sky-500 text-white'
            : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300'
        }`;

    const renderLesson = (lesson: Lesson, index: number) => {
        const Icon = lessonIcons[lesson.icon] ?? BookOpen;
        const cardMotion = {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.25, delay: Math.min(index * 0.04, 0.3) },
            whileHover: { y: -1, transition: { duration: 0.15, delay: 0 } },
        };
        const lp = lessonProgress.find((r) => r.lesson_id === lesson.id);
        const totalPoints = lesson.words.length * 10;
        const points = lp ? Math.min(totalPoints, lp.best_correct * 10) : 0;
        const pct = Math.round((points / totalPoints) * 100);
        const isCompleted = completedLessonIds.has(lesson.id);
        const title = t.units[lesson.id].title;
        const description = t.units[lesson.id].desc;

        const detailsButton = (
            <button
                type="button"
                onClick={() => setDetailLesson(lesson)}
                aria-label={`${t.lessonDetails}: ${title}`}
                title={t.lessonDetails}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-sky-500 dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-sky-400"
            >
                <Info className="h-4 w-4" />
            </button>
        );

        if (layout === 'grid') {
            return (
                <motion.div
                    key={lesson.id}
                    {...cardMotion}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-colors hover:border-sky-300 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-sky-600"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${lesson.color} text-white transition-transform duration-300 group-hover:scale-105`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        {detailsButton}
                    </div>
                    <motion.button
                        onClick={() => onStartLesson(lesson.id)}
                        whileTap={{ scale: 0.99 }}
                        className="mt-2.5 flex flex-1 flex-col text-left"
                    >
                        <span className="flex items-start gap-1.5">
                            <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-800 line-clamp-2 dark:text-slate-100">
                                {title}
                            </span>
                            {isCompleted && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                        </span>
                        <span className="mt-1 text-xs text-slate-400 line-clamp-2 dark:text-slate-500">
                            {description}
                        </span>
                        <span className="mt-auto block w-full pt-3">
                            <span className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-500 dark:text-slate-400"><SlidingNumber number={pct} />%</span>
                                <span className="font-semibold text-slate-400 dark:text-slate-500">{points}/{totalPoints}</span>
                            </span>
                            <span className="mt-1 block h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <motion.span
                                    className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.7, ease: 'easeOut', delay: Math.min(index * 0.04, 0.3) }}
                                />
                            </span>
                        </span>
                    </motion.button>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={lesson.id}
                {...cardMotion}
                className="group flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-sky-300 dark:border-slate-700/70 dark:bg-slate-800/60 dark:hover:border-sky-600"
            >
                <motion.button
                    onClick={() => onStartLesson(lesson.id)}
                    whileTap={{ scale: 0.99 }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${lesson.color} text-white transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                            <span className="min-w-0 flex-1 truncate font-bold text-slate-800 dark:text-slate-100">{title}</span>
                            {isCompleted && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                        </span>
                        <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{description}</span>
                        <span className="mt-1 flex items-center gap-2">
                            <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                <motion.span
                                    className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.7, ease: 'easeOut', delay: Math.min(index * 0.04, 0.3) }}
                                />
                            </span>
                            <span className="shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500"><SlidingNumber number={pct} />%</span>
                        </span>
                    </span>
                </motion.button>
                {detailsButton}
            </motion.div>
        );
    };

    const levelOptions: { id: LessonLevel; label: string }[] = [
        { id: 'basic', label: t.levels.basic },
        { id: 'advanced', label: t.levels.advanced },
    ];

    const visibleLessons = orderedLessons.filter((lesson) => lesson.level === level);
    const completedInLevel = visibleLessons.filter((lesson) =>
        completedLessonIds.has(lesson.id),
    ).length;
    const levelPct = Math.round((completedInLevel / visibleLessons.length) * 100);

    const startDetailLesson = () => {
        if (!detailLesson) return;
        const id = detailLesson.id;
        setDetailLesson(null);
        onStartLesson(id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b-2 border-slate-100 dark:bg-slate-900/90 dark:border-slate-800">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="truncate font-extrabold text-slate-800 text-lg dark:text-slate-100">{t.appName}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            onClick={() => setCreditsOpen(true)}
                            aria-label={t.credit}
                            title={t.credit}
                            className="flex items-center justify-center rounded-xl border-2 border-slate-200 p-2 text-slate-600 transition-colors hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
                        >
                            <Award className="w-4 h-4" />
                        </button>
                        <AnimateIcon>
                            <button
                                onClick={() => setSettingsOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-200 font-semibold text-sm text-slate-600 hover:border-sky-400 hover:text-sky-600 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
                            >
                                <AnimatedSettingsIcon size={16} />
                                {t.settings}
                            </button>
                        </AnimateIcon>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pb-16">
                <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white p-6 shadow-lg shadow-emerald-100 dark:shadow-emerald-950/40">
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl"
                        animate={{ x: [0, -18, 0], y: [0, 12, 0], scale: [1, 1.12, 1] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl"
                        animate={{ x: [0, 16, 0], y: [0, -10, 0], scale: [1, 0.92, 1] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                            backgroundSize: '18px 18px',
                        }}
                    />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-50 ring-1 ring-white/20">
                                <Sparkles className="h-3.5 w-3.5" />
                                {t.todayQuest}
                            </span>
                            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold leading-tight">{t.appName}</h1>
                            <p className="mt-2 text-emerald-50 font-medium">{t.tagline}</p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-white/15 ring-1 ring-white/15 rounded-full px-3 py-1.5 text-sm font-bold">
                                    <Flame className="w-4 h-4" />
                                    {progress ? <SlidingNumber number={progress.streak} /> : '…'} {t.days}
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/15 ring-1 ring-white/15 rounded-full px-3 py-1.5 text-sm font-bold">
                                    <Star className="w-4 h-4" />
                                    {progress ? <SlidingNumber number={progress.xp} /> : '…'} {t.xp}
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/15 ring-1 ring-white/15 rounded-full px-3 py-1.5 text-sm font-bold">
                                    <Heart className="w-4 h-4" />
                                    {progress ? progress.hearts : '…'}
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <motion.button
                                    onClick={() => onStartLesson(nextLesson.id)}
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-emerald-600 shadow-lg shadow-emerald-950/10 transition-colors hover:bg-emerald-50"
                                >
                                    <Play className="h-4 w-4 fill-current" />
                                    {ctaLabel}
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </motion.button>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-100">
                                        {completedCount >= lessons.length ? t.playAgain : t.upNext}
                                    </p>
                                    <p className="truncate text-sm font-bold text-white">{t.units[nextLesson.id].title}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-center gap-2 self-center sm:self-auto">
                            <div
                                className="relative h-28 w-28"
                                role="img"
                                aria-label={`${overallPct}% ${t.overallProgress}`}
                            >
                                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r={RING_RADIUS}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-white/20"
                                    />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r={RING_RADIUS}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={RING_CIRCUMFERENCE}
                                        initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                                        animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - overallPct / 100) }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-extrabold"><SlidingNumber number={overallPct} />%</span>
                                    <span className="text-[10px] font-bold text-emerald-50">{t.overallProgress}</span>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-emerald-50">
                                <SlidingNumber number={completedCount} /> / {lessons.length} {t.lessons}
                            </p>
                        </div>
                    </div>
                    <div className="relative mt-3 space-y-2">
                        {progress && !playedToday && (
                            <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/20 px-3 py-1.5 text-sm font-semibold text-amber-50">
                                <Flame className="w-4 h-4" />
                                {t.dailyReminder}
                            </p>
                        )}
                        {error && (
                            <p className="text-sm font-semibold bg-red-500/80 rounded-lg px-3 py-1.5">{error}</p>
                        )}
                    </div>
                </section>

                <div className="mt-8 mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-extrabold text-slate-700 dark:text-slate-200">{t.selectLesson}</h2>
                    <div className="flex items-center gap-0.5 rounded-xl border-2 border-slate-200 p-0.5 dark:border-slate-700">
                        <button
                            onClick={() => changeLayout('list')}
                            className={layoutButtonClass(layout === 'list')}
                            aria-label={t.listView}
                            aria-pressed={layout === 'list'}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => changeLayout('grid')}
                            className={layoutButtonClass(layout === 'grid')}
                            aria-label={t.gridView}
                            aria-pressed={layout === 'grid'}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {t.level}
                    </span>
                    {levelOptions.map((option) => {
                        const count = lessons.filter((lesson) => lesson.level === option.id).length;
                        return (
                            <motion.button
                                key={option.id}
                                onClick={() => setLevel(option.id)}
                                className={levelChipClass(level === option.id)}
                                aria-pressed={level === option.id}
                                whileTap={{ scale: 0.95 }}
                            >
                                {option.label}
                                <span
                                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${level === option.id
                                        ? 'bg-white/20'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                        }`}
                                >
                                    {count}
                                </span>
                            </motion.button>
                        );
                    })}
                    <div className="ml-auto flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${levelPct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                            {completedInLevel}/{visibleLessons.length}
                        </span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={level}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mt-6 mb-2 flex items-center gap-2">
                            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {t.levels[level]}
                            </h3>
                            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                {completedInLevel}/{visibleLessons.length} {t.lessons}
                            </span>
                        </div>
                        <div className={`grid gap-3 ${layout === 'grid' ? 'grid-cols-2' : ''}`}>
                            {visibleLessons.map(renderLesson)}
                        </div>
                    </motion.div>
                </AnimatePresence>

            </main>

            <AnimatePresence>
                {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                {creditsOpen && <CreditModal onClose={() => setCreditsOpen(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                {detailLesson && (
                    <LessonDetailDialog
                        lesson={detailLesson}
                        progress={lessonProgress.find((row) => row.lesson_id === detailLesson.id) ?? null}
                        onClose={() => setDetailLesson(null)}
                        onStart={startDetailLesson}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {secretOpen && <SecretDialog onClose={() => setSecretOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
