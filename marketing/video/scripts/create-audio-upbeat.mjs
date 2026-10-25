import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

// "Everyday in Motion": an original 36-second future-pop instrumental.
// Electric piano, plucked melody, bass, drums, and stereo ambience.
// All sounds are synthesized here, with no outside samples.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sampleRate = 48000;
const duration = 36;
const bpm = 120;
const beat = 60 / bpm;
const barLength = beat * 4;
const samples = sampleRate * duration;
const left = new Float32Array(samples);
const right = new Float32Array(samples);
const fxLeft = new Float32Array(samples);
const fxRight = new Float32Array(samples);
const tau = Math.PI * 2;
const midi = note => 440 * 2 ** ((note - 69) / 12);
let seed = 20261025;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};

function add(start, length, generator, level, pan = 0, send = 0) {
  const from = Math.round(start * sampleRate);
  if (from < 0 || from >= samples) return;
  const count = Math.min(Math.round(length * sampleRate), samples - from);
  const l = Math.sqrt((1 - pan) / 2) * level;
  const r = Math.sqrt((1 + pan) / 2) * level;
  for (let i = 0; i < count; i++) {
    const value = generator(i / sampleRate, i);
    left[from + i] += value * l;
    right[from + i] += value * r;
    fxLeft[from + i] += value * l * send;
    fxRight[from + i] += value * r * send;
  }
}

function piano(start, note, length, level, pan = 0) {
  const frequency = midi(note);
  add(start, length + .25, t => {
    const envelope = (1 - Math.exp(-t * 240)) * Math.exp(-t * 2.2)
      * Math.max(0, Math.min(1, (length + .25 - t) / .25));
    const bell = Math.sin(tau * frequency * t + 1.3 * Math.exp(-t * 7) * Math.sin(tau * frequency * 2 * t));
    const body = Math.sin(tau * frequency * .999 * t) * .34;
    return (bell + body) * envelope;
  }, level, pan, .23);
}

function pluck(start, note, level = .11, pan = 0, length = .7) {
  const frequency = midi(note);
  const delayLength = Math.max(8, Math.round(sampleRate / frequency - .5));
  const string = new Float32Array(delayLength);
  let last = 0;
  for (let i = 0; i < delayLength; i++) {
    last = last * .6 + noise() * .4;
    string[i] = last;
  }
  let position = 0;
  add(start, length, (t, i) => {
    const current = string[position];
    const next = (position + 1) % delayLength;
    string[position] = (current + string[next]) * .496;
    position = next;
    const attack = Math.min(t / .006, 1);
    const release = Math.max(0, Math.min(1, (length - t) / .12));
    const body = Math.sin(tau * frequency * t) * Math.exp(-t * 5) * .38;
    return (current * 2.6 + body) * attack * release * (i < 5 ? i / 5 : 1);
  }, level, pan, .38);
}

function bass(start, note, length, level = .2) {
  const frequency = midi(note);
  add(start, length, t => {
    const envelope = Math.min(t / .008, 1) * Math.max(0, Math.min(1, (length - t) / .055));
    return (Math.sin(tau * frequency * t) + .23 * Math.sin(tau * frequency * 2 * t)
      + .075 * Math.sin(tau * frequency * 3 * t)) * envelope * Math.exp(-t * 1.4);
  }, level);
}

function kick(start, level = .45) {
  let previous = 0;
  add(start, .34, t => {
    const n = noise();
    const click = (n - previous) * Math.exp(-t * 220) * .075;
    previous = n;
    const phase = tau * (47 * t + 105 * .022 * (1 - Math.exp(-t / .022)));
    return Math.sin(phase) * (1 - Math.exp(-t * 1400)) * Math.exp(-t * 15) + click;
  }, level);
}

