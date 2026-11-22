// 地形:鸣沙山沙丘(垄脊噪声)+ 大漠灌丛/梭梭;输出 duneHeight
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './textures.js';
import { duneHeight, LAYOUT } from './config.js';

export { duneHeight, duneHeight as plainHeight };

export function buildTerrain(scene, mats) {
  const SIZE = 5200, SEG = 170;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new THREE.Color(0xd4a874), cB = new THREE.Color(0xc89c66), cC = new THREE.Color(0xa8784c), cShade = new THREE.Color(0x8c6440);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = duneHeight(x, z);
    pos.setY(i, y);
    const patch = (Math.sin(x * 0.02 + 2.1) + Math.cos(z * 0.017 + 0.7)) * 0.5;
    tmp.copy(cA).lerp(cB, (patch + 1) * 0.5);
    // 沙谷阴影色(低处偏深)
    const shade = Math.min(1, Math.max(0, (10 - y) / 14));
    tmp.lerp(cShade, shade * 0.45);
    // 崖前广场色(压平区偏浅砾)
    const flat = Math.min(1, Math.max(0, (Math.abs(x) - 26) / 90));
    tmp.lerp(cC, (1 - flat) * 0.35);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, mats.sand);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  buildVegetation(scene, mats);
  buildFarDunes(scene, mats);
  return { ground };
}

// 远处沙山(鸣沙山主峰意象:南/东连绵大丘)
function duneHillGeometry(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const peaks = 18;
  for (let i = 0; i < peaks; i++) {
    const a = (i / peaks) * Math.PI * 2;
    const R = 1350 + rnd() * 500;
    const x = Math.cos(a) * R, z = Math.sin(a) * R + 60;
    const h = 90 + rnd() * 160;
    const r = h * (2.4 + rnd() * 1.2);
    const cone = new THREE.ConeGeometry(r, h, 10, 3);
    const p = cone.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const px = p.getX(k), pz = p.getZ(k);
      const n = Math.sin(px * 0.05 + i) * Math.cos(pz * 0.04 + i * 1.7);
      p.setX(k, px + n * r * 0.14);
      p.setZ(k, pz + n * r * 0.12);
    }
    cone.computeVertexNormals();
    cone.translate(x, h / 2 - 8, z);
    parts.push(cone);
  }
  return mergeGeometries(parts, false);
}

function buildFarDunes(scene, mats) {
  const duneMat = new THREE.MeshStandardMaterial({ color: 0xcaa06c, roughness: 1 });
  const hills = new THREE.Mesh(duneHillGeometry(617), duneMat);
  hills.userData.noOcclude = true;
  scene.add(hills);
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
    const x = (rnd() - 0.5) * 3600, z = (rnd() - 0.5) * 3600 + 30;
    if (Math.abs(x) > 1750 || Math.abs(z - 30) > 1750) continue;
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
  // 大漠灌丛/梭梭(稀疏)
  scatterInstanced(scene, shrubGeometry(), mats.shrub, 200, 77, (x, z, rnd) => {
    if (x < 30) return null;                       // 崖前广场不长
    const y = duneHeight(x, z);
    if (y < 2) return null;
    if (rnd() < 0.42) return { y: y - 0.1, s: 0.6 + rnd() * 1.4 };
    return null;
  });
  void LAYOUT;
}
