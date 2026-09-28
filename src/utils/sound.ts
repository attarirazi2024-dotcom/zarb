type SoundType = 'correct' | 'wrong' | 'click' | 'win' | 'star' | 'levelup';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

export function playSound(type: SoundType) {
  switch (type) {
    case 'correct':
      playTone(523.25, 0.15, 'sine', 0, 0.12);
      playTone(659.25, 0.15, 'sine', 0.08, 0.12);
      playTone(783.99, 0.2, 'sine', 0.16, 0.12);
      break;
    case 'wrong':
      playTone(196, 0.15, 'sawtooth', 0, 0.08);
      playTone(155.56, 0.25, 'sawtooth', 0.1, 0.08);
      break;
    case 'click':
      playTone(800, 0.05, 'sine', 0, 0.06);
      break;
    case 'win':
      playTone(523.25, 0.12, 'sine', 0, 0.1);
      playTone(659.25, 0.12, 'sine', 0.1, 0.1);
      playTone(783.99, 0.12, 'sine', 0.2, 0.1);
      playTone(1046.5, 0.3, 'sine', 0.3, 0.1);
      break;
    case 'star':
      playTone(880, 0.1, 'sine', 0, 0.08);
      playTone(1108.73, 0.15, 'sine', 0.08, 0.08);
      break;
    case 'levelup':
      playTone(523.25, 0.1, 'triangle', 0, 0.1);
      playTone(659.25, 0.1, 'triangle', 0.08, 0.1);
      playTone(783.99, 0.1, 'triangle', 0.16, 0.1);
      playTone(1046.5, 0.2, 'triangle', 0.24, 0.1);
      break;
  }
}