function clap(start, level = .12) {
  let low = 0;
  add(start, .22, t => {
    const n = noise();
    low = low * .72 + n * .28;
    const bursts = Math.exp(-t * 120)
      + (t > .012 ? Math.exp(-(t - .012) * 150) * .85 : 0)
      + (t > .027 ? Math.exp(-(t - .027) * 32) * .7 : 0);
    return (n - low) * bursts + Math.sin(tau * 185 * t) * Math.exp(-t * 35) * .17;
  }, level, .12, .1);
}

function hat(start, level, pan, open = false) {
  let previous = 0;
  add(start, open ? .16 : .055, t => {
    const n = noise();
    const high = n - previous * .91;
    previous = n;
    return high * Math.exp(-t * (open ? 30 : 100)) * Math.min(t / .001, 1);
  }, level, pan, .025);
}

const chords = [
  {root: 38, notes: [54, 57, 61, 64]}, // Dmaj9
  {root: 35, notes: [54, 57, 62, 66]}, // Bm7
  {root: 31, notes: [54, 57, 59, 62]}, // Gmaj9
  {root: 33, notes: [52, 57, 61, 66]}, // A6
];
const hook = [
  [[0, 78], [.75, 76], [1.25, 73], [1.75, 76]],
  [[.25, 78], [.75, 81], [1.5, 78]],
  [[0, 78], [.75, 74], [1.25, 71], [1.75, 74]],
  [[.25, 76], [.75, 73], [1.25, 71], [1.75, 69]],
];

for (let bar = 0; bar < 18; bar++) {
  const start = bar * barLength;
  const ending = bar >= 16;
  const chord = ending ? chords[0] : chords[bar % 4];
  const intro = bar < 2;
  const lighter = bar === 10 || bar === 11;

  chord.notes.forEach((note, index) => {
    const frequency = midi(note);
    add(start, 2.35, t => {
      const envelope = Math.min(t / .18, 1) * Math.max(0, Math.min(1, (2.35 - t) / .6));
      const pulse = Math.max(0, Math.sin(tau * (start + t) / beat));
      const duck = intro || ending ? 1 : .65 + .35 * pulse;
      return (Math.sin(tau * frequency * t) + .22 * Math.sin(tau * frequency * 1.003 * t)) * envelope * duck;
    }, .023, (index - 1.5) * .45, .36);
  });

  const chordTimes = intro ? [0, 1.5] : ending ? [0] : [0, .75, 1.5];
  chordTimes.forEach((offset, stroke) => chord.notes.forEach((note, index) => {
    piano(start + offset + index * .009, note, ending ? 1.4 : .48, stroke === 0 ? .061 : .042, (index - 1.5) * .23);
  }));

  if (bar < 16) {
    hook[bar % 4].forEach(([offset, note], index) => {
      pluck(start + offset + (index % 2 ? .012 : 0), note, intro ? .13 : .145, index % 2 ? .24 : -.24, .75);
    });
    if (bar >= 6 && bar < 14) pluck(start + 1.125, chord.notes[3] + 12, .065, .5, .5);
  } else {
    const finish = bar === 16 ? [[0, 78], [.75, 76], [1.5, 74]] : [[0, 74]];
    finish.forEach(([offset, note]) => pluck(start + offset, note, .13, -.08, 1.7));
  }

  if (!intro) {
    const pattern = ending ? [[0, 0, .8], [1, 0, .45]] : [[0, 0, .34], [.75, 0, .32], [1.25, 7, .2], [1.5, 12, .36]];
    pattern.forEach(([offset, interval, length]) => bass(start + offset, chord.root + interval, length, lighter ? .14 : .2));
  }

  for (let step = 0; step < 4; step++) {
    const time = start + step * beat;
    if (!intro && !(ending && (bar === 17 || step > 1))) {
      if (!lighter || step % 2 === 0) kick(time, ending ? .3 : .43);
      if (step % 2 === 1 && !ending) clap(time, .135);
    }
    if (bar >= 1 && !ending) {
      hat(time, .025, -.32);
      hat(time + .266, .043, .38, step % 2 === 1 && !intro);
      if (bar >= 4 && !lighter) hat(time + .391, .015, -.5);
    }
  }
  if ([5, 9, 13, 15].includes(bar)) {
    [1.5, 1.75, 1.875].forEach((offset, index) => clap(start + offset, .033 + index * .012));
  }
}

