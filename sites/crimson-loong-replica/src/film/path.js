// Choreography: both dragons' spine control points and expression state as a
// pure function of film time. Beat windows come from the shared beat sheet.
import * as THREE from 'three';
import { BEATS, DUR } from './beats.js';
import { win, clamp, lerp, smoother } from '../lib/util.js';

const CP = 16;
const tmp = Array.from({ length: CP }, () => new THREE.Vector3());
const tmpB = Array.from({ length: CP }, () => new THREE.Vector3());

// --- pose generators -------------------------------------------------------

// coiled on the spire top: a slow spiral with a raised, wandering head.
// all time terms use integer multiples of 2*pi/DUR so the loop is seamless.
const TAU90 = Math.PI * 2 / 90;
function coilPose(t, out, center, baseY, phase) {
  const turns = 1.45;
  const breathe = Math.sin(t * TAU90 * 5 + phase) * 0.5;
  for (let i = 0; i < CP; i++) {
    const f = i / (CP - 1);
    const a = f * turns * Math.PI * 2 + Math.sin(t * TAU90 * 2 + phase) * 0.25;
    const r = (7.5 - f * 5.2) * (1 + 0.06 * Math.sin(f * 9 + t * TAU90 * 6));
    const y = baseY + Math.pow(f, 1.3) * 6.5 + Math.sin(f * 6.28 + t * TAU90 * 10) * 0.6;
    out[i].set(center.x + Math.cos(a) * r, y, center.z + Math.sin(a) * r);
  }
  // head rises above the coil and looks around
  const h = out[CP - 1];
  const a = turns * Math.PI * 2 + Math.sin(t * TAU90 * 2 + phase) * 0.25 + breathe * 0.5;
  h.set(
    center.x + Math.cos(a) * 3.2,
    baseY + 8.0 + Math.sin(t * TAU90 * 7 + phase) * 1.2,
    center.z + Math.sin(a) * 3.2
  );
  if (CP > 14) {
    out[CP - 2].lerpVectors(out[CP - 3], h, 0.75);
    out[CP - 2].y += 1.0;
  }
}

// flight: the body trails a moving point along a big valley circuit
function flightPoint(tau, out, center, radius, height, phase, amp) {
  const w = 0.30;
  const a = tau * w + phase;
  out.set(
    center.x + Math.cos(a) * radius + Math.sin(tau * 0.7 + phase) * amp,
    center.y + height + Math.sin(tau * 0.62 + phase * 1.7) * 13 + Math.sin(tau * 1.7) * 5,
    center.z + Math.sin(a) * radius * 0.82 + Math.cos(tau * 0.51) * amp
  );
}
function flyPose(t, out, center, radius, height, phase, amp) {
  const lag = 0.055;
  // head (index CP-1) rides the current path point; earlier indices trail
  for (let i = 0; i < CP; i++) {
    const tau = t - (CP - 1 - i) * lag;
    flightPoint(tau, out[i], center, radius, height, phase, amp);
    out[i].y += Math.sin(tau * 2.6 - (CP - 1 - i) * 0.62) * 2.2;   // travelling undulation
    out[i].x += Math.sin(tau * 1.9 - (CP - 1 - i) * 0.62) * 1.6;
  }
}

// dive: spiral tightening onto the splash point
function divePose(t, out, from, to, t0, dur) {
  const u = clamp((t - t0) / dur, 0, 1);
  const e = u * u;
  for (let i = 0; i < CP; i++) {
    const f = i / (CP - 1);
    const tt = t - (1 - f) * 0.30 * (1 - e) - (1 - f) * 0.08;
    const uu = clamp((tt - t0) / dur, 0, 1);
    const ee = uu * uu;
    const a = uu * 9 + f * 0.7;
    const r = lerp(26, 2.5, ee) * (1 + f * 0.25);
    out[i].set(
      lerp(lerp(from.x, to.x, ee) + Math.cos(a) * r, to.x, ee),
      lerp(lerp(from.y, to.y, ee) + Math.sin(a * 1.3) * r * 0.4, to.y + 1.5, ee),
      lerp(lerp(from.z, to.z, ee) + Math.sin(a) * r, to.z, ee)
    );
  }
}

// rise: helix climbing around the pearl column
function risePose(t, out, to, t0, dur, phase, topY) {
  const u = clamp((t - t0) / dur, 0, 1);
  for (let i = 0; i < CP; i++) {
    const f = i / (CP - 1);
    const tt = t - (1 - f) * 0.26;
    const uu = clamp((tt - t0) / dur, 0, 1);
    const a = uu * 7.5 + phase + f * 0.5;
    const r = lerp(3.5, 14, uu * (1 - uu) * 4) * (1 + f * 0.3);
    const y = lerp(to.y + 2, topY, Math.pow(uu, 1.25)) + Math.sin(a * 2) * 1.2;
    out[i].set(to.x + Math.cos(a) * r, y, to.z + Math.sin(a) * r);
  }
}

