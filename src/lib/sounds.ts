let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  const audio = getCtx();
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(audio.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export function playCorrect(heat: number) {
  try {
    const audio = getCtx();
    const now = audio.currentTime;
    const step = Math.min(heat, 12);
    const base = 392 * Math.pow(2, step / 12);
    tone(base, now, 0.12, 'triangle', 0.22);
    tone(base * 1.335, now + 0.09, 0.16, 'triangle', 0.2);
    if (heat >= 5) tone(base * 2, now + 0.18, 0.2, 'sine', 0.14);
    if (heat >= 10) tone(base * 2.5, now + 0.27, 0.25, 'sine', 0.12);
  } catch {
    // audio unavailable
  }
}

export function playWrong() {
  try {
    const audio = getCtx();
    const now = audio.currentTime;
    tone(196, now, 0.18, 'square', 0.08);
    tone(147, now + 0.12, 0.25, 'square', 0.08);
  } catch {
    // audio unavailable
  }
}

export function playFanfare() {
  try {
    const audio = getCtx();
    const now = audio.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      tone(f, now + i * 0.11, 0.22, 'triangle', 0.2);
      tone(f / 2, now + i * 0.11, 0.24, 'sine', 0.12);
    });
    tone(1318.5, now + 0.5, 0.5, 'triangle', 0.22);
  } catch {
    // audio unavailable
  }
}
