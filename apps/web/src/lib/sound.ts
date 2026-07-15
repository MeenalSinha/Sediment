let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  return ctx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, delay = 0) {
  if (!enabled) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = audioCtx.currentTime + delay;

  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function noiseBurst(duration: number, gain: number) {
  if (!enabled) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = gain;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 800;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start();
}

export const sfx = {
  brush: () => noiseBurst(0.12, 0.05),
  pickaxe: () => {
    tone(140, 0.15, "square", 0.06);
    noiseBurst(0.08, 0.08);
  },
  waterSpray: () => noiseBurst(0.2, 0.03),
  discovery: () => {
    tone(523.25, 0.4, "sine", 0.08);
    tone(659.25, 0.4, "sine", 0.07, 0.08);
    tone(783.99, 0.6, "sine", 0.07, 0.16);
  },
  legendary: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.6, "sine", 0.09, i * 0.12));
  },
  achievement: () => {
    tone(880, 0.15, "triangle", 0.07);
    tone(1174.66, 0.3, "triangle", 0.07, 0.1);
  },
  click: () => tone(300, 0.06, "sine", 0.04),
  damage: () => tone(110, 0.2, "sawtooth", 0.06),
};
