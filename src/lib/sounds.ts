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

function sweepTone(
    from: number,
    to: number,
    start: number,
    dur: number,
    type: OscillatorType,
    gain: number,
) {
    const audio = getCtx();
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
}

function noise(
    start: number,
    dur: number,
    gain: number,
    from: number,
    to: number,
    attack = 0.01,
) {
    const audio = getCtx();
    const frames = Math.max(1, Math.floor(audio.sampleRate * dur));
    const buffer = audio.createBuffer(1, frames, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
        const fade = 1 - i / frames;
        data[i] = (Math.random() * 2 - 1) * fade * fade;
    }

    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const g = audio.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(from, start);
    filter.frequency.exponentialRampToValueAtTime(to, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    source.connect(filter).connect(g).connect(audio.destination);
    source.start(start);
    source.stop(start + dur);
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

// Original synthesized ace-style cue inspired by a five-elimination streak.
// No sampled or copied game audio.
export function playAce() {
    try {
        const audio = getCtx();
        const now = audio.currentTime;

        // Cinematic riser and a low sub drop underneath it.
        noise(now, 0.52, 0.075, 320, 6800, 0.4);
        sweepTone(110, 48, now, 0.55, 'sine', 0.22);

        // Five staccato hits climbing in pitch, each with a metallic transient.
        const hits = [392, 523.25, 659.25, 880, 1174.66];
        hits.forEach((frequency, index) => {
            const start = now + 0.13 + index * 0.085;
            tone(frequency, start, 0.2, 'triangle', 0.13);
            tone(frequency * 2, start + 0.004, 0.12, 'sine', 0.05);
            noise(start, 0.07, 0.04, 3200, 650, 0.006);
        });

        // Big impact: sub thump, transient, and downward pitch slam.
        const impact = now + 0.57;
        tone(55, impact, 0.65, 'sine', 0.22);
        noise(impact, 0.24, 0.1, 1000, 140, 0.006);
        sweepTone(220, 55, impact, 0.42, 'triangle', 0.1);

        // Bright sustained chord with a short echo tail.
        [880, 1108.73, 1318.51, 1760].forEach((frequency) => {
            tone(frequency, impact + 0.02, 0.9, 'triangle', 0.06);
            tone(frequency * 1.5, impact + 0.02, 0.7, 'sine', 0.03);
            tone(frequency, impact + 0.18, 0.45, 'sine', 0.025);
        });
        tone(2637, impact + 0.1, 0.5, 'sine', 0.04);
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