// vanish into the storm cloud
function cloudPose(t, out, c, spread) {
  for (let i = 0; i < CP; i++) {
    const f = i / (CP - 1);
    out[i].set(
      c.x + Math.sin(f * 7 + t * 0.4) * spread,
      c.y + Math.cos(f * 5 - t * 0.3) * spread * 0.4 - f * 14,
      c.z + Math.sin(f * 9.1 + t * 0.35) * spread
    );
  }
}

function blendPose(out, A, B, w) {
  for (let i = 0; i < CP; i++) out[i].lerpVectors(A[i], B[i], w);
}

// --- the film state --------------------------------------------------------

const center = new THREE.Vector3(0, 0, 0);          // lake center
const spire = new THREE.Vector3(-70, 0, -45);       // main spire
const coilY = 143.5;
const stormC = new THREE.Vector3(260, 300, -210);
const splashP = new THREE.Vector3(8, -1, 6);
const pearlTop = new THREE.Vector3(-40, 210, -20);

const A = Array.from({ length: CP }, () => new THREE.Vector3());
const Bp = Array.from({ length: CP }, () => new THREE.Vector3());
const red = { points: A.map((v) => v.clone()) };
const white = { points: Bp.map((v) => v.clone()) };

export const Paths = { red, white, splashP, pearlTop };

