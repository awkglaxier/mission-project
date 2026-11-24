# Project memory

## Product intent & audience

- Gamified English vocabulary learning website for Thai-speaking learners, inspired by Duolingo's structure.
- Named "ภารกิจพิชิตคำศัพท์"; supports Thai/English language switching.
- Core features: quiz/exercise flow, streak tracker, combo system, developer credits.

## Brand personality & voice

- Playful, encouraging, celebratory — rewards correct answers visually and audibly.
- UI text primarily in Thai; English available as a toggle.
- Tone leans toward "mission/quest" framing given the project name.

## Visual design & UX direction

- Celebration particle effects (confetti-like bursts) on correct answers; intensity scales with current streak and consecutive combo count.
- Gold flash overlay triggered at high streak thresholds.
- Combo indicator ("x2", "x3", …) appears beside praise text ("ยอดเยี่ยม") for ≥2 consecutive correct answers.
- Audio feedback is procedurally generated via Web Audio API (no external audio files): ascending pitch for correct streaks, low short tone for wrong answers, fanfare on lesson completion.
- Effects should feel satisfying and scale noticeably with performance to reinforce engagement.

## Decisions, constraints & rationale

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons. No extra UI/icon packages.
- Path alias `@/` maps to `src/`; use it instead of deep relative imports.
- Sound is generated client-side with Web Audio API to avoid bundling audio assets and keep builds clean.
- Build must pass after each change.

## Open questions & assumptions

- Assumes a quiz component already exists where streak/combo state is tracked; effect hooks integrate there.
- Exact streak thresholds for "gold flash" tier not numerically specified — tuning may be needed.
- Internationalization mechanism for Thai/English switching is assumed to exist but details not yet confirmed.