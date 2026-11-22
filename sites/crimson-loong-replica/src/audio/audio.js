// Fully synthesised soundtrack: pentatonic plucks, drone, taiko, thunder,
// roars, whooshes, splash, crackle, shimmer, chime - plus wind and lake
// ambience. Web Audio only; started on the first user gesture.
import { BEATS, DUR } from '../film/beats.js';
import { win, clamp } from '../lib/util.js';
import { SH } from '../lib/util.js';

let ctx = null, master, musicBus, sfxBus, ambBus;
let windGain, windFilter, lapGain;
let noiseBuf = null;
let started = false, muted = false;

const PENTA = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88];

export function audioReady() { return started; }

export function initAudio() {
  if (started) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.85;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 22; comp.ratio.value = 5;
  master.connect(comp); comp.connect(ctx.destination);

  musicBus = ctx.createGain(); musicBus.gain.value = 0.9; musicBus.connect(master);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 1.0; sfxBus.connect(master);
  ambBus = ctx.createGain(); ambBus.gain.value = 0.8; ambBus.connect(master);

  // shared noise buffer (2 s white)
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  // wind: looped noise through a slow-sweeping lowpass
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuf; wind.loop = true;
  windFilter = ctx.createBiquadFilter();
  windFilter.type = 'lowpass'; windFilter.frequency.value = 320; windFilter.Q.value = 0.6;
  windGain = ctx.createGain(); windGain.gain.value = 0.0;
  wind.connect(windFilter); windFilter.connect(windGain); windGain.connect(ambBus);
  wind.start();

  // lake lap: noise through a resonant bandpass with slow amplitude wobble
  const lap = ctx.createBufferSource();
  lap.buffer = noiseBuf; lap.loop = true;
  const lapF = ctx.createBiquadFilter();
  lapF.type = 'bandpass'; lapF.frequency.value = 900; lapF.Q.value = 1.4;
  lapGain = ctx.createGain(); lapGain.gain.value = 0.02;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.17;
  const lfoG = ctx.createGain(); lfoG.gain.value = 0.012;
  lfo.connect(lfoG); lfoG.connect(lapGain.gain);
  lfo.start();
  lap.connect(lapF); lapF.connect(lapGain); lapGain.connect(ambBus);
  lap.start();

  // low drone (D2 + A2, slightly detuned)
  const droneG = ctx.createGain(); droneG.gain.value = 0.045; droneG.connect(musicBus);
  for (const [f, det] of [[73.42, 0], [110.0, 4], [73.42, -6]]) {
    const o = ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = f; o.detune.value = det;
    const g = ctx.createGain(); g.gain.value = 0.5;
    o.connect(g); g.connect(droneG);
    o.start();
  }
  started = true;
}

export function setAudioOn(on) {
  if (!ctx) initAudio();
  if (!ctx) return;
  if (on) ctx.resume(); else { /* keep ctx running; just gate the master */ }
  muted = !on;
  master.gain.setTargetAtTime(on ? 0.85 : 0.0, ctx.currentTime, 0.25);
}
export function setAudioPaused(p) {
  if (!ctx) return;
  if (p) ctx.suspend(); else ctx.resume();
}

// ---------- one-shot synth voices ----------

function pluck(freq, when, vol = 0.5, bright = 1.0) {
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.01;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass';
  f.frequency.setValueAtTime(freq * 6 * bright, when);
  f.frequency.exponentialRampToValueAtTime(freq * 1.5, when + 0.9);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 1.5);
  const g2 = ctx.createGain(); g2.gain.value = 0.24;
  o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(musicBus);
  o.start(when); o.stop(when + 1.6);
  o2.start(when); o2.stop(when + 1.6);
}

function taiko(when, vol = 0.8) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(85, when);
  o.frequency.exponentialRampToValueAtTime(46, when + 0.28);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.42);
  o.connect(g); g.connect(musicBus);
  o.start(when); o.stop(when + 0.5);
  const n = ctx.createBufferSource(); n.buffer = noiseBuf;
  const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 190;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(vol * 0.6, when);
  ng.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
  n.connect(nf); nf.connect(ng); ng.connect(musicBus);
  n.start(when); n.stop(when + 0.3);
}

function bell(when, vol = 0.5) {
  for (const [f, v, dur] of [[659.3, 1, 3.2], [1318.5, 0.4, 2.2], [987.8, 0.22, 2.6]]) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol * v, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(musicBus);
    o.start(when); o.stop(when + dur);
  }
}

function noiseShot({ when, dur = 1.2, type = 'lowpass', f0 = 800, f1 = 120, q = 0.8, vol = 0.6, bus = sfxBus, attack = 0.02 }) {
  const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, when);
  f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), when + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + attack);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  n.connect(f); f.connect(g); g.connect(bus);
  n.start(when); n.stop(when + dur + 0.1);
}

function thunder(when, vol = 0.9) {
  noiseShot({ when, dur: 1.7, f0: 620, f1: 70, vol: vol * 0.7, attack: 0.04 });
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 44;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol * 0.7, when + 0.06);
  g.gain.exponentialRampToValueAtTime(0.001, when + 1.6);
  o.connect(g); g.connect(sfxBus);
  o.start(when); o.stop(when + 1.7);
}

