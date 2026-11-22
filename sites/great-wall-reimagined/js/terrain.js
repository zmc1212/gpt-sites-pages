// 地形:燕山山脊(高度场)+ 秋山植被 + 岩石;输出 mountainHeight
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './textures.js';
import { mountainHeight, ridgeInfo, RIDGE_PTS, STRUCTS } from './config.js';

export { mountainHeight, mountainHeight as plainHeight };

export function buildTerrain(scene, mats) {
  const SIZE = 6000, SEG = 190;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cRock = new THREE.Color(0x615c50), cA = new THREE.Color(0x7c7448), cB = new THREE.Color(0x5e6a44), cAut = new THREE.Color(0xa8682c), cDeep = new THREE.Color(0x44503a);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = mountainHeight(x, z);
    pos.setY(i, y);
    const patch = (Math.sin(x * 0.02 + 2.1) + Math.cos(z * 0.017 + 0.7)) * 0.5;
    tmp.copy(cA).lerp(cB, (patch + 1) * 0.5);
    // 秋色带(坡地 30~120m 高度最浓)
    const aut = Math.min(1, Math.max(0, (y - 26) / 60)) * Math.min(1, Math.max(0, (140 - y) / 60));
    tmp.lerp(cAut, aut * 0.55);
    // 脊线岩色
    const r = ridgeInfo(x, z);
    const crest = Math.min(1, Math.max(0, (6 - r.d) / 8));
    tmp.lerp(cRock, crest * 0.72);
    // 深谷绿
    const deep = Math.min(1, Math.max(0, (y - 8) / 40));
    tmp.lerp(cDeep, (1 - deep) * 0.4);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, mats.mountain);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  buildVegetation(scene, mats);
  return { ground };
}

// ---- 植被 ----
function autumnGeometry(seed = 88) {
  const rnd = mulberry32(seed);
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.32, 0.5, 4.4, 7);
  trunk.translate(0, 2.2, 0);
  parts.push(trunk);
  const clumps = 4;
  let y = 4.0;
  for (let i = 0; i < clumps; i++) {
    const r = 2.4 * (1 - (i / clumps) * 0.5) * (0.8 + rnd() * 0.4);
    const h = 1.6 + rnd() * 0.8;
    const clump = new THREE.SphereGeometry(r, 7, 6);
    clump.scale(1.15, h / (2 * r), 1.15);
    clump.translate((rnd() - 0.5) * 1.2, y + h * 0.35, (rnd() - 0.5) * 1.2);
    parts.push(clump);
    y += 1.3 + rnd() * 0.5;
  }
  return mergeGeometries(parts);
}

function pineGeometry(seed = 88) {
  const rnd = mulberry32(seed);
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.4, 0.7, 5.0, 7);
  trunk.translate(0, 2.5, 0);
  parts.push(trunk);
  const clumps = 6;
  let y = 4.4;
  for (let i = 0; i < clumps; i++) {
    const r = 2.2 * (1 - (i / clumps) * 0.6) * (0.85 + rnd() * 0.3);
    const h = 1.3 + rnd() * 0.7;
    const clump = new THREE.SphereGeometry(r, 7, 6);
    clump.scale(1, h / (2 * r), 1);
    clump.translate((rnd() - 0.5) * 0.9, y + h * 0.4, (rnd() - 0.5) * 0.9);
    parts.push(clump);
    y += 1.1 + rnd() * 0.4;
  }
  return mergeGeometries(parts);
}

function shrubGeometry(seed = 199) {
  const g = new THREE.SphereGeometry(1, 7, 6);
  const p = g.attributes.position;
  const rnd = mulberry32(seed);
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.75 + rnd() * 0.5), p.getY(i) * 0.6 * (0.75 + rnd() * 0.5), p.getZ(i) * (0.75 + rnd() * 0.5));
  }
  g.computeVertexNormals();
  return g;
}

function rockGeometry(seed = 311) {
  const g = new THREE.DodecahedronGeometry(1, 0);
  const p = g.attributes.position;
  const rnd = mulberry32(seed);
  for (let i = 0; i < p.count; i++) {
    const k = 0.7 + rnd() * 0.6;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.72, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

function scatterInstanced(scene, geo, mat, count, seed, place) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pv = new THREE.Vector3();
  const rnd = mulberry32(seed);
  let placed = 0, guard = 0;
  while (placed < count && guard < count * 40) {
    guard++;
    const x = (rnd() - 0.5) * 4200, z = (rnd() - 0.5) * 4200 - 40;
    if (Math.abs(x) > 2050 || Math.abs(z + 40) > 2050) continue;
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

function inReserve(x, z) {
  const r = ridgeInfo(x, z);
  if (r.d < 26) return true;                       // 墙带
  if (Math.hypot(x - STRUCTS.village.x, z - STRUCTS.village.z) < 60) return true; // 村舍
  return false;
}

function buildVegetation(scene, mats) {
  // 秋树(三种叶色,坡地成林)
  const geoA = autumnGeometry(101);
  const geoB = autumnGeometry(211);
  const geoC = autumnGeometry(331);
  const place = (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = mountainHeight(x, z);
    if (y < 9 || y > 150) return null;
    if (rnd() < 0.6) return { y: y - 0.2, s: 0.9 + rnd() * 1.7 };
    return null;
  };
  scatterInstanced(scene, geoA, mats.autumnA, 240, 51, place);
  scatterInstanced(scene, geoB, mats.autumnB, 200, 52, place);
  scatterInstanced(scene, geoC, mats.autumnC, 160, 53, place);
  // 松(脊线两侧与高坡)
  scatterInstanced(scene, pineGeometry(), mats.pine, 210, 61, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = mountainHeight(x, z);
    if (y < 40) return null;
    if (rnd() < 0.55) return { y: y - 0.2, s: 0.9 + rnd() * 1.6 };
    return null;
  });
  // 灌木
  scatterInstanced(scene, shrubGeometry(), mats.shrub, 220, 77, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = mountainHeight(x, z);
    if (y < 8) return null;
    return { y: y - 0.1, s: 0.8 + rnd() * 1.5 };
  });
  // 山岩
  scatterInstanced(scene, rockGeometry(), mats.rock, 190, 313, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = mountainHeight(x, z);
    return { y: y - 0.2, s: 0.8 + rnd() * 2.6 };
  });
}
