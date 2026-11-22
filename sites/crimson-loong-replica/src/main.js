// Boot: renderer, lights, modules, film loop, adaptive quality, input.
import * as THREE from 'three';
import { SH, clamp, lerp, decayGusts } from './lib/util.js';
import { buildTextures } from './lib/tex.js';
import { stormAt, windAt, DUR } from './film/beats.js';
import { initSky, updateSky } from './world/sky.js';
import { initTerrain, Terrain } from './world/terrain.js';
import { initFlora } from './world/flora.js';
import { initArch, updateArch } from './world/arch.js';
import { initWater, reflectScene, updateWater, Water } from './world/water.js';
import { BEATS } from './film/beats.js';
import { evalPaths } from './film/path.js';
import { createDragon } from './actors/dragon.js';
import { updateFilmCamera, filmPostState } from './film/camera.js';
import { initFx, updateFx } from './fx/fx.js';
import { initAudio, setAudioOn, setAudioPaused, updateAudio, audioReady } from './audio/audio.js';
import { initPost, renderPost, resizePost, Post } from './render/post.js';

buildTextures();

// capture shader/console errors for the debug hook
const __logs = [];
const _cerr = console.error.bind(console);
console.error = (...a) => { __logs.push(a.map(String).join(' ').slice(0, 500)); _cerr(...a); };
window.__logs = __logs;

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 4000);

// ---- lights ----
const hemi = new THREE.HemisphereLight(0x8d7ba6, 0x2e2320, 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffb37a, 2.4);
sun.position.copy(SH.uSunDir.value).multiplyScalar(420);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -280; sun.shadow.camera.right = 280;
sun.shadow.camera.top = 280; sun.shadow.camera.bottom = -280;
sun.shadow.camera.near = 60; sun.shadow.camera.far = 950;
sun.shadow.bias = -0.0006;
scene.add(sun);
scene.add(sun.target);

// ---- world ----
initSky(scene);
initTerrain(scene);
initFlora(scene);
initArch(scene);
initWater(scene, renderer);

// ---- actors ----
const RED_PAL = {
  base: 0xa83226, deep: 0x701c12, belly: 0xd9a441, rim: 0xe0b060,
  horn: 0xe8dcc8, eye: 0xffb340, maneA: 0x8e2118, maneB: 0xe0b060,
  len: 26, headScale: 1.15, headFwd: 1.4,
};
const WHITE_PAL = {
  base: 0xe8e4da, deep: 0xb8b2a2, belly: 0xbcd8c8, rim: 0xaac8d8,
  horn: 0xf0e6d0, eye: 0x9adfff, maneA: 0xcfd8de, maneB: 0x9fc3d4,
  len: 24, headScale: 1.05, headFwd: 1.4,
};
const redDragon = createDragon(RED_PAL);
const whiteDragon = createDragon(WHITE_PAL);
scene.add(redDragon.group, whiteDragon.group);

initFx(scene, { red: redDragon, white: whiteDragon });
initPost(renderer);

// ---- film clock ----
const F = { t: 0, dt: 0, prev: 0, paused: false, soundOn: false };
window.__seek = (t) => { F.t = t % DUR; };
window.__dbg = () => {
  const rt = Post.compRT;
  const px = (u, v) => {
    const buf = new Uint8Array(4);
    renderer.readRenderTargetPixels(rt, Math.floor(u * (rt.width - 1)), Math.floor(v * (rt.height - 1)), 1, 1, buf);
    return [buf[0], buf[1], buf[2]];
  };
  return {
    center: px(0.5, 0.5), sky: px(0.5, 0.22), ground: px(0.5, 0.72),
    calls: renderer.info.render.calls, tris: renderer.info.render.triangles,
  };
};
window.__cam = (px, py, pz, lx, ly, lz) => {
  camOverride = { p: new THREE.Vector3(px, py, pz), l: new THREE.Vector3(lx, ly, lz) };
};
window.__world = () => ({ scene, camera, renderer });
window.__post = Post;
Post._probe = {};
window.__water = () => Water;
window.__SH = SH;
window.__stormAt = stormAt;
import { BEATS as __B } from './film/beats.js';
window.__BEATS = __B;
// dump the composite framebuffer as a PNG data URL (renders regardless of tab visibility)
window.__audioState = () => audioReady();
window.__snap = () => {
  const rt = Post.compRT;
  const w = rt.width, h = rt.height;
  const buf = new Uint8Array(w * h * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const src = (h - 1 - y) * w * 4;
    img.data.set(buf.subarray(src, src + w * 4), y * w * 4);
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
};

// ---- adaptive quality ----
const quality = { scale: 1, ema: 16, cool: 0 };
function adapt(ms) {
  quality.ema = quality.ema * 0.94 + ms * 0.06;
  quality.cool -= F.dt;
  if (quality.cool > 0) return;
  quality.cool = 1.5;
  if (quality.ema > 24 && quality.scale > 0.55) { quality.scale -= 0.12; resizePost(); }
  else if (quality.ema < 15 && quality.scale < 1.0) { quality.scale += 0.08; resizePost(); }
  Post.scale = clamp(quality.scale, 0.5, 1.0);
}

// ---- resize ----
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  resizePost();
}
window.addEventListener('resize', resize);
resize();