for (const boundary of [4, 13, 20, 27, 32]) {
  let previous = 0;
  add(boundary - .6, .6, t => {
    const n = noise();
    const high = n - previous * .8;
    previous = n;
    return high * (t / .6) ** 2 * .5;
  }, .045, -.25, .4);
  let smooth = 0;
  add(boundary, .7, t => {
    smooth = smooth * .75 + noise() * .25;
    return smooth * Math.exp(-t * 6) * Math.min(t / .008, 1);
  }, .11, .25, .6);
}

// Soft cross-delays and a damped stereo room around the melody.
for (const [delay, level] of [[.1875, .28], [.375, .19], [.5625, .1]]) {
  const offset = Math.round(delay * sampleRate);
  let smoothL = 0;
  let smoothR = 0;
  for (let i = offset; i < samples; i++) {
    smoothL = smoothL * .58 + fxRight[i - offset] * .42;
    smoothR = smoothR * .58 + fxLeft[i - offset] * .42;
    left[i] += smoothL * level;
    right[i] += smoothR * level;
  }
}
for (const [delay, gain] of [[.061, .17], [.083, .14], [.109, .11], [.137, .085]]) {
  const offset = Math.round(delay * sampleRate);
  const roomL = new Float32Array(offset);
  const roomR = new Float32Array(offset + 211);
  let lowL = 0;
  let lowR = 0;
  for (let i = 0; i < samples; i++) {
    const pL = i % roomL.length;
    const pR = i % roomR.length;
    lowL = lowL * .4 + roomL[pL] * .6;
    lowR = lowR * .4 + roomR[pR] * .6;
    roomL[pL] = fxLeft[i] + lowL * .56;
    roomR[pR] = fxRight[i] + lowR * .56;
    left[i] += lowL * gain;
    right[i] += lowR * gain;
  }
}

let peak = 0;
for (let i = 0; i < samples; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
const gain = .87 / Math.max(peak, .001);
const wav = Buffer.alloc(44 + samples * 4);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 4, 28);
wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 4, 40);
for (let i = 0; i < samples; i++) {
  const t = i / sampleRate;
  const fade = Math.min(t / .12, 1) * Math.sin(Math.min((duration - t) / 1.15, 1) * Math.PI / 2) ** 2;
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * gain * fade)) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * gain * fade)) * 32767), 46 + i * 4);
}
mkdirSync(resolve(project, 'public'), {recursive: true});
mkdirSync(resolve(project, 'out'), {recursive: true});
const mix = resolve(project, 'out/soundtrack-upbeat-mix.wav');
const output = resolve(project, 'public/soundtrack.wav');
writeFileSync(mix, wav);

function ffmpeg(args) {
  const result = spawnSync('ffmpeg', args, {encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024});
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stderr;
}
const analysis = ffmpeg(['-hide_banner', '-i', mix, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-']);
const measured = JSON.parse(analysis.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] || '{}');
assert.ok(Number.isFinite(Number(measured.input_i)), 'Loudness analysis failed');
const filter = `loudnorm=I=-16:TP=-1.5:LRA=9:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`;
ffmpeg(['-v', 'error', '-y', '-i', mix, '-af', filter, '-ar', String(sampleRate), '-c:a', 'pcm_s16le', output]);
writeFileSync(resolve(project, 'out/soundtrack-mastering.json'), JSON.stringify({title: 'Everyday in Motion', bpm, duration, targetLufs: -16, truePeakLimitDb: -1.5, measuredInput: measured}, null, 2));
console.log(`Created "Everyday in Motion": ${duration}s, ${bpm} BPM, original stereo instrumental, mastered to -16 LUFS.`);
