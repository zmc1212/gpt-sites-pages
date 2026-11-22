// 地形:金龙峡谷(V 形谷 + 溪流)+ 恒山远山 + 崖顶松林;输出 gorgeHeight
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './textures.js';
import { gorgeHeight, LAYOUT } from './config.js';

export { gorgeHeight, gorgeHeight as plainHeight };

export function buildTerrain(scene, mats) {
  const SIZE = 4200, SEG = 160;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new THREE.Color(0x948674), cB = new THREE.Color(0x867a64), cGreen = new THREE.Color(0x5e6c48), cRock = new THREE.Color(0x7c766a), cWater = new THREE.Color(0x5e7c74);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = gorgeHeight(x, z);
    pos.setY(i, y);
    const patch = (Math.sin(x * 0.02 + 2.1) + Math.cos(z * 0.017 + 0.7)) * 0.5;
    tmp.copy(cA).lerp(cB, (patch + 1) * 0.5);
    // 坡地植被色
    const green = Math.min(1, Math.max(0, (y - 6) / 40));
    tmp.lerp(cGreen, green * 0.5);
    // 崖壁岩色
    if (x < 2) tmp.lerp(cRock, 0.6);
    // 溪床
    const stream = Math.exp(-(((x - 26) / 6) ** 2));
    tmp.lerp(cWater, stream * 0.8);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, mats.riverbed);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  buildCliff(scene, mats);
  buildStream(scene, mats);
  buildFarHills(scene);
  buildVegetation(scene, mats);
  return { ground };
}

// 崖壁大板(z 向板面 + 崖顶)
function buildCliff(scene, mats) {
  const C = LAYOUT.cliff;
  const body = new THREE.Mesh(new THREE.BoxGeometry(C.x1 - C.x0, C.h, C.z1 - C.z0), mats.cliff);
  body.position.set((C.x0 + C.x1) / 2, C.h / 2, (C.z0 + C.z1) / 2);
  body.receiveShadow = true;
  body.userData.noOcclude = true;
  scene.add(body);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(C.x1 - C.x0 + 10, 6, C.z1 - C.z0 + 10), mats.rock);
  cap.position.set((C.x0 + C.x1) / 2 - 3, C.h + 2.5, (C.z0 + C.z1) / 2);
  cap.userData.noOcclude = true;
  scene.add(cap);
}

// 溪流(窄长水面,微光)
function buildStream(scene, mats) {
  const water = new THREE.Mesh(new THREE.PlaneGeometry(9, 340, 8, 60), mats.water);
  water.rotation.x = -Math.PI / 2;
  const pos = water.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.6 + y * 0.18) * 0.06);
  }
  water.geometry.computeVertexNormals();
  water.position.set(26, 1.62, 10);
  water.receiveShadow = true;
  water.userData.noOcclude = true;
  scene.add(water);
}

function hillGeometry(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + rnd() * 0.2;
    const R = 1500 + rnd() * 420;
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    const h = 160 + rnd() * 300;
    const r = h * (1.6 + rnd() * 0.8);
    const cone = new THREE.ConeGeometry(r, h, 10, 3);
    const p = cone.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const px = p.getX(k), pz = p.getZ(k);
      const n = Math.sin(px * 0.05 + i) * Math.cos(pz * 0.04 + i * 1.7);
      p.setX(k, px + n * r * 0.13);
      p.setZ(k, pz + n * r * 0.11);
    }
    cone.computeVertexNormals();
    cone.translate(x, h / 2 - 16, z);
    parts.push(cone);
  }
  return mergeGeometries(parts, false);
}

function buildFarHills(scene) {
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x5e6c4c, roughness: 1 });
  const hills = new THREE.Mesh(hillGeometry(827), hillMat);
  hills.userData.noOcclude = true;
  scene.add(hills);
}

// ---- 植被:崖顶与东坡松柏 + 谷底灌丛 ----
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
  const g = new THREE.SphereGeometry(1, 6, 5);
  const p = g.attributes.position;
  const rnd = mulberry32(seed);
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.8 + rnd() * 0.5), p.getY(i) * 0.55 * (0.7 + rnd() * 0.5), p.getZ(i) * (0.8 + rnd() * 0.5));
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
    const x = (rnd() - 0.5) * 3200, z = (rnd() - 0.5) * 3200;
    if (Math.abs(x) > 1550 || Math.abs(z) > 1550) continue;
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
  // 崖顶松(崖缘线)
  scatterInstanced(scene, pineGeometry(), mats.pine, 120, 61, (x, z, rnd) => {
    if (x > 2 && x < 14 && z > LAYOUT.cliff.z0 - 10 && z < LAYOUT.cliff.z1 + 10) {
      if (rnd() < 0.6) return { y: LAYOUT.cliff.h + 4.8, s: 0.8 + rnd() * 1.2 };
    }
    return null;
  });
  // 坡地松柏
  scatterInstanced(scene, pineGeometry(), mats.pine, 200, 51, (x, z, rnd) => {
    if (x < 10) return null;
    const y = gorgeHeight(x, z);
    if (y < 14) return null;
    if (rnd() < 0.55) return { y: y - 0.2, s: 0.9 + rnd() * 1.6 };
    return null;
  });
  // 谷底灌丛
  scatterInstanced(scene, shrubGeometry(), mats.shrub, 150, 77, (x, z, rnd) => {
    const y = gorgeHeight(x, z);
    if (y > 10 || y < 0.5) return null;
    if (Math.abs(x - 26) < 7) return null; // 溪床
    if (rnd() < 0.5) return { y: y - 0.1, s: 0.7 + rnd() * 1.3 };
    return null;
  });
}
