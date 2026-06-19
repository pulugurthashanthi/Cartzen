// Lightweight sound hooks via the Web Audio API — no audio files needed.
// All calls are guarded and fail silently (autoplay policies, SSR, etc.).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", gain = 0.08) {
  const audio = getCtx();
  if (!audio) return;
  try {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, audio.currentTime + start);
    g.gain.linearRampToValueAtTime(gain, audio.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
    osc.connect(g);
    g.connect(audio.destination);
    osc.start(audio.currentTime + start);
    osc.stop(audio.currentTime + start + duration);
  } catch {
    // ignore
  }
}

export const sound = {
  // Soft tick when hovering / anticipation
  tick() {
    tone(440, 0, 0.08, "triangle", 0.05);
  },
  // Box opening — rising sweep
  open() {
    tone(330, 0, 0.12, "sine", 0.07);
    tone(440, 0.1, 0.12, "sine", 0.07);
    tone(550, 0.2, 0.15, "sine", 0.07);
  },
  // Reward reveal by rarity — bigger fanfare for higher tiers
  reveal(rarity: "common" | "rare" | "epic" | "legendary") {
    const notes: Record<string, number[]> = {
      common: [523],
      rare: [523, 659],
      epic: [523, 659, 784],
      legendary: [523, 659, 784, 1047, 1319],
    };
    const seq = notes[rarity] ?? notes.common;
    seq.forEach((f, i) => tone(f, i * 0.11, 0.25, "triangle", 0.09));
  },
};
