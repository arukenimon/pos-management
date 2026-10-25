import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Original instrumental, synthesized locally. No samples or third-party music.
// 120 BPM, 18 bars, Dmaj7 / Aadd9 / Bm7 / Gmaj7. Exactly 36 seconds.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sampleRate = 48000;
const duration = 36;
const samples = sampleRate * duration;
const left = new Float32Array(samples);
const right = new Float32Array(samples);
const tau = Math.PI * 2;
const midi = note => 440 * 2 ** ((note - 69) / 12);
let seed = 54321;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};

function add(start, length, generator, level, pan = 0) {
  const from = Math.round(start * sampleRate);
  const count = Math.min(Math.round(length * sampleRate), samples - from);
  const l = Math.sqrt((1 - pan) / 2) * level;
  const r = Math.sqrt((1 + pan) / 2) * level;
  for (let i = 0; i < count; i++) {
    const value = generator(i / sampleRate);
    left[from + i] += value * l;
    right[from + i] += value * r;
  }
}

function pluck(start, note, level = .11, pan = 0) {
  const frequency = midi(note);
  const tone = t => {
    const envelope = (1 - Math.exp(-t * 240)) * Math.exp(-t * 5.4);
    return envelope * (Math.sin(tau * frequency * t) + .22 * Math.sin(tau * frequency * 2 * t) + .08 * Math.sin(tau * frequency * 3 * t));
  };
  add(start, 1.3, tone, level, pan);
  add(start + .25, 1.1, tone, level * .18, -pan);
  add(start + .5, .8, tone, level * .07, pan);
}

const chords = [
  [50, 57, 61, 66], [45, 52, 59, 64], [47, 54, 57, 62], [43, 50, 54, 59],
];
for (let bar = 0; bar < 18; bar++) {
  const start = bar * 2;
  const chord = chords[bar % chords.length];
  chord.forEach((note, index) => {
    const frequency = midi(note + 12);
    add(start, 2.4, t => {
      const envelope = Math.min(t / .22, 1) * Math.max(0, Math.min(1, (2.4 - t) / .75));
      return (Math.sin(tau * frequency * t) + .3 * Math.sin(tau * frequency * 1.002 * t)) * envelope;
    }, .023, (index - 1.5) * .35);
  });
  [0, 1, 2, 3, 2, 1, 3, 2].forEach((index, step) => {
    const high = chord[index] + 12 + (bar % 4 === 3 && step === 6 ? 12 : 0);
    pluck(start + step * .25, high, step % 2 === 0 ? .105 : .057, step % 2 === 0 ? -.32 : .32);
  });
  [0, 1].forEach(beat => {
    const frequency = midi(chord[0] - 12);
    add(start + beat, .7, t => Math.sin(tau * frequency * t) * (1 - Math.exp(-t * 80)) * Math.exp(-t * 6), .18);
  });
}
for (let beat = 0; beat < 72; beat++) {
  const start = beat * .5;
  if (beat >= 8 && beat < 64) {
    if (beat % 2 === 0) add(start, .22, t => Math.sin(tau * (49 * t + 18 * (.032 * (1 - Math.exp(-t / .032))))) * Math.exp(-t * 23), .16);
    else add(start, .1, t => (noise() * .45 + Math.sin(tau * 185 * t) * .25) * Math.exp(-t * 50), .052, .08);
    add(start + .25, .045, t => noise() * Math.exp(-t * 125), .025, -.4);
  }
}
// Soft confirmation notes for the completed sale and stock receipt.
for (const time of [11.04, 16.74]) {
  [74, 78, 81].forEach((note, index) => pluck(time + index * .07, note, .057, .1));
}

let peak = 0;
for (let i = 0; i < samples; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
const gain = .76 / Math.max(peak, .001);
const wav = Buffer.alloc(44 + samples * 4);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 4, 28);
wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 4, 40);
for (let i = 0; i < samples; i++) {
  const t = i / sampleRate;
  const fade = Math.min(t / .4, 1) * Math.min((duration - t) / 2.3, 1);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * gain * fade)) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * gain * fade)) * 32767), 46 + i * 4);
}
mkdirSync(resolve(project, 'public'), {recursive: true});
writeFileSync(resolve(project, 'public/soundtrack.wav'), wav);
console.log(`Created original stereo soundtrack: ${duration}s, ${sampleRate}Hz, peak normalized to -2.4dBFS.`);
