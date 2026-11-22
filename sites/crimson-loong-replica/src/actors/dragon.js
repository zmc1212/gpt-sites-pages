// The loong: a serpent body skinned on the GPU from a spine texture filled on
// the CPU each frame (position+radius / quaternion rows), plus a procedural
// head, mane, whiskers and legs. Everything here is code - no assets.
import * as THREE from 'three';
import { SH, FOG_GLSL } from '../lib/util.js';
import { NOISE, ATM } from '../lib/glsl.js';

const SPINE_N = 128;
const SEG_U = 220;
const SEG_V = 26;

const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _v = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

const BODIES_VERT = /* glsl */`
uniform sampler2D uSpine;
uniform float uTime; uniform float uBreath; uniform float uFade;
varying vec2 vUv; varying vec3 vW; varying vec3 vC; varying vec3 vN; varying float vR;
vec4 quatRot(vec4 q, vec3 v){
  return vec4(
    q.w * v + cross(q.xyz, v) * 2.0 + q.xyz * dot(q.xyz, v) * 2.0, 1.0);
}
void main(){
  float u = uv.x;
  vec4 sp  = texture2D(uSpine, vec2(u, 0.25));
  vec4 sp2 = texture2D(uSpine, vec2(min(u + 0.006, 1.0), 0.25));
  vec4 sq  = texture2D(uSpine, vec2(u, 0.75));
  vec3 T = normalize(sp2.xyz - sp.xyz);
  vec3 B = quatRot(sq, vec3(1.0, 0.0, 0.0)).xyz;
  vec3 N = quatRot(sq, vec3(0.0, 1.0, 0.0)).xyz;
  float r = sp.w * uFade;
  float a = (uv.y - 0.25) * 6.2831853;
  float ca = cos(a), sa = sin(a);
  // cross-section: taller at the belly, slight flatten top/bottom
  float belly = smoothstep(0.18, 0.0, min(uv.y, 1.0 - uv.y));
  float rx = r * (1.0 + 0.18 * belly);
  float ry = r * (1.0 - 0.30 * belly);
  // dorsal crest + tail fin
  float topBand = smoothstep(0.40, 0.5, uv.y) * smoothstep(0.60, 0.5, uv.y);
  float serr = 0.55 + 0.45 * sin(u * 150.0);
  float finH = (pow(u, 0.5) * 0.30 + smoothstep(0.09, 0.005, u) * 2.4) * serr;
  float fin = topBand * finH * r * (0.85 + 0.15 * sin(uTime * 5.0 + u * 40.0));
  vec3 world = sp.xyz + B * (ca * rx) + N * (sa * ry + fin);
  vN = normalize(B * ca + N * sa);
  vR = r;
  vUv = uv;
  vW = world;
  vC = cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`;

