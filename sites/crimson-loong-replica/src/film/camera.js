// The film camera: a shot table over the 90 s loop, with hand-held noise,
// pointer parallax, impact shake, and a fade at the loop seam.
import * as THREE from 'three';
import { BEATS, DUR } from './beats.js';
import { clamp, lerp, smoother, R } from '../lib/util.js';

const spire = new THREE.Vector3(-70, 146, -45);
const hall = new THREE.Vector3(95, 14, 58);
const gate = new THREE.Vector3(40, 4, -20);
const lake = new THREE.Vector3(8, 0, 6);

const pos = new THREE.Vector3();
const look = new THREE.Vector3();
let fov = 38;

// orbit helper: point on an arc around `c` between angles a0..a1 at radius r
function orbit(c, a0, a1, r, h, u, out) {
  const a = lerp(a0, a1, u);
  out.set(c.x + Math.cos(a) * r, c.y + h, c.z + Math.sin(a) * r);
}

// each shot: (t, P, L) fills camera position + look target; fov via global
const SHOTS = [
  { t0: 0, t1: 10, fn(t, P, L) {                        // dawn establishing
    const u = smoother(0, 1, t / 10);
    orbit(spire, 2.1, 1.75, 190, 42, u, P);
    L.set(spire.x, spire.y + 8, spire.z);
    fov = 40;
  } },
  { t0: 10, t1: BEATS.emerge - 0.5, fn(t, P, L) {       // storm builds over the hall
    const u = smoother(0, 1, (t - 10) / (BEATS.emerge - 10.5));
    P.set(lerp(-10, 55, u), lerp(20, 26, u), lerp(170, 120, u));
    L.set(hall.x, hall.y + 6, hall.z);
    fov = 42;
  } },
  { t0: BEATS.emerge - 0.5, t1: BEATS.duel, fn(t, P, L) { // the white loong pours down
    const u = smoother(0, 1, (t - BEATS.emerge + 0.5) / (BEATS.duel - BEATS.emerge + 0.5));
    orbit(spire, 1.2, 0.6, 120, 60, u, P);
    L.set(spire.x + 60, spire.y + 90, spire.z + 40);
    fov = 46;
  } },
  { t0: BEATS.duel, t1: BEATS.fire, fn(t, P, L) {       // wide duel tracking
    const u = smoother(0, 1, clamp((t - BEATS.duel) / (BEATS.fire - BEATS.duel), 0, 1));
    orbit(new THREE.Vector3(0, 0, 0), -1.2, -0.4, 230, 95, u, P);
    L.set(0, 66, 0);
    fov = 44;
  } },
  { t0: BEATS.fire, t1: BEATS.frost, fn(t, P, L) {      // fire breath close
    const u = smoother(0, 1, clamp((t - BEATS.fire) / (BEATS.frost - BEATS.fire), 0, 1));
    orbit(new THREE.Vector3(0, 0, 0), -0.5, -1.5, 120, 70, u, P);
    L.set(60, 78, -30);
    fov = 40;
  } },
  { t0: BEATS.frost, t1: BEATS.skim, fn(t, P, L) {      // frost answer + bolt
    const u = smoother(0, 1, clamp((t - BEATS.frost) / (BEATS.skim - BEATS.frost), 0, 1));
    P.set(-140, 55, -110 + u * 40);
    L.set(80, 90, -60);
    fov = 48;
  } },
  { t0: BEATS.skim, t1: BEATS.dive, fn(t, P, L) {       // canopy skim flyby
    const u = smoother(0, 1, clamp((t - BEATS.skim) / (BEATS.dive - BEATS.skim), 0, 1));
    P.set(lerp(-120, -60, u), 12, lerp(60, 40, u));
    L.set(lerp(30, -10, u), lerp(30, 50, u), lerp(-30, -10, u));
    fov = 52;
  } },
  { t0: BEATS.dive, t1: BEATS.splash, fn(t, P, L) {     // the dive, wide
    const u = smoother(0, 1, clamp((t - BEATS.dive) / (BEATS.splash - BEATS.dive), 0, 1));
    orbit(lake, 2.4, 1.9, 130, lerp(70, 26, u), u, P);
    L.set(lake.x, lerp(50, 12, u), lake.z);
    fov = lerp(44, 50, u);
  } },
  { t0: BEATS.splash, t1: BEATS.under + 0.4, fn(t, P, L) { // splash impact
    P.set(lake.x + 30, 7, lake.z + 34);
    L.set(lake.x, 6, lake.z);
    fov = 52;
  } },
  { t0: BEATS.under + 0.4, t1: BEATS.up - 0.6, fn(t, P, L) { // underwater
    const k = smoother(0, 1, clamp((t - BEATS.under - 0.4) / 1.2, 0, 1));
    P.set(lake.x + 8, lerp(3.2, -7, k), lake.z + 9);
    L.set(lake.x - 20, lerp(4, -14, k), lake.z - 18);
    fov = 56;
  } },
  { t0: BEATS.up - 0.6, t1: BEATS.bloom + 2, fn(t, P, L) {  // the rise
    const u = smoother(0, 1, clamp((t - BEATS.up + 0.6) / (BEATS.bloom + 2 - BEATS.up + 0.6), 0, 1));
    orbit(new THREE.Vector3(-20, 0, -10), 2.0, 1.35, lerp(110, 200, u), lerp(40, 150, u), u, P);
    L.set(-20, lerp(30, 160, u), -10);
    fov = lerp(48, 40, u);
  } },
  { t0: BEATS.bloom + 2, t1: BEATS.calm + 2, fn(t, P, L) {  // bloom + rift
    const u = smoother(0, 1, clamp((t - BEATS.bloom - 2) / (BEATS.calm - BEATS.bloom), 0, 1));
    P.set(lerp(60, 20, u), lerp(90, 40, u), lerp(150, 170, u));
    L.set(-30, lerp(170, 120, u), -15);
    fov = 42;
  } },
  { t0: BEATS.calm + 2, t1: BEATS.recoil + 1, fn(t, P, L) { // calm drift to the gate
    const u = smoother(0, 1, clamp((t - BEATS.calm - 2) / (BEATS.recoil - BEATS.calm - 1), 0, 1));
    P.set(lerp(20, -6, u), lerp(40, 22, u), lerp(170, 150, u));
    L.set(gate.x, gate.y + 8, gate.z);
    fov = 40;
  } },
  { t0: BEATS.recoil + 1, t1: BEATS.whiteGone - 1, fn(t, P, L) { // re-coil on the spire
    const u = smoother(0, 1, clamp((t - BEATS.recoil - 1) / 9, 0, 1));
    orbit(spire, -0.6, -1.1, 120, 30, u, P);
    L.set(spire.x, spire.y + 8, spire.z);
    fov = 40;
  } },
  { t0: BEATS.whiteGone - 1, t1: DUR, fn(t, P, L) {          // settle to the opening frame
    const u = smoother(0, 1, clamp((t - BEATS.whiteGone + 1) / (DUR - BEATS.whiteGone + 1), 0, 1));
    orbit(spire, -1.1, -1.55, 120, 30, u, P);
    // end exactly where shot 1 begins
    const a0 = 1.55 + Math.PI * 2;
    P.set(spire.x + Math.cos(a0) * 190, spire.y - 146 + 42, spire.z + Math.sin(a0) * 190);
    L.set(spire.x, spire.y + 8, spire.z);
    fov = lerp(40, 40, u);
  } },
];

