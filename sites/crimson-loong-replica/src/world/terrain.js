// Terrain: lake basin ground, karst spires (CPU-displaced lathes), valley cliffs,
// waterfall, stone terraces. Rock shading is procedural (strata + moss + facets).
import * as THREE from 'three';
import { SH, R, fbm2, groundH, FOG_GLSL } from '../lib/util.js';
import { NOISE, FACET, ATM } from '../lib/glsl.js';

export const Terrain = { spireTop: new THREE.Vector3(-70, 148, -45), group: new THREE.Group() };

const rockFrag = /* glsl */`
precision highp float;
varying vec3 vW; varying vec3 vC;
uniform vec3 uSunDir; uniform vec3 uSunColor;
${NOISE}${FACET}${ATM}
void main(){
  vec3 N = facetNormal(vW);
  vec3 V = normalize(vC - vW);
  float strat = vnoise(vec2(vW.y * 0.16, (vW.x + vW.z) * 0.05));
  float grain = fbm(vW.xz * 0.22 + vW.y * 0.03);
  vec3 base = mix(vec3(0.16, 0.155, 0.17), vec3(0.30, 0.285, 0.27), strat * 0.45 + grain * 0.55);
  base *= 0.75 + 0.5 * smoothstep(0.25, 0.85, fbm(vW.xz * 0.045));   // large mottling
  float moss = smoothstep(0.45, 0.75, fbm(vW.xz * 0.06)) * smoothstep(60.0, 6.0, vW.y);
  base = mix(base, vec3(0.13, 0.20, 0.10), moss * 0.55);
  base = mix(base, vec3(0.10, 0.09, 0.10), smoothstep(14.0, 0.0, vW.y) * 0.4); // wet base
  vec3 L = normalize(uSunDir);
  float dif = max(dot(N, L), 0.0);
  float amb = 0.38 + 0.25 * N.y;
  vec3 col = base * (amb + dif * 1.5 * uSunColor);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += vec3(0.9, 0.5, 0.3) * rim * dif * 0.35;
  col = atmFog(col, vW, vC, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`;

