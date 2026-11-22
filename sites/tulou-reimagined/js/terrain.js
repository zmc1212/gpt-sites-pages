// 地形:茶山梯田 + 远山 + 茶垄/柿树/竹林;输出 teaHeight
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './textures.js';
import { teaHeight, LAYOUT } from './config.js';

export { teaHeight, teaHeight as plainHeight };

export function buildTerrain(scene, mats) {
  const SIZE = 4400, SEG = 160;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new THREE.Color(0x7c8c56), cB = new THREE.Color(0x6c7c4a), cC = new THREE.Color(0x55683e), cPath = new THREE.Color(0x9a8c64);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = teaHeight(x, z);
    pos.setY(i, y);
    const patch = (Math.sin(x * 0.02 + 2.1) + Math.cos(z * 0.017 + 0.7)) * 0.5;
    tmp.copy(cA).lerp(cB, (patch + 1) * 0.5);
    // 深谷竹林色
    const deep = Math.min(1, Math.max(0, (y - 4) / 8));
    tmp.lerp(cC, deep * 0.4);
    // 山径(东南 → 主楼)
    const dx = x - 60, dz = z + 90;
    const roadDist = Math.abs(dx * 0.8 - dz * 0.6 - 0) / 1.0;
    if (roadDist < 7 && x > 0 && z < 0) tmp.lerp(cPath, (1 - roadDist / 7) * 0.55);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, mats.tea);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  buildVegetation(scene, mats);
  buildFarHills(scene);
  return { ground };
}

function hillGeometry(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const peaks = 22;
  for (let i = 0; i < peaks; i++) {
    const a = (i / peaks) * Math.PI * 2 + rnd() * 0.2;
    const R = 1500 + rnd() * 400;
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    const h = 120 + rnd() * 220;
    const r = h * (1.5 + rnd() * 0.8);
    const cone = new THREE.ConeGeometry(r, h, 10, 3);
    const p = cone.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const px = p.getX(k), pz = p.getZ(k);
      const n = Math.sin(px * 0.05 + i) * Math.cos(pz * 0.045 + i * 1.9);
      p.setX(k, px + n * r * 0.13);
      p.setZ(k, pz + n * r * 0.11);
    }
    cone.computeVertexNormals();
    cone.translate(x, h / 2 - 14, z);
    parts.push(cone);
  }
  return mergeGeometries(parts, false);
}

function buildFarHills(scene) {
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x5c7248, roughness: 1 });
  const hills = new THREE.Mesh(hillGeometry(717), hillMat);
  hills.userData.noOcclude = true;
  scene.add(hills);
}

// ---- 植被:茶垄行栽 + 柿树/杉木 + 竹丛 ----
function teaBushGeometry(seed = 88) {
  const g = new THREE.SphereGeometry(1, 6, 5);
  const p = g.attributes.position;
  const rnd = mulberry32(seed);
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.9 + rnd() * 0.3), p.getY(i) * 0.5 * (0.8 + rnd() * 0.4), p.getZ(i) * (0.9 + rnd() * 0.3));
  }
  g.computeVertexNormals();
  return g;
}

function treeGeometry(seed = 88) {
  const rnd = mulberry32(seed);
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.35, 0.55, 4.6, 7);
  trunk.translate(0, 2.3, 0);
  parts.push(trunk);
  const clumps = 4;
  let y = 4.2;
  for (let i = 0; i < clumps; i++) {
    const r = 2.2 * (1 - (i / clumps) * 0.45) * (0.8 + rnd() * 0.4);
    const h = 1.5 + rnd() * 0.8;
    const clump = new THREE.SphereGeometry(r, 7, 6);
    clump.scale(1, h / (2 * r), 1);
    clump.translate((rnd() - 0.5) * 1.2, y + h * 0.35, (rnd() - 0.5) * 1.2);
    parts.push(clump);
    y += 1.3 + rnd() * 0.5;
  }
  return mergeGeometries(parts);
}

function bambooGeometry(seed = 88) {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < 5; i++) {
    const h = 6 + rnd() * 5;
    const stalk = new THREE.CylinderGeometry(0.09, 0.12, h, 6);
    stalk.translate((rnd() - 0.5) * 1.6, h / 2, (rnd() - 0.5) * 1.6);
    stalk.rotateZ((rnd() - 0.5) * 0.16);
    parts.push(stalk);
    const leaf = new THREE.SphereGeometry(0.9 + rnd() * 0.5, 6, 5);
    leaf.scale(1, 0.5, 1);
    leaf.translate((rnd() - 0.5) * 2, h * (0.7 + rnd() * 0.25), (rnd() - 0.5) * 2);
    parts.push(leaf);
  }
  return mergeGeometries(parts);
}

function scatterInstanced(scene, geo, mat, count, seed, place) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pv = new THREE.Vector3();
  const rnd = mulberry32(seed);
  let placed = 0, guard = 0;
  while (placed < count && guard < count * 40) {
    guard++;
    const x = (rnd() - 0.5) * 3000, z = (rnd() - 0.5) * 3000;
    if (Math.abs(x) > 1450 || Math.abs(z) > 1450) continue;
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
  if (Math.hypot(x, z) < 120) return true;                    // 主楼
  for (const c of LAYOUT.cluster) {
    if (Math.hypot(x - c.x, z - c.z) < 70) return true;       // 群楼
  }
  return false;
}

function buildVegetation(scene, mats) {
  // 茶垄(梯田上成行栽植:按台地高度分层铺)
  scatterInstanced(scene, teaBushGeometry(), mats.teaBush, 480, 51, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = teaHeight(x, z);
    if (y < 1.2 || y > 26) return null;
    // 行栽:沿世界 X 的模数
    const row = Math.abs((z * 0.5) % 7 - 3.5);
    if (row > 1.3) return null;
    if (rnd() < 0.7) return { y: y - 0.05, s: 0.9 + rnd() * 0.8 };
    return null;
  });
  // 柿树/杉木
  scatterInstanced(scene, treeGeometry(), mats.pine, 150, 52, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = teaHeight(x, z);
    if (y < 2) return null;
    if (rnd() < 0.5) return { y: y - 0.2, s: 0.9 + rnd() * 1.5 };
    return null;
  });
  // 竹丛(水畔/坡脚)
  scatterInstanced(scene, bambooGeometry(), mats.shrub, 120, 53, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = teaHeight(x, z);
    if (y < 0.5 || y > 10) return null;
    if (rnd() < 0.45) return { y: y - 0.1, s: 0.8 + rnd() * 1.2 };
    return null;
  });
}