// ---- input ----
const pointer = new THREE.Vector2(0, 0);
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
});
function toggleSound() {
  F.soundOn = !F.soundOn;
  setAudioOn(F.soundOn);
  document.getElementById('ui').classList.add('dim');
}
window.addEventListener('click', toggleSound);
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') toggleSound();
  if (e.code === 'Space') { e.preventDefault(); F.paused = !F.paused; setAudioPaused(F.paused); }
});

// ---- fog palettes follow the storm ----
const fogCalm = { g: new THREE.Color(0x584a52), s: new THREE.Color(0xa6788e) };
const fogStorm = { g: new THREE.Color(0x1a1922), s: new THREE.Color(0x3a3748) };
const tmpC = new THREE.Color();

// ---- debug camera override (the film camera runs otherwise) ----
let camOverride = null;
const _followP = new THREE.Vector3();
window.__follow = (which, d = 42) => {
  camOverride = which ? { follow: which, d } : null;
};
function applyFollowCam() {
  const dragon = camOverride.follow === 'white' ? whiteDragon : redDragon;
  dragon.head.getWorldPosition(_followP);
  camera.position.copy(_followP).add(new THREE.Vector3(camOverride.d, camOverride.d * 0.3, camOverride.d));
  camera.lookAt(_followP);
  camera.fov = 44; camera.updateProjectionMatrix();
}

// ---- main loop ----
let prev = performance.now();
let lastTick = performance.now();
let veil = document.getElementById('veil');
let frameNo = 0;
window.__frame = () => ({ frameNo, lost: renderer.getContext().isContextLost(), renderErr: window.__renderErr || null });
function tickFrame(now) {
  lastTick = performance.now();
  try {
    const ms = Math.min(now - prev, 100);
    prev = now;
    F.dt = F.paused ? 0 : ms / 1000;
    if (!F.paused) F.t = (F.t + F.dt) % DUR;
    const t = F.t;

    // envelopes -> shared uniforms
    SH.uTime.value = t;
    SH.uStorm.value = stormAt(t);
    SH.uWindPow.value = windAt(t);
    const st = SH.uStorm.value;
    SH.uFogColor.value.copy(tmpC.copy(fogCalm.g).lerp(fogStorm.g, st));
    SH.uFogSky.value.copy(tmpC.copy(fogCalm.s).lerp(fogStorm.s, st));
    sun.intensity = lerp(2.4, 0.3, st) + SH.uFlash.value * 3.0;
    hemi.intensity = lerp(0.85, 0.4, st);
    decayGusts(F.dt);

    updateSky(t);
    updateArch(t);
    const env = evalPaths(t);
    redDragon.update(env.red);
    whiteDragon.update(env.white);
    reflectScene(renderer, scene, camera);
    updateWater(t, F.dt, F.t, F.prev, BEATS.splash);
    updateFx(t, F.prev, F.dt, { red: redDragon, white: whiteDragon });
    F.prev = F.t;
    if (camOverride && camOverride.follow) {
      applyFollowCam();
    } else if (camOverride) {
      camera.position.copy(camOverride.p);
      camera.lookAt(camOverride.l);
      camera.fov = 38; camera.updateProjectionMatrix();
    } else {
      updateFilmCamera(t, camera, pointer, F.dt);
    }
    const ps = filmPostState(t, camera.position.y);
    Post.fade = ps.fade;
    Post.underwater = ps.under;
    updateAudio(t, F.prev, F.soundOn && !F.paused);
    renderPost(renderer, scene, camera, F.dt);
    adapt(ms);
    frameNo++;
    if (veil.style.opacity !== '0') veil.style.opacity = '0';
  } catch (e) {
    if (!window.__renderErr) window.__renderErr = String(e && e.stack || e);
    throw e;
  }
}
requestAnimationFrame(function loop(now) {
  requestAnimationFrame(loop);
  tickFrame(now);
});
// fallback: some embedding webviews suspend rAF; keep the film alive at a low rate
setInterval(() => {
  if (performance.now() - lastTick > 120) tickFrame(performance.now());
}, 60);