const rockVert = /* glsl */`
varying vec3 vW; varying vec3 vC;
void main(){
  vW = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz; vC = cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

function rockMat(side = THREE.FrontSide) {
  return new THREE.ShaderMaterial({
    side,
    uniforms: {
      uTime: SH.uTime, uStorm: SH.uStorm,
      uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
      uSunDir: SH.uSunDir, uSunColor: SH.uSunColor,
    },
    vertexShader: rockVert, fragmentShader: rockFrag,
  });
}

function displaceGeo(geo, fn) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    fn(v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// Karst spire: lathe profile + crag displacement + strata shelves.
function makeSpire(x, z, h, baseR, seed, topFlat = 0) {
  const pts = [];
  const prof = (u) => {
    const r = baseR * (1 - Math.pow(u, 1.35)) * (1 + 0.16 * Math.sin(u * 14 + seed) + 0.08 * Math.sin(u * 31 + seed * 2));
    const plateau = topFlat > 0 ? topFlat * smoothstep01((u - 0.86) / 0.14) : 0;
    return Math.max(r * (1 - smoothstep01((u - 0.86) / 0.14)) + plateau, 0.6);
  };
  function smoothstep01(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
  for (let i = 0; i <= 26; i++) {
    const u = i / 26;
    pts.push(new THREE.Vector2(prof(u), u * h));
  }
  const geo = new THREE.LatheGeometry(pts, 42);
  const y0 = groundH(x, z);
  displaceGeo(geo, (v) => {
    const a = Math.atan2(v.z, v.x);
    const n = fbm2(v.x * 0.09 + seed, v.y * 0.05 + v.z * 0.09, 4);
    const n2 = fbm2(v.y * 0.14 + seed * 3.1, a * 2.4, 3);
    const rr = 1 + (n - 0.5) * 0.5 + (n2 - 0.5) * 0.22;
    v.x *= rr; v.z *= rr;
    v.y += (n2 - 0.5) * 3.0;
  });
  const m = new THREE.Mesh(geo, rockMat());
  m.position.set(x, y0 - 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function initTerrain(scene) {
  const g = Terrain.group;

  // ---- valley ground ----
  {
    const geo = new THREE.PlaneGeometry(900, 900, 150, 150);
    geo.rotateX(-Math.PI / 2);
    displaceGeo(geo, (v) => { v.y = groundH(v.x, v.z); });
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: SH.uTime, uStorm: SH.uStorm,
        uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
        uSunDir: SH.uSunDir, uSunColor: SH.uSunColor,
      },
      vertexShader: rockVert,
      fragmentShader: /* glsl */`
        precision highp float;
        varying vec3 vW; varying vec3 vC;
        uniform vec3 uSunDir; uniform vec3 uSunColor;
        ${NOISE}${FACET}${ATM}
        void main(){
          vec3 N = facetNormal(vW);
          vec3 V = normalize(vC - vW);
          float pat = fbm(vW.xz * 0.035);
          float fine = fbm(vW.xz * 0.5);
          vec3 grass = mix(vec3(0.13, 0.21, 0.08), vec3(0.20, 0.24, 0.10), pat);
          vec3 litter = vec3(0.46, 0.11, 0.06);
          float lit = smoothstep(0.50, 0.78, fbm(vW.xz * 0.08 + 4.7)) * smoothstep(30.0, 8.0, abs(vW.y));
          vec3 base = mix(grass, litter, lit * 0.85);
          base = mix(base, vec3(0.36, 0.28, 0.19), smoothstep(1.6, 0.1, abs(vW.y)) * 0.8);   // shore sand
          base = mix(base, vec3(0.05, 0.07, 0.08), smoothstep(0.0, -2.5, vW.y));             // lake bed
          base *= 0.8 + 0.4 * fine;
          vec3 L = normalize(uSunDir);
          float dif = max(dot(N, L), 0.0);
          vec3 col = base * (0.42 + 0.25 * max(N.y, 0.0) + dif * 1.35 * uSunColor);
          col = atmFog(col, vW, vC, 1.0);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.receiveShadow = true;
    g.add(ground);
  }

  // ---- main spire (the red loong's perch) + companions ----
  g.add(makeSpire(-70, -45, 150, 24, 3.7, 12));
  g.add(makeSpire(150, -95, 74, 16, 8.1, 9));   // pavilion spire
  const spots = [[-230, 60, 96, 30], [235, 130, 70, 22], [-160, -230, 118, 34],
    [40, -270, 88, 26], [280, -40, 100, 28], [-300, -90, 76, 24], [190, 260, 64, 20]];
  for (let i = 0; i < spots.length; i++) {
    const [x, z, h, r] = spots[i];
    g.add(makeSpire(x, z, h, r, 2.3 + i * 1.7, 4));
  }

  // ---- cliffs ring ----
  {
    const geo = new THREE.CylinderGeometry(470, 500, 130, 64, 10, true);
    displaceGeo(geo, (v) => {
      const a = Math.atan2(v.z, v.x);
      const n = fbm2(a * 3.1, v.y * 0.04, 4);
      v.x += (n - 0.5) * 46; v.z += (n - 0.5) * 46;
      v.y += (fbm2(v.x * 0.02, v.z * 0.02, 3) - 0.5) * 22;
    });
    const cliff = new THREE.Mesh(geo, rockMat(THREE.BackSide));
    cliff.position.y = 68;
    g.add(cliff);
  }

  // ---- waterfall off the north cliff ----
  {
    const geo = new THREE.PlaneGeometry(26, 74, 1, 12);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTime: SH.uTime, uStorm: SH.uStorm },
      vertexShader: rockVert,
      fragmentShader: /* glsl */`
        precision highp float;
        varying vec3 vW; varying vec3 vC;
        uniform float uTime; uniform float uStorm;
        ${NOISE}
        void main(){
          float streak = vnoise(vec2(vW.x * 0.8, vW.y * 0.35 - uTime * 1.6));
          streak = smoothstep(0.35, 0.75, streak);
          float edge = smoothstep(0.0, 0.25, vW.x * 0.5 + 0.5) * smoothstep(1.0, 0.7, vW.x * 0.5 + 0.5);
          float fade = smoothstep(1.0, 0.72, (vW.y + 30.0) / 74.0);
          float a = (0.35 + 0.4 * streak) * edge * (0.5 + 0.5 * fade) * (0.7 + 0.5 * uStorm);
          gl_FragColor = vec4(vec3(0.75, 0.82, 0.9), a);
        }`,
    });
    const w = new THREE.Mesh(geo, mat);
    w.position.set(-165, 34, -368);
    w.rotation.y = Math.PI;
    g.add(w);
  }

  scene.add(g);
}
