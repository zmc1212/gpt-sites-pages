// Flora: red maples (instanced trunks + canopies), Huangshan pines, shore grass,
// shrubs, and a parametric falling-leaf system. Wind sway comes from the shared
// uniforms; dragon gusts bend canopies via the gust array.
import * as THREE from 'three';
import { SH, R, groundH, enhance, FOG_GLSL } from '../lib/util.js';
import { NOISE, ATM } from '../lib/glsl.js';
import { Tex } from '../lib/tex.js';

export const Flora = { group: new THREE.Group() };

function scatter(count, test) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 60) {
    const x = (R() - 0.5) * 560, z = (R() - 0.5) * 520;
    const y = groundH(x, z);
    if (y > 0.8 && y < 34 && test(x, z, y)) out.push([x, y, z]);
  }
  return out;
}
const farFrom = (pts, d) => (x, z) => pts.every(([px, pz]) => Math.hypot(x - px, z - pz) > d);
const keep = [[95, 58], [40, -20], [-30, 150], [-70, -45], [150, -95]];

export function initFlora(scene) {
  const g = Flora.group;

  // ---------- maples ----------
  const spots = scatter(120, (x, z) => farFrom(keep, 16)(x, z) && Math.hypot(x, z) < 250);
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.42, 5.2, 6);
  trunkGeo.translate(0, 2.6, 0);
  const trunkMat = enhance(new THREE.MeshStandardMaterial({ color: 0x4a2a1c, roughness: 0.95 }), { sway: 0.015, swayH: 5 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, spots.length);
  trunks.castShadow = true;

  const blobGeo = new THREE.IcosahedronGeometry(1, 1);
  const bp = blobGeo.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(bp, i);
    const n = Math.sin(v.x * 5.1) * Math.cos(v.y * 4.3) * Math.sin(v.z * 4.7);
    v.multiplyScalar(1 + n * 0.28);
    bp.setXYZ(i, v.x, v.y, v.z);
  }
  blobGeo.computeVertexNormals();
  const canopyMat = enhance(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }), { sway: 0.05, swayH: 7 });
  const canopyCount = spots.length * 3;
  const canopies = new THREE.InstancedMesh(blobGeo, canopyMat, canopyCount);
  canopies.castShadow = true;

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const col = new THREE.Color();
  const reds = [0xc23a28, 0xd4552e, 0xb02c1e, 0xe0602f, 0xa02518];
  let ci = 0;
  spots.forEach(([x, y, z], i) => {
    const h = 0.8 + R() * 1.5;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * Math.PI * 2);
    m.compose(p.set(x, y, z), q, s.set(1 + R() * 0.5, h, 1 + R() * 0.5));
    trunks.setMatrixAt(i, m);
    for (let k = 0; k < 4; k++) {
      const a = R() * Math.PI * 2, rr = 0.6 + R() * 1.8;
      const cs = 2.1 + R() * 2.1;
      m.compose(
        p.set(x + Math.cos(a) * rr, y + 4.8 * h + (R() - 0.5) * 1.4, z + Math.sin(a) * rr),
        q.setFromEuler(new THREE.Euler(R() * 0.6, R() * 6.28, R() * 0.6)),
        s.set(cs, cs * (0.62 + R() * 0.35), cs)
      );
      canopies.setMatrixAt(ci, m);
      col.setHex(reds[(R() * reds.length) | 0]).offsetHSL((R() - 0.5) * 0.02, 0.05, (R() - 0.3) * 0.1);
      canopies.setColorAt(ci, col);
      ci++;
    }
  });
  if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;
  g.add(trunks, canopies);

  // ---------- pines on the slopes ----------
  const pineSpots = scatter(26, (x, z) => (groundH(x, z) > 12 && farFrom(keep, 20)(x, z)));
  const pineTrunk = new THREE.CylinderGeometry(0.14, 0.3, 3.6, 5);
  pineTrunk.translate(0, 1.8, 0);
  const pineMat = enhance(new THREE.MeshStandardMaterial({ color: 0x3d2a18, roughness: 0.95 }), { sway: 0.01, swayH: 3 });
  const pTrunks = new THREE.InstancedMesh(pineTrunk, pineMat, pineSpots.length);
  pTrunks.castShadow = true;
  const needleMat = enhance(new THREE.MeshStandardMaterial({ color: 0x1d3a22, roughness: 0.9, flatShading: true }), { sway: 0.03, swayH: 5 });
  const discGeo = new THREE.IcosahedronGeometry(1, 1);
  const dp = discGeo.attributes.position;
  for (let i = 0; i < dp.count; i++) { const y = dp.getY(i); dp.setY(i, y * 0.38); }
  discGeo.computeVertexNormals();
  const discs = new THREE.InstancedMesh(discGeo, needleMat, pineSpots.length * 5);
  discs.castShadow = true;
  let di = 0;
  pineSpots.forEach(([x, y, z], i) => {
    const h = 0.8 + R() * 1.1;
    m.compose(p.set(x, y, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28), s.set(1, h, 1));
    pTrunks.setMatrixAt(i, m);
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const cs = (2.4 - t * 1.6) * (0.8 + R() * 0.4);
      m.compose(
        p.set(x + (R() - 0.5) * 0.4, y + 2.4 * h + t * 2.6 * h, z + (R() - 0.5) * 0.4),
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28),
        s.set(cs, cs * 0.6, cs)
      );
      discs.setMatrixAt(di, m);
      col.setHex(0x1d3a22).offsetHSL(0, 0, (R() - 0.5) * 0.05);
      discs.setColorAt(di, col);
      di++;
    }
  });
  if (discs.instanceColor) discs.instanceColor.needsUpdate = true;
  g.add(pTrunks, discs);

  // ---------- shore grass (crossed cards) ----------
  const grassGeo = new THREE.BufferGeometry();
  {
    const pos = [], uv = [], vc = [];
    const quad = (rotY) => {
      const c = Math.cos(rotY), sn = Math.sin(rotY);
      const w = 0.55;
      const pts = [[-w, 0], [w, 0], [w, 1.15], [-w, 1.15]];
      const idx = pos.length / 3;
      for (const [px, py] of pts) {
        pos.push(px * c, py, px * sn);
        uv.push((px + w) / (2 * w), py / 1.15);
        vc.push(0.42, 0.62, 0.24);
      }
      for (const [px, py] of pts) {
        pos.push(px * c, py, px * sn);
        uv.push((px + w) / (2 * w), py / 1.15);
        vc.push(0.78, 0.42, 0.16);
      }
    };
    quad(0); quad(Math.PI / 2);
    grassGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    grassGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    grassGeo.setAttribute('color', new THREE.Float32BufferAttribute(vc, 3));
    grassGeo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
  }
  const grassSpots = scatter(700, (x, z, y) => y < 4.5 && Math.hypot(x, z) < 220);
  const grassMat = enhance(new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, roughness: 1, side: THREE.DoubleSide,
  }), { sway: 0.22, swayH: 1.15 });
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, grassSpots.length);
  grassSpots.forEach(([x, y, z], i) => {
    m.compose(
      p.set(x, y - 0.05, z),
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28),
      s.set(0.5 + R() * 0.8, 0.45 + R() * 0.9, 1)
    );
    grass.setMatrixAt(i, m);
  });
  g.add(grass);

  // ---------- shrubs ----------
  const shrubGeo = new THREE.IcosahedronGeometry(1, 1);
  const sp = shrubGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(sp, i);
    v.y *= 0.55; v.multiplyScalar(1 + Math.sin(v.x * 6) * Math.cos(v.z * 5) * 0.2);
    sp.setXYZ(i, v.x, v.y, v.z);
  }
  shrubGeo.computeVertexNormals();
  const shrubSpots = scatter(90, (x, z, y) => y < 6 && Math.hypot(x, z) < 240);
  const shrubMat = enhance(new THREE.MeshStandardMaterial({ color: 0x2c4a24, roughness: 1, flatShading: true }), { sway: 0.04, swayH: 1 });
  const shrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, shrubSpots.length);
  shrubSpots.forEach(([x, y, z], i) => {
    const cs = 0.7 + R() * 1.4;
    m.compose(p.set(x, y + cs * 0.3, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28), s.set(cs, cs * 0.8, cs));
    shrubs.setMatrixAt(i, m);
    col.setHex(0x2c4a24).offsetHSL((R() - 0.5) * 0.05, 0, (R() - 0.3) * 0.08);
    shrubs.setColorAt(i, col);
  });
  if (shrubs.instanceColor) shrubs.instanceColor.needsUpdate = true;
  shrubs.castShadow = true;
  g.add(shrubs);

  // ---------- falling leaves (parametric, loop-safe) ----------
  const N = 360;
  const leafGeo = new THREE.InstancedBufferGeometry();
  const quad = new THREE.PlaneGeometry(0.55, 0.55);
  leafGeo.index = quad.index;
  leafGeo.attributes.position = quad.attributes.position;
  leafGeo.attributes.uv = quad.attributes.uv;
  const origins = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const s0 = spots[(R() * spots.length) | 0] || [0, 4, 0];
    origins[i * 3] = s0[0] + (R() - 0.5) * 4;
    origins[i * 3 + 1] = s0[1] + 4.5 + R() * 3;
    origins[i * 3 + 2] = s0[2] + (R() - 0.5) * 4;
    seeds[i] = R();
  }
  leafGeo.setAttribute('aOrigin', new THREE.InstancedBufferAttribute(origins, 3));
  leafGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  leafGeo.instanceCount = N;
  const leafMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
    uniforms: {
      uTime: SH.uTime, uWindDir: SH.uWindDir, uWindPow: SH.uWindPow, uStorm: SH.uStorm,
      uTex: { value: Tex.leaf },
      uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
      uSunDir: SH.uSunDir, uSunColor: SH.uSunColor,
    },
    vertexShader: /* glsl */`
      attribute vec3 aOrigin; attribute float aSeed;
      varying vec2 vUv; varying vec3 vW; varying vec3 vC; varying vec3 vCol; varying float vA;
      uniform float uTime; uniform vec3 uWindDir; uniform float uWindPow;
      void main(){
        vUv = uv;
        float T = 7.0 + aSeed * 5.0;
        float ph = fract(uTime / T + aSeed * 7.13);
        vec3 w = vec3(uWindDir.x, 0.0, uWindDir.z) * (2.0 + 9.0 * uWindPow);
        vec3 pos = aOrigin + vec3(0.0, -1.0, 0.0) * ph * (9.0 + aSeed * 4.0) + w * ph * T;
        pos.x += sin(ph * 6.28 + aSeed * 40.0) * 1.6;
        pos.z += cos(ph * 4.4 + aSeed * 31.0) * 1.6;
        float fade = smoothstep(0.0, 0.06, ph) * smoothstep(1.0, 0.9, ph);
        vCol = mix(vec3(0.75, 0.22, 0.12), vec3(0.9, 0.45, 0.15), aSeed) * (0.7 + 0.5 * aSeed);
        vCol *= fade;
        float ang = aSeed * 6.28 + uTime * (0.6 + aSeed);
        float c = cos(ang), sn = sin(ang);
        vec3 local = vec3(position.x * c - position.y * sn * 0.6, position.y * c + position.x * sn * 0.6, position.z);
        local *= fade;   // shrink to nothing at spawn/despawn so no black quads linger
        vW = pos + local;
        vC = cameraPosition;
        vA = fade;
        gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.0);
      }`,
    fragmentShader: /* glsl */`
      precision highp float;
      varying vec2 vUv; varying vec3 vW; varying vec3 vC; varying vec3 vCol; varying float vA;
      uniform sampler2D uTex;
      uniform vec3 uSunDir; uniform vec3 uSunColor;
      ${ATM}
      void main(){
        float a = texture2D(uTex, vUv).a;
        if (a < 0.4 || vA < 0.04) discard;
        vec3 col = vCol * (0.55 + 0.45 * max(dot(normalize(uSunDir), vec3(0.0, 0.6, 0.8)), 0.0)) * uSunColor * 1.6;
        col = atmFog(col, vW, vC, 0.7);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const leaves = new THREE.Mesh(leafGeo, leafMat);
  leaves.frustumCulled = false;
  g.add(leaves);

  scene.add(g);
}