function roar(when, vol = 0.55, base = 108) {
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 2.2); }
  shaper.curve = curve;
  const outG = ctx.createGain();
  outG.gain.setValueAtTime(0, when);
  outG.gain.linearRampToValueAtTime(vol, when + 0.22);
  outG.gain.setValueAtTime(vol, when + 1.1);
  outG.gain.exponentialRampToValueAtTime(0.001, when + 1.8);
  const form1 = ctx.createBiquadFilter(); form1.type = 'bandpass'; form1.frequency.value = 420; form1.Q.value = 1.6;
  const form2 = ctx.createBiquadFilter(); form2.type = 'bandpass'; form2.frequency.value = 940; form2.Q.value = 2.2;
  shaper.connect(form1); form1.connect(outG);
  const g2 = ctx.createGain(); g2.gain.value = 0.4;
  form2.connect(g2); g2.connect(outG);
  outG.connect(sfxBus);
  for (const det of [0, 9, -11]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(base + det, when);
    o.frequency.linearRampToValueAtTime(base * 0.78 + det, when + 1.5);
    const og = ctx.createGain(); og.gain.value = 0.34;
    o.connect(og); og.connect(shaper);
    o.start(when); o.stop(when + 1.9);
  }
}

function whoosh(when, vol = 0.4) {
  noiseShot({ when, dur: 0.75, type: 'bandpass', f0: 260, f1: 1900, q: 1.1, vol, attack: 0.18 });
}

function splash(when, vol = 0.9) {
  noiseShot({ when, dur: 1.1, type: 'highpass', f0: 2600, f1: 300, vol: vol * 0.55, attack: 0.015 });
  noiseShot({ when, dur: 0.5, f0: 500, f1: 90, vol: vol * 0.7, attack: 0.01 });
  for (let i = 0; i < 5; i++) {
    const o = ctx.createOscillator(); o.type = 'sine';
    const dt = 0.25 + Math.random() * 0.9;
    const f0 = 700 + Math.random() * 900;
    o.frequency.setValueAtTime(f0, when + dt);
    o.frequency.exponentialRampToValueAtTime(f0 * 1.9, when + dt + 0.09);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when + dt);
    g.gain.linearRampToValueAtTime(0.12, when + dt + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, when + dt + 0.14);
    o.connect(g); g.connect(sfxBus);
    o.start(when + dt); o.stop(when + dt + 0.2);
  }
}

function crackle(when, dur = 2.4, vol = 0.3) {
  noiseShot({ when, dur, type: 'highpass', f0: 2400, f1: 1400, vol, attack: 0.25 });
}

function shimmer(when, dur = 2.4, vol = 0.16) {
  for (const f of [2350, 3100, 4200]) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol / 3, when + 0.5);
    g.gain.setValueAtTime(vol / 3, when + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(when); o.stop(when + dur + 0.1);
  }
}

// ---------- the score: phrases + synced one-shots ----------

let phraseIdx = 0;
const PHRASE_T = 4.5;
let melodySeed = 9;
function schedulePhrase(startT) {
  const rng = () => { melodySeed = (melodySeed * 1664525 + 1013904223) >>> 0; return (melodySeed >>> 8) / 16777216; };
  const storm = SH.uStorm.value;
  const n = 2 + Math.floor(rng() * 4);
  let tt = startT;
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * PENTA.length);
    pluck(PENTA[idx], tt, 0.22 + rng() * 0.2, 1.0 - storm * 0.35);
    tt += 0.35 + rng() * 0.8;
  }
  if (rng() < 0.5) pluck(PENTA[0] / 2, tt + 0.4, 0.16, 0.8);  // low octave answer
}

let lastPhraseMark = -1;

const EVENTS = [
  { t: BEATS.roar, fn: (w) => roar(w, 0.5) },
  { t: BEATS.emerge, fn: (w) => whoosh(w, 0.5) },
  { t: BEATS.fire, fn: (w) => crackle(w, 2.6, 0.34) },
  { t: BEATS.frost, fn: (w) => shimmer(w, 2.6, 0.2) },
  { t: BEATS.bolt, fn: (w) => thunder(w, 0.95) },
  { t: BEATS.clash, fn: (w) => { taiko(w, 0.9); thunder(w, 0.5); } },
  { t: BEATS.skim, fn: (w) => whoosh(w, 0.55) },
  { t: BEATS.dive, fn: (w) => taiko(w, 0.8) },
  { t: BEATS.splash, fn: (w) => splash(w, 1.0) },
  { t: BEATS.bloom, fn: (w) => { bell(w, 0.5); bell(w + 1.4, 0.3); taiko(w, 0.5); } },
  { t: BEATS.up, fn: (w) => taiko(w, 0.6) },
  { t: BEATS.recoil, fn: (w) => pluck(220, w, 0.4, 1.1) },
];

export function updateAudio(t, prevT, playing) {
  if (!ctx || !playing || muted) return;
  const now = ctx.currentTime;

  // continuous ambience follows the storm
  const storm = SH.uStorm.value;
  const wind = 0.05 + SH.uWindPow.value * 0.3;
  windGain.gain.setTargetAtTime(wind * 0.55, now, 0.4);
  windFilter.frequency.setTargetAtTime(260 + storm * 420 + wind * 240, now, 0.5);
  lapGain.gain.setTargetAtTime(0.022 * (1 - storm * 0.6), now, 0.4);

  // phrase scheduler (loop-aware marks)
  const mark = Math.floor(t / PHRASE_T);
  if (mark !== lastPhraseMark) {
    lastPhraseMark = mark;
    schedulePhrase(now + 0.05);
  }

  // beat-synced one-shots (handle the loop seam)
  for (const e of EVENTS) {
    const hit = prevT < e.t && t >= e.t;
    const wrapped = prevT > t && (prevT < e.t || t >= e.t);
    if (hit || wrapped) e.fn(now + 0.03);
  }
}
