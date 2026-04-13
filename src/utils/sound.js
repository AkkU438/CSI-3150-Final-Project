/**
 * Generates sounds using the Web Audio API — no external files needed.
 * All functions are safe to call even when AudioContext is not supported.
 */

function getCtx() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

/** Plays a triumphant ascending chord for correct answers. */
export function playCorrect() {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = ctx.currentTime + i * 0.08;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.start(start);
    osc.stop(start + 0.55);
  });
}

/** Plays a harsh descending buzz for wrong answers. */
export function playWrong() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.45);
}

/** Plays a tick sound for timer warnings (last 5 seconds). */
export function playTick() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/** Plays a fanfare when showing the results screen. */
export function playFanfare() {
  const ctx = getCtx();
  if (!ctx) return;

  const sequence = [
    { freq: 392, time: 0.0 },
    { freq: 523, time: 0.15 },
    { freq: 659, time: 0.3 },
    { freq: 784, time: 0.45 },
    { freq: 1047, time: 0.65 },
  ];

  sequence.forEach(({ freq, time }) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = ctx.currentTime + time;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.start(start);
    osc.stop(start + 0.45);
  });
}