export function evalPaths(t) {
  const B = BEATS;

  // ---------------- red loong ----------------
  // coil -> flight -> duel flight -> dive -> (under) -> rise -> arc home -> coil
  const wFly = win(B.stir + 2, B.duel - 3, B.dive - 0.5, B.dive + 0.8, t);
  const wDive = win(B.dive - 0.5, B.dive + 1.2, B.splash - 0.6, B.splash + 0.4, t);
  const wRise = win(B.up - 1, B.up + 2.5, B.bloom + 9, B.bloom + 12, t);
  const wHome = win(B.recoil - 3, B.recoil + 1.5, B.recoil + 3.5, B.recoil + 6, t);

  coilPose(t, tmp, spire, coilY, 0);
  red.points.forEach((p, i) => p.copy(tmp[i]));
  if (wFly > 0 || wDive > 0 || wRise > 0 || wHome > 0) {
    flyPose(t, tmpB, center, 150, 52, 0, 14);
    if (wFly > 0) {
      blendPose(tmp, red.points, tmpB, wFly);
      red.points.forEach((p, i) => p.copy(tmp[i]));
    }
    if (wDive > 0) {
      divePose(t, tmpB, new THREE.Vector3(center.x + Math.cos(t * 0.3) * 150, 60, Math.sin(t * 0.3) * 120), splashP, B.dive, B.splash - B.dive + 1);
      const diveU = clamp((t - B.dive) / (B.splash - B.dive), 0, 1);
      for (let i = 0; i < CP; i++) tmpB[i].y += Math.sin(t * 2.2 - i * 0.6) * 1.6 * (1 - diveU);
      blendPose(tmp, red.points, tmpB, wDive);
      red.points.forEach((p, i) => p.copy(tmp[i]));
    }
    if (wRise > 0) {
      risePose(t, tmpB, splashP, B.up, B.bloom - B.up + 4, 0, 190);
      blendPose(tmp, red.points, tmpB, wRise);
      red.points.forEach((p, i) => p.copy(tmp[i]));
    }
    if (wHome > 0) {
      flyPose(t, tmpB, center, 90, 90, 2.4, 8);
      blendPose(tmp, red.points, tmpB, wHome);
      red.points.forEach((p, i) => p.copy(tmp[i]));
    }
    coilPose(t, tmp, spire, coilY, 0);
    const wCoil2 = win(B.recoil + 2, B.recoil + 6, DUR + 1, DUR + 2, t);
    if (wCoil2 > 0) {
      blendPose(tmp, red.points, tmp, wCoil2);
      red.points.forEach((p, i) => p.copy(tmp[i]));
    }
  }

  // ---------------- white loong ----------------
  // hidden in cloud -> spiral down -> duel -> dive -> (gone) -> rise -> cloud
  const wEmerg = win(B.emerge - 2, B.emerge + 1.5, B.emerge + 6, B.emerge + 8, t);
  const wWDuel = win(B.duel - 1, B.duel + 1.5, B.dive - 0.5, B.dive + 0.8, t);
  const wWDive = win(B.dive - 0.5, B.dive + 1.2, B.splash - 0.5, B.splash + 0.3, t);
  const wWRise = win(B.up - 0.5, B.up + 2.5, B.bloom + 6, B.bloom + 10, t);
  const wWHome = win(B.bloom + 8, B.bloom + 11, B.whiteGone - 1, B.whiteGone + 1.5, t);

  cloudPose(t, tmpB, stormC, 30);
  white.points.forEach((p, i) => p.copy(tmpB[i]));
  const wHidden = 1 - (wEmerg + wWDuel + wWDive + wWRise + wWHome);
  if (wEmerg > 0) {
    // descend: cloud -> valley circuit
    flyPose(t, tmp, center, 120, 90, Math.PI * 0.85, 10);
    for (let i = 0; i < CP; i++) tmp[i].lerp(stormC, Math.max(0, 1 - wEmerg * 1.15));
    white.points.forEach((p, i) => p.lerpVectors(white.points[i], tmp[i], Math.min(1, wEmerg * 1.2)));
  }
  if (wWDuel > 0) {
    flyPose(t, tmp, center, 152, 64, Math.PI, 18);
    blendPose(tmpB, white.points, tmp, wWDuel);
    white.points.forEach((p, i) => p.copy(tmpB[i]));
  }
  if (wWDive > 0) {
    divePose(t, tmp, new THREE.Vector3(center.x + Math.cos(t * 0.3 + Math.PI) * 178, 70, Math.sin(t * 0.3 + Math.PI) * 146), splashP, B.dive, B.splash - B.dive + 0.6);
    blendPose(tmpB, white.points, tmp, wWDive);
    white.points.forEach((p, i) => p.copy(tmpB[i]));
  }
  if (wWRise > 0) {
    risePose(t, tmp, splashP, B.up, B.bloom - B.up + 2, Math.PI, 230);
    blendPose(tmpB, white.points, tmp, wWRise);
    white.points.forEach((p, i) => p.copy(tmpB[i]));
  }
  if (wWHome > 0) {
    flyPose(t, tmp, center, 210, 150, 0.4, 12);
    blendPose(tmpB, white.points, tmp, wWHome);
    white.points.forEach((p, i) => p.copy(tmpB[i]));
  }
  cloudPose(t, tmp, stormC, 26);
  const wGone = win(B.whiteGone - 1.5, B.whiteGone + 1, DUR + 1, DUR + 2, t);
  if (wGone > 0) {
    white.points.forEach((p, i) => p.lerp(tmp[i], wGone));
  }

  // ---------------- expression ----------------
  const b = BEATS;
  const breathR = win(b.fire + 0.4, b.fire + 1.2, b.fire + 2.6, b.fire + 3.6, t)
    + win(b.bloom + 1, b.bloom + 2, b.bloom + 4, b.bloom + 6, t) * 0.6;
  const breathW = win(b.frost + 0.4, b.frost + 1.2, b.frost + 2.6, b.frost + 3.6, t);
  const jawR = Math.max(
    win(b.roar - 0.3, b.roar + 0.4, b.roar + 1.6, b.roar + 2.4, t),
    breathR
  );
  const jawW = Math.max(breathW, win(b.clash - 0.5, b.clash, b.clash + 1.5, b.clash + 2, t));
  const flowR = 0.35 + win(b.duel - 2, b.duel, b.dive + 2, b.dive + 4, t) * 0.65;
  const flowW = 0.5 + win(b.duel - 2, b.duel, b.dive + 2, b.dive + 4, t) * 0.5;
  const under = win(b.splash - 0.2, b.splash + 0.4, b.up - 0.6, b.up + 0.5, t);
  const whiteFade = clamp(
    (1 - win(b.whiteGone - 1.2, b.whiteGone + 0.8, DUR + 1, DUR + 2, t))
    * smoother(b.emerge - 1.5, b.emerge - 0.4, t),
    0, 1);
  const redTuck = win(b.dive - 1, b.dive, DUR + 1, DUR + 2, t) * (1 - win(b.up + 1, b.up + 2, DUR + 1, DUR + 2, t)) * 0.5;

  return {
    red: {
      points: red.points,
      breath: clamp(breathR, 0, 1), jaw: clamp(jawR, 0, 1),
      flow: flowR, tuck: redTuck, fade: 1, under,
    },
    white: {
      points: white.points,
      breath: clamp(breathW, 0, 1), jaw: clamp(jawW, 0, 1),
      flow: flowW, tuck: 0.55, fade: clamp(whiteFade, 0, 1), under,
    },
  };
}