const shakePos = new THREE.Vector3();
let shakeAmp = 0;
const _right = new THREE.Vector3();
const _fwd = new THREE.Vector3();

export function updateFilmCamera(t, camera, pointer, dt, events) {
  // find the active shot
  let shot = SHOTS[SHOTS.length - 1];
  for (const s of SHOTS) { if (t >= s.t0 && t < s.t1) { shot = s; break; } }
  shot.fn(t, pos, look);

  // impact shake: splash + bolt moments
  const b = BEATS;
  const shakeT = Math.max(
    win(b.splash - 0.05, b.splash + 0.1, b.splash + 1.4, b.splash + 2.2, t) * 1.6,
    win(b.bolt, b.bolt + 0.1, b.bolt + 0.6, b.bolt + 1.0, t) * 0.8,
    win(b.clash - 0.2, b.clash, b.clash + 0.8, b.clash + 1.4, t) * 0.7
  );
  shakeAmp = Math.max(shakeAmp * Math.pow(0.02, dt), shakeT);
  const hh = t * 137.1;
  shakePos.set(
    (Math.sin(hh) + Math.sin(hh * 2.17)) * 0.5,
    (Math.sin(hh * 1.37) + Math.sin(hh * 2.71)) * 0.5,
    0
  ).multiplyScalar(shakeAmp * 0.9);

  // hand-held micro movement
  const hand = 0.35 + shakeAmp * 0.5;
  pos.x += Math.sin(t * 0.9 + 3.1) * hand + Math.sin(t * 2.3) * hand * 0.4;
  pos.y += Math.sin(t * 1.1 + 1.7) * hand * 0.7;

  camera.position.copy(pos).add(shakePos);
  camera.lookAt(look);

  // pointer parallax
  if (pointer) {
    _fwd.subVectors(look, camera.position).normalize();
    _right.crossVectors(_fwd, camera.up).normalize();
    camera.position.addScaledVector(_right, pointer.x * 5);
    camera.position.y += -pointer.y * 3;
    camera.lookAt(look);
  }

  camera.fov = fov;
  camera.updateProjectionMatrix();
}

function win(t0, t1, t2, t3, x) {
  return smoother(t0, t1, x) * (1 - smoother(t2, t3, x));
}

// loop-seam fade + underwater amount for the post stack
export function filmPostState(t, cameraY) {
  const fadeOut = 1 - smoother(DUR - 1.6, DUR - 0.25, t);
  const fadeIn = smoother(0, 1.1, t);
  const fade = Math.min(fadeOut, fadeIn);
  const under = 1 - smoother(-0.4, 0.4, cameraY);
  return { fade, under: clamp(under, 0, 1) };
}
