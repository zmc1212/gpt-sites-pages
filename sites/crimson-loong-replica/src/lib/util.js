// Shared math + the global uniform block (SH) that every custom shader references.
import * as THREE from 'three';

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const smoother = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeIO = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
// window(t0,t1,t2,t3,x): 0 before t0, 1 inside [t1,t2], 0 after t3 (smoothed)
export const win = (t0, t1, t2, t3, x) => smoother(t0, t1, x) * (1 - smoother(t2, t3, x));

// Deterministic RNG so every load renders the same film.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const R = mulberry32(20261117);

export function fbm2(x, y, oct = 4) { // tiny CPU value-noise fbm (terrain shaping)
  const h = (i, j) => {
    const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  let a = 0, amp = 0.5, fx = x, fy = y;
  for (let o = 0; o < oct; o++) {
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const u = fx - ix, v = fy - iy;
    const uu = u * u * (3 - 2 * u), vv = v * v * (3 - 2 * v);
    a += amp * (h(ix, iy) * (1 - uu) + h(ix + 1, iy) * uu) * (1 - vv)
       + amp * (h(ix, iy + 1) * (1 - uu) + h(ix + 1, iy + 1) * uu) * vv;
    fx *= 2.02; fy *= 2.02; amp *= 0.5;
  }
  return a;
}

// World-space ground height, shared by terrain + flora placement + camera clamps.
export function groundH(x, z) {
  const r = Math.hypot(x, z);
  let h = (fbm2(x * 0.012, z * 0.012) - 0.5) * 9 + (fbm2(x * 0.05, z * 0.05) - 0.5) * 2.4;
  h += Math.pow(smooth(190, 420, r), 1.6) * 90;              // valley walls rise
  h -= 6.2 * smooth(185, 80, r);                             // lake basin
  const plateau = (px, pz, rad, flat, y) => {                // building terraces
    const d = Math.hypot(x - px, z - pz);
    const m = smooth(rad, flat, d);
    return { h: h * (1 - m) + y * m, m };
  };
  const p1 = plateau(95, 58, 58, 26, 6.0);  h = p1.h;        // hall terrace
  const p2 = plateau(40, -20, 34, 14, 1.6); h = p2.h;        // gate shore
  const p3 = plateau(-30, 150, 40, 16, 4.0); h = p3.h;       // pine overlook
  return h;
}

// Global uniforms: one object, referenced by every material so single writes propagate.
export const SH = {
  uTime:     { value: 0 },
  uStorm:    { value: 0 },     // 0 calm dusk -> 1 full storm
  uFlash:    { value: 0 },     // lightning / splash white pop
  uRift:     { value: 0 },     // storm rift opening (pearl act)
  uWindDir:  { value: new THREE.Vector3(0.86, 0, 0.5).normalize() },
  uWindPow:  { value: 0.15 },
  uSunDir:   { value: new THREE.Vector3(-0.82, 0.22, -0.42).normalize() },
  uSunColor: { value: new THREE.Color(0xffb37a) },
  uFogColor: { value: new THREE.Color(0x35303e) },
  uFogSky:   { value: new THREE.Color(0x8a7290) },
  uStormCenter: { value: new THREE.Vector3(260, 300, -210) },
  uGustPos:  { value: Array.from({ length: 8 }, () => new THREE.Vector3(0, -999, 0)) },
  uGustStr:  { value: new Float32Array(8) },
};
let gustHead = 0;
export function addGust(p, str) {
  SH.uGustPos.value[gustHead].copy(p);
  SH.uGustStr.value[gustHead] = str;
  gustHead = (gustHead + 1) % 8;
}
export function decayGusts(dt) {
  const g = SH.uGustStr.value;
  for (let i = 0; i < 8; i++) g[i] = Math.max(0, g[i] - dt * 0.8);
}

// Patch MeshStandard/Lambert materials with world-space wind sway, drifting cloud
// shade and the shared height fog, so all lit surfaces agree with custom shaders.
export function enhance(mat, o = {}) {
  const sway = o.sway || 0, swayH = o.swayH || 4, fogMul = o.fogMul ?? 1;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {
      uTime: SH.uTime, uWindDir: SH.uWindDir, uWindPow: SH.uWindPow, uStorm: SH.uStorm,
      uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
      uSway: { value: sway }, uSwayH: { value: swayH }, uFogMul: { value: fogMul },
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform vec3 uWindDir; uniform float uWindPow;
        uniform float uStorm; uniform float uSway; uniform float uSwayH;
        varying vec3 vWpos; varying vec3 vCamP; varying float vCS;
        float nzz(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float nvn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(nzz(i), nzz(i + vec2(1, 0)), f.x), mix(nzz(i + vec2(0, 1)), nzz(i + vec2(1, 1)), f.x), f.y); }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        {
          vec3 base = vec3(0.0);
          #ifdef USE_INSTANCING
            base = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #endif
          float bend = pow(max(transformed.y / max(uSwayH, 0.001), 0.0), 1.6) * uSway;
          float ph = uTime * (1.0 + 0.3 * fract(base.x * 12.9898 + base.z * 78.233));
          transformed.xz += uWindDir.xz * bend * (2.0 + 6.0 * uWindPow) * (0.55 + 0.45 * sin(ph));
        }`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        {
          #ifdef USE_INSTANCING
            vec4 wpv = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
          #else
            vec4 wpv = modelMatrix * vec4(transformed, 1.0);
          #endif
          vWpos = wpv.xyz; vCamP = cameraPosition;
          float cs = 0.6 + 0.4 * smoothstep(0.34, 0.72, nvn(vWpos.xz * 0.006 + vec2(uTime * 0.018, uTime * 0.011)));
          vCS = mix(1.0, cs, 0.3 + 0.55 * uStorm);
        }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uStorm; uniform vec3 uFogColor; uniform vec3 uFogSky; uniform float uFogMul;
        varying vec3 vWpos; varying vec3 vCamP; varying float vCS;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= vCS;`)
      .replace('#include <dithering_fragment>', `
        {
          float d = distance(vWpos, vCamP);
          float h = clamp(vWpos.y / 150.0, 0.0, 1.0);
          vec3 fogC = mix(uFogColor, uFogSky, h * h);
          float f = 1.0 - exp(-d * d * 0.0000016 * uFogMul * (1.0 + 0.8 * uStorm));
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogC, clamp(f, 0.0, 1.0));
        }
        #include <dithering_fragment>`);
  };
  mat.customProgramCacheKey = () => 'enh' + sway.toFixed(2) + fogMul.toFixed(2);
  return mat;
}

// Render the shared fog math from custom ShaderMaterials (must declare the
// same uniforms + varyings; see chunks in glsl.js).
export const FOG_GLSL = `
vec3 atmFog(vec3 c, vec3 W, vec3 C, float mul, float storm, vec3 fogC0, vec3 fogC1) {
  float d = distance(W, C);
  float h = clamp(W.y / 150.0, 0.0, 1.0);
  vec3 fogC = mix(fogC0, fogC1, h * h);
  float f = 1.0 - exp(-d * d * 0.0000016 * mul * (1.0 + 0.8 * storm));
  return mix(c, fogC, clamp(f, 0.0, 1.0));
}`;
