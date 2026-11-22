// 地形:平原 + 环山(东侧慈悲山) + 植被;输出 plainHeight 供漫游取高
import * as THREE from 'three';
import { CFG, inTerrace } from './config.js';
import { mulberry32 } from './textures.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---- 值噪声 ----
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += vnoise(x * f, y * f) * amp; amp *= 0.5; f *= 2.1; }
  return v;
}
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// 平原基础高度(台地周边压平)
export function plainHeight(x, z) {
  let h = (fbm(x * 0.004 + 9.7, z * 0.004 + 3.1) - 0.5) * 14;
  h += (fbm(x * 0.02, z * 0.02) - 0.5) * 2.2;
  // 台地周围 90m 缓冲带压平
  const t = CFG.terrace;
  const dx = Math.max(0, Math.abs(x - t.cx) - t.w / 2);
  const dz = Math.max(0, Math.abs(z - t.cz) - t.d / 2);
  const d = Math.hypot(dx, dz);
  h *= smooth(12, 95, d);
  return h;
}

// 山体遮罩:东侧主脊(慈悲山)+ 北/南远丘
function mountainHeight(x, z) {
  const east = smooth(520, 1500, x + 400) * smooth(-800, 200, -Math.abs(z - 60) + 900);
  let ridge = 1 - Math.abs(fbm(x * 0.0022 + 4.2, z * 0.0022 + 8.4) * 2 - 1);
  ridge = Math.pow(ridge, 1.6);
  let h = east * ridge * 460;
  const ring = smooth(750, 1600, Math.hypot(x, z));
  h += ring * (fbm(x * 0.003 + 1.3, z * 0.003 + 6.6) * 0.9) * 190;
  return h;
}

export function heightAt(x, z) {
  if (inTerrace(x, z)) return CFG.terrace.h;
  return plainHeight(x, z) + mountainHeight(x, z) * (1 - smooth(12, 95, distToTerrace(x, z)));
}

function distToTerrace(x, z) {
  const t = CFG.terrace;
  const dx = Math.max(0, Math.abs(x - t.cx) - t.w / 2);
  const dz = Math.max(0, Math.abs(z - t.cz) - t.d / 2);
  return Math.hypot(dx, dz);
}

export function buildTerrain(scene, mats) {
  const SIZE = 3600, SEG = 150;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cLow = new THREE.Color(0x9d8a55), cHigh = new THREE.Color(0x8d7c56);
  const cRock = new THREE.Color(0x7d7160), cRock2 = new THREE.Color(0x6b5f50);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = heightAt(x, z);
    pos.setY(i, y);
    // 颜色:低处干草渐变,山坡岩色
    const slope = (heightAt(x + 6, z) - y) * (heightAt(x, z + 6) - y);
    const rocky = smooth(30, 120, y);
    tmp.copy(cLow).lerp(cHigh, fbm(x * 0.01, z * 0.01));
    if (rocky > 0) {
      const rc = tmp.clone().lerp(slope < 0 ? cRock2 : cRock, rocky * 0.85);
      tmp.copy(rc);
    }
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, mats.ground);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  buildVegetation(scene, mats);
  return { ground };
}

// ---- 植被 ----
function cypressGeometry() {
  const trunk = new THREE.CylinderGeometry(0.16, 0.24, 1.6, 6);
  trunk.translate(0, 0.8, 0);
  const cones = [];
  const lens = [3.4, 2.8, 2.0, 1.3];
  let y = 1.2;
  for (let i = 0; i < 4; i++) {
    const h = lens[i], r = 1.5 - i * 0.32;
    const c = new THREE.ConeGeometry(r, h, 7);
    c.translate(0, y + h / 2, 0);
    y += h * 0.62;
    cones.push(c);
  }
  return mergeGeometries([trunk, ...cones]);
}

function shrubGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 0);
  const p = g.attributes.position;
  const rnd = mulberry32(88);
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.7 + rnd() * 0.5), p.getY(i) * 0.55 * (0.7 + rnd() * 0.5), p.getZ(i) * (0.7 + rnd() * 0.5));
  }
  g.computeVertexNormals();
  return g;
}

function rockGeometry() {
  const g = new THREE.DodecahedronGeometry(1, 0);
  const p = g.attributes.position;
  const rnd = mulberry32(199);
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.6 + rnd() * 0.8), p.getY(i) * (0.5 + rnd() * 0.6), p.getZ(i) * (0.6 + rnd() * 0.8));
  }
  g.computeVertexNormals();
  return g;
}

function scatterInstanced(scene, geo, mat, count, seed, place) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pv = new THREE.Vector3();
  const rnd = mulberry32(seed);
  let placed = 0, guard = 0;
  while (placed < count && guard < count * 30) {
    guard++;
    const x = (rnd() - 0.5) * 3200, z = (rnd() - 0.5) * 3200;
    if (Math.abs(x) > 1560 || Math.abs(z) > 1560) continue;
    const pt = place(x, z, rnd);
    if (!pt) continue;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI * 2);
    s.set(pt.s, pt.s, pt.s);
    pv.set(x, pt.y, z);
    m.compose(pv, q, s);
    mesh.setMatrixAt(placed++, m);
  }
  mesh.count = placed;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function buildVegetation(scene, mats) {
  // 雪松:平原缓坡、台地周边
  scatterInstanced(scene, cypressGeometry(), mats.cypress, 240, 51, (x, z, rnd) => {
    if (distToTerrace(x, z) < 36) return null;
    const y = heightAt(x, z);
    if (y > 130 || y < -4) return null;
    if (rnd() < 0.5 && Math.abs(x) < 620 && Math.abs(z) < 480) return { y, s: 0.7 + rnd() * 1.0 };
    if (rnd() < 0.75) return { y, s: 0.8 + rnd() * 1.6 };
    return null;
  });
  // 灌木
  scatterInstanced(scene, shrubGeometry(), mats.shrub, 210, 77, (x, z, rnd) => {
    if (distToTerrace(x, z) < 30) return null;
    const y = heightAt(x, z);
    if (y > 110) return null;
    return { y, s: 0.8 + rnd() * 1.8 };
  });
  // 山脚乱石
  scatterInstanced(scene, rockGeometry(), mats.rock, 130, 13, (x, z, rnd) => {
    const y = heightAt(x, z);
    if (y < 25 || y > 210) return null;
    return { y: y - 0.3, s: 0.8 + rnd() * 2.6 };
  });
}
