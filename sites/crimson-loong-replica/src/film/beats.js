// The beat sheet: every subsystem (paths, FX, audio, camera) reads these.
import { win } from '../lib/util.js';

export const DUR = 90;
export const BEATS = {
  dawn:      0.0,   // calm valley, red loong coiled on the spire
  stir:      10.0,  // storm starts building, wind rises
  emerge:    18.5,  // white loong pours out of the storm cloud
  roar:      20.5,
  duel:      22.0,
  fire:      26.0,  // red breathes fire
  frost:     31.0,  // white answers with frost
  bolt:      35.2,  // lightning strikes near the white loong
  skim:      36.8,  // red skims the canopy -> leaf burst
  clash:     39.0,  // mid-air clash flash
  dive:      40.0,  // both spiral down toward the lake
  splash:    43.2,  // impact, rings, camera shake
  under:     44.0,  // underwater beat
  up:        48.0,  // pearl lights up in the deep, they rise
  pearlRise: 49.5,
  bloom:     60.0,  // pearl bursts into light, rift opens
  calm:      66.0,  // storm unwinds
  recoil:    72.0,  // red re-coils onto the spire
  whiteGone: 80.0,  // white dissolves back into the cloud
  end:       88.0,
};

// Smooth storm envelope (period-safe: 0 at both ends).
export function stormAt(t) {
  const B = BEATS;
  return smoothUp(t, B.dawn, B.stir, B.duel) * smoothDown(t, B.calm, B.end, DUR);
}
function smoothUp(t, a, b, c) { return win3(a, b, c, t); }
function smoothDown(t, a, b, dur) { return 1 - win3(a, b, dur, t); }
function win3(t0, t1, t2, x) {
  if (x <= t0) return 0;
  if (x >= t2) return 1;
  const u = (x - t0) / (t2 - t0);
  const s = u * u * (3 - 2 * u);
  const k = (t1 - t0) / (t2 - t0);
  return s <= k ? s / k : 1;
}
export function windAt(t) {
  const B = BEATS;
  const duelWind = 0.55 + 0.45 * Math.sin(t * 0.9);
  return 0.08
    + 0.35 * stormAt(t) * (0.7 + 0.3 * Math.sin(t * 0.7))
    + 0.5 * win(B.duel, B.duel + 4, B.dive, B.dive + 4, t) * duelWind
    + 0.15 * win(B.bloom, B.bloom, B.bloom + 3, B.bloom + 6, t);
}
