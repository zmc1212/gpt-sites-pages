// 地形:北京园林的平缓大地 + 古柏林 + 灌木;输出 plainHeight
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './textures.js';

// 平原基础高度(近中轴压平,远处微起伏)
export function plainHeight(x, z) {
  let h = (Math.sin(x * 0.011 + 4.7) + Math.cos(z * 0.013 + 1.3)) * 0.55
        + Math.sin(x * 0.0035 + z * 0.0041) * 1.1;
  // 中轴线与建筑群周边压平
  const axis = Math.min(Math.abs(x), Math.abs(x - 90), Math.abs(x + 90));
  const axisFade = Math.min(1, Math.max(0, (axis - 60) / 90));
  const centerDist = Math.hypot(x, z + 200);
  const buildFade = Math.min(1, Math.max(0, (centerDist - 140) / 160));
  return h * axisFade * buildFade;
}

export function buildTerrain(scene, mats) {
  const SIZE = 4400, SEG = 140;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new THREE.Color(0x99906f), cB = new THREE.Color(0x8a8266), cC = new THREE.Color(0x6f7a58);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = plainHeight(x, z);
    pos.setY(i, y);
    const patch = (Math.sin(x * 0.02 + 2.1) + Math.cos(z * 0.017 + 0.7)) * 0.5;
    tmp.copy(cA).lerp(cB, (patch + 1) * 0.5);
    // 林区偏绿(柏树荫下的苔地)
    const green = Math.min(1, Math.max(0, (Math.abs(x) - 60) / 160)) * Math.min(1, Math.max(0, (Math.abs(z - 90) - 80) / 200));
    tmp.lerp(cC, green * 0.55);
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

// ---- 古柏(天坛标志:粗干、层叠圆冠) ----
function cypressGeometry(seed = 88) {
  const rnd = mulberry32(seed);
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.55, 0.95, 5.2, 8);
  trunk.translate(0, 2.6, 0);
  parts.push(trunk);
  const clumps = 9;
  let y = 4.6;
  for (let i = 0; i < clumps; i++) {
    const r = 2.6 * (1 - i / clumps * 0.62) * (0.85 + rnd() * 0.3);
    const h = 1.5 + rnd() * 0.9;
    const dx = (rnd() - 0.5) * 1.1, dz = (rnd() - 0.5) * 1.1;
    const clump = new THREE.SphereGeometry(r, 7, 6);
    clump.scale(1, h / (2 * r), 1);
    clump.translate(dx, y + h * 0.4, dz);
    parts.push(clump);
    y += 1.15 + rnd() * 0.5;
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

function scatterInstanced(scene, geo, mat, count, seed, place) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pv = new THREE.Vector3();
  const rnd = mulberry32(seed);
  let placed = 0, guard = 0;
  while (placed < count && guard < count * 40) {
    guard++;
    const x = (rnd() - 0.5) * 3400, z = (rnd() - 0.5) * 3600 - 100;
    if (Math.abs(x) > 1650 || Math.abs(z + 100) > 1750) continue;
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

// 保留区(建筑与轴线附近不种树)
function inReserve(x, z) {
  // 中轴带
  if (Math.abs(x) < 55 && z > -490 && z < 190) return true;
  // 圜丘
  if (Math.hypot(x, z + 440) < 62) return true;
  // 祈年殿院
  if (Math.abs(x) < 105 && z > -40 && z < 185) return true;
  // 回音壁院
  if (Math.hypot(x, z + 230) < 55) return true;
  return false;
}

function buildVegetation(scene, mats) {
  const cyp = cypressGeometry();
  // 古柏林(坛墙外成片,天坛特有)
  scatterInstanced(scene, cyp, mats.cypress, 320, 51, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = plainHeight(x, z);
    if (y > 6) return null;
    if (rnd() < 0.62) return { y: y - 0.15, s: 0.9 + rnd() * 1.5 };
    return null;
  });
  // 丹陛桥两侧仪树(整齐成列)
  const bridge = { z0: -400, z1: -20, xL: -24, xR: 24 };
  const pairs = Math.floor((bridge.z1 - bridge.z0) / 16);
  const pairMesh = new THREE.InstancedMesh(cyp, mats.cypress, pairs * 2);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion().identity(), s = new THREE.Vector3();
  let i = 0;
  for (let k = 0; k < pairs; k++) {
    const z = bridge.z0 + k * 16 + 4;
    for (const x of [bridge.xL, bridge.xR]) {
      const y = plainHeight(x, z);
      s.set(1.15, 1.15, 1.15);
      m.compose(new THREE.Vector3(x, y - 0.1, z), q, s);
      pairMesh.setMatrixAt(i++, m);
    }
  }
  pairMesh.count = i;
  pairMesh.castShadow = true; pairMesh.receiveShadow = true;
  scene.add(pairMesh);
  // 灌木
  scatterInstanced(scene, shrubGeometry(), mats.shrub, 170, 77, (x, z, rnd) => {
    if (inReserve(x, z)) return null;
    const y = plainHeight(x, z);
    return { y: y - 0.1, s: 0.8 + rnd() * 1.6 };
  });
}
