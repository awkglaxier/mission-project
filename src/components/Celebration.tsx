import { useEffect } from 'react';

const COLORS = ['#34d399', '#38bdf8', '#fbbf24', '#fb7185', '#f97316', '#4ade80'];

interface CelebrationProps {
  streak: number;
  onDone: () => void;
}

export default function Celebration({ streak, onDone }: CelebrationProps) {
  const count = Math.min(60, 12 + streak * 3);
  const big = streak >= 7;

  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {big && <div className="absolute inset-0 bg-amber-100/40 animate-flash" />}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 110 + Math.random() * (160 + streak * 15);
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 60;
        const size = 8 + Math.random() * 8;
        const color = COLORS[i % COLORS.length];
        const round = i % 3 !== 0;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 animate-particle"
            style={
              {
                width: size,
                height: round ? size : size * 0.6,
                backgroundColor: color,
                borderRadius: round ? '50%' : '2px',
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                '--rot': `${Math.random() * 540 - 270}deg`,
                animationDuration: `${0.9 + Math.random() * 0.5}s`,
                animationDelay: `${Math.random() * 0.15}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