const BODIES_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv; varying vec3 vW; varying vec3 vC; varying vec3 vN; varying float vR;
uniform float uTime; uniform float uBreath;
uniform vec3 uBase; uniform vec3 uDeep; uniform vec3 uBelly; uniform vec3 uRim;
uniform vec3 uSunDir; uniform vec3 uSunColor;
${NOISE}${ATM}
void main(){
  float u = vUv.x;
  vec3 V = normalize(vC - vW);
  vec3 N = normalize(vN);
  // scale cells: stretched along the body, bump-perturbed
  vec2 sc = vec2(u * 220.0, vUv.y * 14.0);
  float cell = vnoise(floor(sc) + 0.5);
  vec2 f = fract(sc) - 0.5;
  float scale = smoothstep(0.55, 0.05, length(f) + cell * 0.12);
  N = normalize(N + vec3(cell - 0.5, (f.y) * 0.55, (f.x) * 0.55) * 0.35);
  // belly plates
  float belly = smoothstep(0.17, 0.02, min(vUv.y, 1.0 - vUv.y));
  float plates = smoothstep(0.35, 0.75, sin(u * 260.0) * 0.5 + 0.5);
  vec3 base = mix(uBase, uDeep, cell * 0.5);
  base = mix(base, uBelly * (0.75 + 0.3 * plates), belly);
  base *= 0.82 + 0.28 * scale;
  // lighting
  vec3 L = normalize(uSunDir);
  float dif = max(dot(N, L), 0.0);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  vec3 col = base * (0.44 + 0.3 * max(N.y, 0.0) + dif * 1.45 * uSunColor);
  col += uRim * rim * (0.28 + dif * 0.5);
  // breath glow veins
  float vein = smoothstep(0.6, 0.95, fbm(vec2(u * 46.0, vUv.y * 9.0) + vec2(-uTime * 1.4, 0.0)));
  col += uRim * vein * uBreath * 2.4;
  col += uBase * uBreath * 0.35;
  col = atmFog(col, vW, vC, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`;

// mane blade: instanced curved strip, sways back with wind and speed
const MANE_VERT = /* glsl */`
attribute float aAngle; attribute float aLen; attribute float aSeed;
uniform float uTime; uniform float uFlow; uniform vec3 uWindDir; uniform float uWindPow;
varying vec2 vUv; varying vec3 vW; varying vec3 vC; varying float vShade;
void main(){
  vUv = uv;
  float sway = sin(uTime * (5.0 + aSeed * 3.0) + aSeed * 40.0) * 0.22
             + uFlow * (0.9 + 0.5 * aSeed);
  float bend = (uv.y * uv.y) * (0.55 + sway) * aLen;
  vec3 local = vec3(position.x * (1.0 - uv.y * 0.4), position.y * aLen, position.z);
  local += vec3(-bend * 0.8, bend * 0.45, bend * 0.35 * sin(aSeed * 20.0));
  float ca = cos(aAngle), sa = sin(aAngle);
  vec3 p = vec3(local.x * ca - local.z * sa, local.y, local.x * sa + local.z * ca);
  p += vec3(uWindDir.x, 0.0, uWindDir.z) * uWindPow * uv.y * 1.4;
  vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
  vW = wp;
  vC = cameraPosition;
  vShade = 0.55 + 0.45 * uv.y;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`;

const MANE_FRAG = /* glsl */`
precision highp float;
varying vec2 vUv; varying vec3 vW; varying vec3 vC; varying float vShade;
uniform vec3 uManeA; uniform vec3 uManeB;
uniform vec3 uSunDir; uniform vec3 uSunColor;
${ATM}
void main(){
  vec3 col = mix(uManeA, uManeB, vUv.y) * vShade;
  col *= 0.9 + 0.5 * max(normalize(uSunDir).y, 0.0);
  col = atmFog(col * uSunColor * 1.25, vW, vC, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`;

export function createDragon(pal) {
  const group = new THREE.Group();

  // ---------- spine texture (row0: pos+radius, row1: quat) ----------
  const half = THREE.DataUtils.toHalfFloat;
  const texData = new Uint16Array(SPINE_N * 2 * 4);
  const spineTex = new THREE.DataTexture(texData, SPINE_N, 2, THREE.RGBAFormat, THREE.HalfFloatType);
  spineTex.minFilter = spineTex.magFilter = THREE.LinearFilter;
  spineTex.wrapS = spineTex.wrapT = THREE.ClampToEdgeWrapping;
  spineTex.needsUpdate = true;

  const bodyUniforms = {
    uSpine: { value: spineTex },
    uTime: SH.uTime,
    uBreath: { value: 0 },
    uFade: { value: 1 },
    uStorm: SH.uStorm,
    uBase: { value: new THREE.Color(pal.base) },
    uDeep: { value: new THREE.Color(pal.deep) },
    uBelly: { value: new THREE.Color(pal.belly) },
    uRim: { value: new THREE.Color(pal.rim) },
    uSunDir: SH.uSunDir, uSunColor: SH.uSunColor,
    uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
  };
  const bodyMat = new THREE.ShaderMaterial({
    uniforms: bodyUniforms,
    vertexShader: BODIES_VERT, fragmentShader: BODIES_FRAG,
    side: THREE.DoubleSide,
  });

  // body grid geometry: position.x carries u, uv carries (u, v)
  const geo = new THREE.BufferGeometry();
  {
    const pos = [], uvs = [], idx = [];
    for (let i = 0; i <= SEG_U; i++) {
      const u = i / SEG_U;
      for (let j = 0; j <= SEG_V; j++) {
        const v = j / SEG_V;
        pos.push(u, v, 0);
        uvs.push(u, v);
      }
    }
    for (let i = 0; i < SEG_U; i++) {
      for (let j = 0; j < SEG_V; j++) {
        const a = i * (SEG_V + 1) + j, b = a + SEG_V + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
  }
  const body = new THREE.Mesh(geo, bodyMat);
  body.frustumCulled = false;
  group.add(body);

  // ---------- head ----------
  const std = (opts) => new THREE.MeshStandardMaterial(Object.assign({ emissive: pal.base, emissiveIntensity: 0.16 }, opts));
  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 11), std({ color: pal.base, roughness: 0.55, flatShading: true }));
  skull.scale.set(0.92, 0.88, 1.3); skull.position.z = 0.15;
  const snoutGeo = new THREE.BoxGeometry(0.66, 0.46, 1.6, 1, 1, 3);
  {
    const p = snoutGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      const taper = 1 - (z + 0.8) / 1.6 * 0.34;
      p.setX(i, p.getX(i) * taper); p.setY(i, p.getY(i) * taper);
    }
    snoutGeo.computeVertexNormals();
  }
  const snout = new THREE.Mesh(snoutGeo, std({ color: pal.base, roughness: 0.55, flatShading: true }));
  snout.position.set(0, -0.08, 1.5);
  const jawGeo = new THREE.BoxGeometry(0.56, 0.2, 1.4, 1, 1, 2);
  jawGeo.translate(0, 0, 0.7);
  const jaw = new THREE.Mesh(jawGeo, std({ color: pal.deep, roughness: 0.6, flatShading: true }));
  jaw.position.set(0, -0.34, 0.78);
  const hornGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.2, 0.15), new THREE.Vector3(0.62, 0.62, -0.1),
    new THREE.Vector3(0.55, 1.05, -0.7), new THREE.Vector3(0.22, 1.3, -1.35),
  ]), 10, 0.11, 6, false);
  const hornMat = std({ color: pal.horn, roughness: 0.35, flatShading: true });
  const hornL = new THREE.Mesh(hornGeo, hornMat);
  const hornR = hornL.clone(); hornR.scale.x = -1;
  const toothMat = std({ color: 0xf0ead8, roughness: 0.4, flatShading: true });
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), toothMat);
    t.position.set(s * (0.26 - i * 0.05), -0.26, 1.9 - i * 0.42);
    t.rotation.x = Math.PI;
    head.add(t);
    const t2 = t.clone(); t2.position.y = -0.4; t2.rotation.x = 0;
    jaw.add(t2);
    t2.position.set(s * (0.22 - i * 0.05), 0.1, 1.15 - i * 0.4);
  }
  const eyeMat = new THREE.MeshStandardMaterial({
    color: pal.eye, emissive: pal.eye, emissiveIntensity: 2.2, roughness: 0.2,
  });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), eyeMat);
  eyeL.position.set(0.44, 0.26, 0.72);
  const eyeR = eyeL.clone(); eyeR.position.x *= -1;
  const glowMat = new THREE.SpriteMaterial({
    map: null, color: pal.eye, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  head.add(skull, snout, jaw, hornL, hornR, eyeL, eyeR);
  head.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  // glow sprites need the puff texture - assigned from Tex by init
  head.userData.glowMat = glowMat;

  // ---------- mane (instanced blades ring around the head) ----------
  const MANE_N = 54;
  const maneGeo = new THREE.InstancedBufferGeometry();
  {
    const blade = new THREE.PlaneGeometry(0.17, 1, 1, 4);
    blade.translate(0, 0.5, 0);
    maneGeo.index = blade.index;
    maneGeo.attributes.position = blade.attributes.position;
    maneGeo.attributes.uv = blade.attributes.uv;
    const angles = new Float32Array(MANE_N), lens = new Float32Array(MANE_N), seeds = new Float32Array(MANE_N);
    for (let i = 0; i < MANE_N; i++) {
      angles[i] = (i / MANE_N) * Math.PI * 2;
      lens[i] = 0.7 + Math.random() * 0.8;
      seeds[i] = Math.random();
    }
    maneGeo.setAttribute('aAngle', new THREE.InstancedBufferAttribute(angles, 1));
    maneGeo.setAttribute('aLen', new THREE.InstancedBufferAttribute(lens, 1));
    maneGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    maneGeo.instanceCount = MANE_N;
  }
  const maneUniforms = {
    uTime: SH.uTime, uFlow: { value: 0 },
    uWindDir: SH.uWindDir, uWindPow: SH.uWindPow,
    uManeA: { value: new THREE.Color(pal.maneA) },
    uManeB: { value: new THREE.Color(pal.maneB) },
    uSunDir: SH.uSunDir, uSunColor: SH.uSunColor,
    uFogColor: SH.uFogColor, uFogSky: SH.uFogSky, uStorm: SH.uStorm,
  };
  const maneMat = new THREE.ShaderMaterial({
    uniforms: maneUniforms, vertexShader: MANE_VERT, fragmentShader: MANE_FRAG,
    side: THREE.DoubleSide,
  });
  const mane = new THREE.Mesh(maneGeo, maneMat);
  mane.frustumCulled = false;
  mane.position.set(0, 0.1, 0.1);
  head.add(mane);

  // ---------- whiskers ----------
  const whiskerMat = std({ color: pal.rim, roughness: 0.5 });
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.3, -0.12, 2.1), new THREE.Vector3(s * 0.9, -0.3, 2.4),
      new THREE.Vector3(s * 1.4, -0.1, 2.0), new THREE.Vector3(s * 1.6, 0.3, 1.3),
    ]), 12, 0.035, 5, false), whiskerMat);
    head.add(w);
  }

  // ---------- legs (4 stations, grip/fly pose lerp) ----------
  const legs = [];
  const legMat = std({ color: pal.deep, roughness: 0.6, flatShading: true });
  const clawMat = std({ color: pal.horn, roughness: 0.4, flatShading: true });
  function makeLeg() {
    const g = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.5, 6), legMat);
    upper.position.y = -0.75;
    const knee = new THREE.Group();
    knee.position.y = -1.5;
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 1.25, 6), legMat);
    lower.position.y = -0.625;
    knee.add(lower);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.24, 7, 6), legMat);
    paw.position.y = -1.3;
    knee.add(paw);
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 5), clawMat);
      c.position.set((i - 1) * 0.14, -1.42, 0.16);
      c.rotation.x = Math.PI / 2.4;
      knee.add(c);
    }
    g.add(upper, knee);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return { g, knee };
  }
  const stations = [
    { u: 0.16, s: 1 }, { u: 0.16, s: -1 }, { u: 0.44, s: 1 }, { u: 0.44, s: -1 },
  ];
  for (const st of stations) {
    const leg = makeLeg();
    legs.push({ ...leg, ...st });
    group.add(leg.g);
  }

  group.add(head);
  head.visible = true;

  // ---------- per-frame spine fill ----------
  const curve = new THREE.CatmullRomCurve3([], false, 'centripetal', 0.5);
  const P = Array.from({ length: SPINE_N }, () => new THREE.Vector3());
  const Q = Array.from({ length: SPINE_N }, () => new THREE.Quaternion());
  const T = Array.from({ length: SPINE_N }, () => new THREE.Vector3());
  const Nv = Array.from({ length: SPINE_N }, () => new THREE.Vector3());
  const basis = new THREE.Matrix4();
  const axis = new THREE.Vector3();
  const prevN = new THREE.Vector3();

  function radiusProfile(u) {
    const chest = Math.exp(-Math.pow((u - 0.87) / 0.13, 2));
    return Math.max(
      pal.len * (0.06 + 0.05 * chest) * Math.pow(1 - (1 - u) * 0.88, 0.75),
      0.34 * (0.7 + u * 0.3)
    );
  }

  function fillSpine(points) {
    curve.points = points;
    for (let i = 0; i < SPINE_N; i++) {
      const u = i / (SPINE_N - 1);
      curve.getPoint(u, P[i]);
    }
    // tangents + parallel transport frames
    for (let i = 0; i < SPINE_N; i++) {
      const a = P[Math.max(i - 1, 0)], b = P[Math.min(i + 1, SPINE_N - 1)];
      T[i].subVectors(b, a);
      if (T[i].lengthSq() < 1e-10) T[i].set(0, 0, 1); else T[i].normalize();
    }
    // initial normal perpendicular to T[0], biased up
    Nv[0].copy(_up).addScaledVector(T[0], -_up.dot(T[0]));
    if (Nv[0].lengthSq() < 1e-6) Nv[0].set(1, 0, 0);
    Nv[0].normalize();
    for (let i = 1; i < SPINE_N; i++) {
      axis.crossVectors(T[i - 1], T[i]);
      const l = axis.length();
      if (l > 1e-6) {
        axis.divideScalar(l);
        const ang = Math.acos(Math.min(1, Math.max(-1, T[i - 1].dot(T[i]))));
        _q.setFromAxisAngle(axis, ang);
        Nv[i].copy(Nv[i - 1]).applyQuaternion(_q);
      } else {
        Nv[i].copy(Nv[i - 1]);
      }
      // keep consistent handedness
      prevN.crossVectors(T[i], Nv[i]);
      if (prevN.lengthSq() < 1e-6) Nv[i].set(1, 0, 0).cross(T[i]).normalize();
    }
    for (let i = 0; i < SPINE_N; i++) {
      basis.makeBasis(Nv[i], _v.crossVectors(T[i], Nv[i]).normalize().negate(), T[i]);
      // build quaternion from basis (x=N-ish, y=B-ish, z=T)
      _q.setFromRotationMatrix(basis);
      const u = i / (SPINE_N - 1);
      const r = radiusProfile(u);
      const o = i * 4;
      const o0 = o, o1 = o + SPINE_N * 4;
      texData[o0] = half(P[i].x); texData[o0 + 1] = half(P[i].y); texData[o0 + 2] = half(P[i].z); texData[o0 + 3] = half(r);
      texData[o1] = half(_q.x); texData[o1 + 1] = half(_q.y); texData[o1 + 2] = half(_q.z); texData[o1 + 3] = half(_q.w);
    }
    spineTex.needsUpdate = true;
  }

  function sampleSpine(u, outPos, outQuat) {
    const i = Math.min(SPINE_N - 1, Math.max(0, Math.round(u * (SPINE_N - 1))));
    if (outPos) outPos.copy(P[i]);
    if (outQuat) outQuat.copy(Q[i]);
    return i;
  }

  const api = {
    group, head, jaw, maneUniforms, bodyUniforms, legs, sampleSpine,
    headQuat: new THREE.Quaternion(), headPos: new THREE.Vector3(),
    lookTarget: new THREE.Vector3(),
    update(env) {
      fillSpine(env.points);
      bodyUniforms.uBreath.value = env.breath || 0;
      bodyUniforms.uFade.value = env.fade ?? 1;
      maneUniforms.uFlow.value = (env.flow || 0) * 0.6;
      // head placement: spine head frame + a bit of look bias
      const hi = SPINE_N - 1;
      head.position.copy(P[hi]).addScaledVector(T[hi], pal.headFwd || 1.2);
      _m.makeBasis(Nv[hi], _v.crossVectors(T[hi], Nv[hi]).normalize().negate(), T[hi]);
      _q.setFromRotationMatrix(_m);
      head.quaternion.copy(_q);
      head.scale.setScalar(pal.headScale || 1);
      jaw.rotation.x = (env.jaw || 0) * 0.55;
      // legs follow spine stations
      for (const leg of legs) {
        const u = leg.u;
        const i = Math.round(u * (SPINE_N - 1));
        leg.g.position.copy(P[i]);
        _m.makeBasis(Nv[i], _v.crossVectors(T[i], Nv[i]).normalize().negate(), T[i]);
        _q.setFromRotationMatrix(_m);
        leg.g.quaternion.copy(_q);
        // pose: grip (bent under) vs fly (tucked back), splay outward
        const tuck = env.tuck ?? 0;
        leg.g.rotateX(-1.1 + tuck * 1.15);
        leg.g.rotateZ(leg.s * (0.55 - tuck * 0.25));
        leg.knee.rotation.x = 0.9 - tuck * 0.75;
      }
    },
  };
  return api;
}
