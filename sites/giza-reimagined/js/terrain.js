// 地形:沙漠 + 吉萨高原台地(西高东低) + 东侧绿洲带 + 岩石散布
import * as THREE from 'three';
import { plateauHeight } from './config.js';
import { mulberry32 } from './textures.js';

const FLAT = [
  { x: 0, z: 200, r: 190 },
  { x: -80, z: -80, r: 180 },
  { x: -180, z: -280, r: 130 },
  { x: 160, z: 60, r: 80 },
  { x: -260, z: -330, r: 60 },
];

// 平原基础高度:台地 + 沙丘(塔基区无沙丘)
export function plainHeight(x, z) {
  const plateau = plateauHeight(x, z);
  let dune = (Math.sin(x * 0.008 + 2.7) + Math.cos(z * 0.009 + 0.9)) * 0.7
           + Math.sin(x * 0.02 + z * 0.017) * 0.6;
  dune *= (1 - Math.min(1, plateau / 40)); // 台地上无沙丘
  let h = plateau + dune;
  // 塔基压平(FLAT 区内回到台地高度)
  for (const f of FLAT) {
    const d = Math.hypot(x - f.x, z - f.z);
    if (d < f.r) {
      const k = Math.min(1, Math.max(0, (d - f.r * 0.72) / (f.r * 0.28)));
      h = h * k + plateau * (1 - k);
    }
  }
  return h;
}

export function heightAt(x, z) {
  return plainHeight(x, z);
}

export function buildTerrain(scene, mats) {
  const SIZE = 4200, SEG = 140;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new THREE.Color(0xd8b878), cB = new THREE.Color(0xccaa62), cGreen = new THREE.Color(0x6e7c44);
  const cPlateau = new THREE.Color(0xc4a870), cRock = new THREE.Color(0xa89060);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = plainHeight(x, z);
    pos.setY(i, y);
    const patch = (Math.sin(x * 0.012 + 1.7) + Math.cos(z * 0.014 + 0.3)) * 0.5;
    tmp.copy(cA).lerp(cB, (patch + 1) * 0.5);
    tmp.lerp(cPlateau, Math.min(1, Math.max(0, (60 - x) / 120)) * 0.5);
    const green = Math.min(1, Math.max(0, (x - 500) / 400));
    tmp.lerp(cGreen, green * 0.7);
    const edge = Math.min(1, Math.max(0, 1 - Math.abs(x - 100) / 40));
    tmp.lerp(cRock, edge * 0.4);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, mats.sand);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  buildRocks(scene, mats);
  return { ground };
}

function buildRocks(scene, mats) {
  const rnd = mulberry32(77);
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.6 + rnd() * 0.7), p.getY(i) * (0.4 + rnd() * 0.5), p.getZ(i) * (0.6 + rnd() * 0.7));
  }
  geo.computeVertexNormals();
  const mesh = new THREE.InstancedMesh(geo, mats.rock, 90);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  let placed = 0;
  for (let i = 0; i < 400 && placed < 90; i++) {
    const x = 90 + rnd() * 220, z = -420 + rnd() * 700;
    const y = plainHeight(x, z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI * 2);
    s.set(1 + rnd() * 2.4, 0.8 + rnd() * 1.4, 1 + rnd() * 2.4);
    m.compose(new THREE.Vector3(x, y - 0.2, z), q, s);
    mesh.setMatrixAt(placed++, m);
  }
  mesh.count = placed;
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
}
