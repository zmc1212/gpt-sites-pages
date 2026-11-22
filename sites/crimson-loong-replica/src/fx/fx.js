// Effects: breath cones (fire/frost), lightning bolts, splash bursts, mist,
// fireflies, birds, and the pearl. All parametric in film time (loop-safe).
import * as THREE from 'three';
import { SH, win, clamp, lerp, R } from '../lib/util.js';
import { NOISE, ATM } from '../lib/glsl.js';
import { BEATS, DUR } from '../film/beats.js';
import { Paths } from '../film/path.js';
import { splashRings, splashPoint, Water } from '../world/water.js';
import { Tex } from '../lib/tex.js';

export const Fx = { group: new THREE.Group(), breath: {}, lightning: [], pearl: null };

const BREATH_VERT = /* glsl */`
varying vec2 vUv; varying vec3 vW;
void main(){
  vUv = uv;
  vec3 p = position;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const BREATH_FRAG = (colA, colB) => /* glsl */`
precision highp float;
varying vec2 vUv; varying vec3 vW;
uniform float uTime; uniform float uK;
${NOISE}${ATM}
void main(){
  float core = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
  float n = fbm(vec2(vUv.y * 7.0 - uTime * 3.4, vUv.x * 5.0 + sin(uTime * 2.0) * 0.4));
  float body = smoothstep(0.5 - core * 0.45, 0.85, n + core * 0.5);
  float edge = smoothstep(0.5, 0.0, abs(vUv.x - 0.5) * 2.0 - core * 0.35);
  vec3 col = mix(${colA}, ${colB}, clamp(vUv.y * 1.4 - 0.2, 0.0, 1.0)) * (body * 1.6 + 0.35);
  float a = body * edge * uK;
  gl_FragColor = vec4(col, a);
}`;

function makeBreath(colorA, colorB, len, radius) {
  const geo = new THREE.CylinderGeometry(radius * 0.28, radius, len, 10, 8, true);
  geo.translate(0, -len / 2, 0);   // cone extends forward from the mouth, -Y
  geo.rotateX(-Math.PI / 2);       // now along +Z
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: SH.uTime, uStorm: SH.uStorm, uK: { value: 0 },
      uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
    },
    vertexShader: BREATH_VERT,
    fragmentShader: BREATH_FRAG(colorA, colorB),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;
  mesh.frustumCulled = false;
  return mesh;
}

// particle burst rendered parametrically from an event time
const BURST_VERT = /* glsl */`
attribute float aSeed;
uniform float uT0; uniform float uNow; uniform vec3 uCenter; uniform float uSpread;
uniform float uGravity; uniform float uSpeed; uniform float uSize;
uniform vec2 uDir; uniform float uCone;
varying float vA;
void main(){
  float age = uNow - uT0 - aSeed * 0.35;
  if (age < 0.0) age = 0.0;
  float life = 2.6 + aSeed * 1.8;
  float k = clamp(age / life, 0.0, 1.0);
  float ang = aSeed * 6.2832 + uDir.x;
  float up = mix(uDir.y, 1.0, 0.4 + 0.4 * aSeed);
  float sp = uSpeed * (0.5 + 0.7 * fract(aSeed * 13.7));
  vec3 vel = vec3(cos(ang) * uCone, up, sin(ang) * uCone) * sp;
  vel.y -= uGravity * age;
  vec3 pos = uCenter + vel * age;
  vA = (1.0 - k) * smoothstep(0.0, 0.05, age);
  vec4 mv = viewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 - k * 0.6) / max(-mv.z, 2.0) * 300.0;
}`;

const BURST_FRAG = /* glsl */`
precision highp float;
varying float vA;
uniform vec3 uColor;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.05, length(d)) * vA;
  gl_FragColor = vec4(uColor, a);
}`;

function makeBurst(count, color, opts) {
  const geo = new THREE.BufferGeometry();
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uT0: { value: -100 }, uNow: SH.uTime,
      uCenter: { value: new THREE.Vector3() }, uSpread: { value: 4 },
      uGravity: { value: 14 }, uSpeed: { value: 16 }, uSize: { value: 3 },
      uDir: { value: new THREE.Vector2(0, 0.8) }, uCone: { value: 0.8 },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: BURST_VERT, fragmentShader: BURST_FRAG,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.visible = false;
  Object.assign(pts.userData, opts);
  return pts;
}

const boltMat = () => new THREE.LineBasicMaterial({
  color: 0xcfe0ff, transparent: true, opacity: 0,
  blending: THREE.AdditiveBlending, depthWrite: false,
});

export function initFx(scene, dragons) {
  const g = Fx.group;
  Fx.dragons = dragons;

  // breaths attached to the heads
  const fire = makeBreath('vec3(1.6, 0.55, 0.12)', 'vec3(1.2, 0.25, 0.05)', 26, 2.6);
  const frost = makeBreath('vec3(0.75, 0.92, 1.1)', 'vec3(0.4, 0.6, 0.95)', 24, 2.4);
  dragons.red.head.add(fire);
  dragons.white.head.add(frost);
  fire.position.set(0, -0.2, 2.2);
  frost.position.set(0, -0.2, 2.2);
  Fx.breath = { fire, frost };

  // mouth lights
  Fx.fireLight = new THREE.PointLight(0xff7722, 0, 45, 1.8);
  Fx.frostLight = new THREE.PointLight(0x88bbff, 0, 45, 1.8);
  dragons.red.head.add(Fx.fireLight); Fx.fireLight.position.set(0, 0, 3);
  dragons.white.head.add(Fx.frostLight); Fx.frostLight.position.set(0, 0, 3);

  // splash burst + spray + foam
  Fx.splash = makeBurst(140, 0xdfe9f2, { speed: 24, gravity: 26, size: 4.5, cone: 1.0 });
  g.add(Fx.splash);
  Fx.spray = makeBurst(90, 0xcfe0ea, { speed: 10, gravity: 18, size: 5, cone: 1.4 });
  g.add(Fx.spray);

  // leaf burst at the skim beat
  Fx.leafBurst = makeBurst(120, 0xc04a28, { speed: 14, gravity: 4, size: 3.6, cone: 1.5 });
  g.add(Fx.leafBurst);

  // lightning bolts (two polylines, regenerated per frame while active)
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(13 * 3), 3));
    const line = new THREE.Line(geo, boltMat());
    line.frustumCulled = false;
    Fx.lightning.push(line);
    g.add(line);
  }

  // pearl
  {
    const pg = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0xffe2a8, emissiveIntensity: 2.4, roughness: 0.3 })
    );
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: Tex.puff, color: 0xffdf9e, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    halo.scale.setScalar(26);
    const light = new THREE.PointLight(0xffdf9e, 0, 260, 1.6);
    pg.add(core, halo, light);
    pg.visible = false;
    Fx.pearl = { group: pg, core, halo, light };
    g.add(pg);
  }

  // fireflies
  {
    const n = 46;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3), seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = 60 + Math.random() * 90;
      pos[i * 3 + 1] = 2 + Math.random() * 5;
      pos[i * 3 + 2] = 20 + Math.random() * 80;
      seeds[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: SH.uTime, uStorm: SH.uStorm },
      vertexShader: /* glsl */`
        attribute float aSeed; varying float vA; uniform float uTime; uniform float uStorm;
        void main(){
          vec3 p = position;
          p.y += sin(uTime * (0.7 + aSeed) + aSeed * 40.0) * 1.4;
          p.x += sin(uTime * 0.5 + aSeed * 20.0) * 2.2;
          vA = (0.35 + 0.65 * fract(sin(aSeed * 91.7) * 7.7)) * (1.0 - uStorm * 0.9)
             * smoothstep(0.35, 0.75, fract(uTime * (0.2 + aSeed * 0.3) + aSeed));
          vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 90.0 / max(-mv.z, 2.0);
        }`,
      fragmentShader: /* glsl */`
        precision highp float; varying float vA;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(d)) * vA;
          gl_FragColor = vec4(vec3(1.4, 1.1, 0.55) * a, a);
        }`,
    });
    const flies = new THREE.Points(geo, m);
    flies.frustumCulled = false;
    g.add(flies);
  }

  // birds: one calm-morning flock
  {
    const n = 9;
    const geo = new THREE.InstancedBufferGeometry();
    const wing = new THREE.BufferGeometry();
    wing.setAttribute('position', new THREE.Float32BufferAttribute(
      [-1, 0.25, 0, 0, 0, 0, 0, 0, 0, 1, 0.25, 0], 3));
    wing.setIndex([0, 1, 2, 2, 1, 3]);
    geo.index = wing.index;
    geo.attributes.position = wing.attributes.position;
    const seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) seeds[i] = Math.random();
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    geo.instanceCount = n;
    const m = new THREE.ShaderMaterial({
      transparent: true, side: THREE.DoubleSide, depthWrite: false,
      uniforms: { uTime: SH.uTime, uStorm: SH.uStorm },
      vertexShader: /* glsl */`
        attribute float aSeed; varying float vA;
        uniform float uTime; uniform float uStorm;
        void main(){
          float lane = aSeed * 2.0 - 1.0;
          float tt = mod(uTime * 0.02 + aSeed * 0.05, 1.0);
          vec3 c = vec3(-420.0 + tt * 840.0, 60.0 + lane * 9.0 + sin(tt * 20.0 + aSeed * 7.0) * 2.0, -60.0 + lane * 26.0);
          float flap = sin(uTime * (7.0 + aSeed * 2.0) + aSeed * 30.0) * 0.5;
          vec3 p = position;
          p.y += abs(p.x) * flap * 0.45;
          vec3 wp = c + p * 2.2;
          vA = (1.0 - uStorm * 0.95) * smoothstep(0.02, 0.1, tt) * smoothstep(1.0, 0.9, tt);
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }`,
      fragmentShader: /* glsl */`
        precision highp float; varying float vA;
        void main(){ gl_FragColor = vec4(vec3(0.1, 0.08, 0.1), vA); }`,
    });
    const birds = new THREE.Mesh(geo, m);
    birds.frustumCulled = false;
    g.add(birds);
  }

  // lake mist banks
  for (let i = 0; i < 6; i++) {
    const w = 140 + Math.random() * 120;
    const mist = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w * 0.4),
      new THREE.MeshBasicMaterial({
        map: Tex.puff, transparent: true, opacity: 0.0, depthWrite: false,
        color: 0xa9a2b8,
      })
    );
    mist.position.set((Math.random() - 0.5) * 260, 2.5 + Math.random() * 5, (Math.random() - 0.5) * 220);
    mist.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.14;
    mist.userData = { drift: (Math.random() - 0.5) * 0.6, base: 0.12 + Math.random() * 0.16 };
    Fx.group.add(mist);
    (Fx.mists = Fx.mists || []).push(mist);
  }

  scene.add(g);
}

const _fw = new THREE.Vector3();
const _fpos = new THREE.Vector3();

export function updateFx(t, prevT, dt, dragons) {
  const b = BEATS;
  const crossed = (beat) => prevT < beat && t >= beat;

  // ---- breaths ----
  const breathR = win(b.fire + 0.4, b.fire + 1.2, b.fire + 2.6, b.fire + 3.6, t);
  const breathW = win(b.frost + 0.4, b.frost + 1.2, b.frost + 2.6, b.frost + 3.6, t);
  const setBreath = (mesh, light, k, dragon) => {
    mesh.visible = k > 0.01;
    mesh.scale.setScalar(0.4 + k * 1.0);
    mesh.material.uniforms.uK.value = k;
    light.intensity = k * 55;
    if (k > 0.01) {
      dragon.head.getWorldPosition(_fpos);
      _fw.set(0, 0, 1).applyQuaternion(dragon.head.quaternion);
      mesh.lookAt(_fpos.clone().add(_fw));
    }
  };
  setBreath(Fx.breath.fire, Fx.fireLight, breathR, dragons.red);
  setBreath(Fx.breath.frost, Fx.frostLight, breathW, dragons.white);

  // ---- splash at the plunge beat ----
  if (crossed(b.splash)) {
    Water.ringT = 0;
    Water.rings.position.set(splashPoint.x, 0.09, splashPoint.z);
    Fx.splash.material.uniforms.uT0.value = t;
    Fx.splash.material.uniforms.uCenter.value.set(splashPoint.x, 1, splashPoint.z);
    Fx.splash.visible = true;
    Fx.spray.material.uniforms.uT0.value = t;
    Fx.spray.material.uniforms.uCenter.value.set(splashPoint.x, 1, splashPoint.z);
    Fx.spray.visible = true;
  }
  if (Fx.splash.visible) {
    Fx.splash.material.uniforms.uNow.value = t;
    if (t - Fx.splash.material.uniforms.uT0.value > 4.5) Fx.splash.visible = false;
  }
  if (Fx.spray.visible) {
    Fx.spray.material.uniforms.uNow.value = t;
    if (t - Fx.spray.material.uniforms.uT0.value > 4.5) Fx.spray.visible = false;
  }

  // ---- leaf burst at the skim beat ----
  if (crossed(b.skim)) {
    const hp = dragons.red.head.getWorldPosition(new THREE.Vector3());
    Fx.leafBurst.material.uniforms.uT0.value = t;
    Fx.leafBurst.material.uniforms.uCenter.value.copy(hp).setY(Math.max(hp.y * 0.5, 6));
    Fx.leafBurst.visible = true;
  }
  if (Fx.leafBurst.visible) {
    Fx.leafBurst.material.uniforms.uNow.value = t;
    if (t - Fx.leafBurst.material.uniforms.uT0.value > 4.5) Fx.leafBurst.visible = false;
  }

  // ---- lightning ----
  const boltK = win(b.bolt, b.bolt + 0.08, b.bolt + 0.55, b.bolt + 0.9, t);
  const boltNear = win(b.clash + 0.4, b.clash + 0.5, b.clash + 0.9, b.clash + 1.3, t);
  const k = Math.max(boltK, boltNear);
  for (let i = 0; i < Fx.lightning.length; i++) {
    const line = Fx.lightning[i];
    line.material.opacity = k * (i === 0 ? 1 : 0.55);
    line.visible = k > 0.02;
    if (line.visible) {
      // jagged path from a cloud anchor down toward the valley
      const anchor = new THREE.Vector3(200 + i * 40, 250, -170 - i * 30);
      const to = new THREE.Vector3(120 + i * 60, 40, -90 + i * 40);
      const arr = line.geometry.attributes.position.array;
      for (let s = 0; s < 13; s++) {
        const f = s / 12;
        const jitter = (s === 0 || s === 12) ? 0 : (Math.sin(s * 91.7 + t * 97.0 + i * 7.0) * 14);
        arr[s * 3] = lerp(anchor.x, to.x, f) + jitter;
        arr[s * 3 + 1] = lerp(anchor.y, to.y, f) + jitter * 0.4;
        arr[s * 3 + 2] = lerp(anchor.z, to.z, f) + jitter;
      }
      line.geometry.attributes.position.needsUpdate = true;
    }
  }
  if (boltK > 0) SH.uFlash.value = Math.max(SH.uFlash.value, boltK * 0.9);

  // ---- pearl ----
  const pearlIn = win(b.up - 0.5, b.up + 2, DUR + 1, DUR + 2, t);
  const bloom = win(b.bloom, b.bloom + 1.5, b.bloom + 7, b.bloom + 12, t);
  const P = Fx.pearl;
  P.group.visible = pearlIn > 0.01;
  if (P.group.visible) {
    const rise = clamp((t - b.up) / (b.bloom - b.up), 0, 1);
    const py = lerp(splashPoint.y + 4, 205, Math.pow(rise, 1.4));
    P.group.position.set(
      lerp(splashPoint.x, -40, rise),
      py,
      lerp(splashPoint.z, -20, rise)
    );
    P.halo.scale.setScalar(20 + bloom * 60 + Math.sin(t * 2.2) * 2);
    P.light.intensity = (1.2 + bloom * 5) * pearlIn;
    P.core.material.emissiveIntensity = 2.4 + bloom * 6;
    if (crossed(b.bloom)) SH.uFlash.value = Math.max(SH.uFlash.value, 1.1);
  }
  SH.uRift.value = bloom;

  // ---- mist banks ----
  const storm = SH.uStorm.value;
  for (const m of Fx.mists || []) {
    m.material.opacity = m.userData.base * (1 - storm * 0.7);
    m.position.x += m.userData.drift * 0.02;
    if (m.position.x > 300) m.position.x = -300;
  }
}
