import fs from "node:fs";
import path from "node:path";

const sampleRate = 22050;
const durationSeconds = 12;
const totalSamples = sampleRate * durationSeconds;
const buffer = Buffer.alloc(44 + totalSamples * 4);

function writeString(offset, text) {
  buffer.write(text, offset, text.length, "ascii");
}

function clamp(value) {
  return Math.max(-1, Math.min(1, value));
}

function envelope(time, start, attack, decay, sustain = 1) {
  const t = time - start;
  if (t < 0 || t > attack + decay) return 0;
  if (t < attack) return t / attack;
  const decayProgress = (t - attack) / Math.max(decay, 0.0001);
  return sustain + (1 - sustain) * Math.exp(-4 * decayProgress);
}

function smoothPulse(time, period, width = 0.12) {
  const phase = (time % period) / period;
  return Math.exp(-Math.pow((phase - 0.06) / width, 2));
}

function padChord(time, chord, start, length) {
  const t = time - start;
  if (t < 0 || t > length) return 0;
  const fadeIn = Math.min(1, t / 0.5);
  const fadeOut = Math.min(1, (length - t) / 0.9);
  const env = Math.min(fadeIn, fadeOut);
  const shimmer = 0.45 + 0.18 * Math.sin(2 * Math.PI * 0.17 * time);
  const blend =
    chord.reduce((sum, freq, index) => {
      const detune = 1 + (index - 1) * 0.0018;
      return sum + Math.sin(2 * Math.PI * freq * detune * time);
    }, 0) / chord.length;
  return blend * env * shimmer * 0.36;
}

function bassPulse(time, root) {
  const beat = 60 / 88;
  const local = time % beat;
  if (local > 0.28) return 0;
  const env = Math.exp(-local * 12);
  return Math.sin(2 * Math.PI * root * time) * env * 0.2;
}

function kick(time) {
  const beat = 60 / 88;
  const phase = time % beat;
  if (phase > 0.06) return 0;
  const env = Math.exp(-phase * 36);
  return Math.sin(2 * Math.PI * (90 - phase * 40) * time) * env * 0.22;
}

function hat(time) {
  const eighth = 60 / 88 / 2;
  const phase = time % eighth;
  if (phase > 0.03) return 0;
  const env = Math.exp(-phase * 110);
  const noise = Math.sin(2 * Math.PI * 1370 * time) * 0.3 + Math.sin(2 * Math.PI * 2110 * time) * 0.15;
  return noise * env * 0.06;
}

const chords = [
  [196.0, 246.94, 293.66],
  [174.61, 220.0, 261.63],
  [164.81, 207.65, 246.94],
  [220.0, 277.18, 329.63]
];

for (let i = 0; i < totalSamples; i += 1) {
  const time = i / sampleRate;
  const chordIndex = Math.floor(time / 3) % chords.length;
  const chord = chords[chordIndex];
  const root = chord[0] / 2;

  const pad = padChord(time, chord, chordIndex * 3, 3.1);
  const bass = bassPulse(time, root);
  const drum = kick(time);
  const cymbal = hat(time);
  const texture = 0.012 * Math.sin(2 * Math.PI * 420 * time) * Math.sin(2 * Math.PI * 0.11 * time);

  const stereoSpread = 0.004 * Math.sin(2 * Math.PI * 0.07 * time);
  const sample = clamp(pad + bass + drum + cymbal + texture);

  const left = Math.round(clamp(sample + stereoSpread) * 32767);
  const right = Math.round(clamp(sample - stereoSpread) * 32767);
  const offset = 44 + i * 4;
  buffer.writeInt16LE(left, offset);
  buffer.writeInt16LE(right, offset + 2);
}

writeString(0, "RIFF");
buffer.writeUInt32LE(36 + totalSamples * 4, 4);
writeString(8, "WAVE");
writeString(12, "fmt ");
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(2, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 4, 28);
buffer.writeUInt16LE(4, 32);
buffer.writeUInt16LE(16, 34);
writeString(36, "data");
buffer.writeUInt32LE(totalSamples * 4, 40);

const outputPath = path.resolve("public/rpstore-ambient.wav");
fs.writeFileSync(outputPath, buffer);
console.log(`Wrote ${outputPath}`);
