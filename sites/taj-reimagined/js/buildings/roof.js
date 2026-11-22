// 中国攒尖屋顶:贝塞尔曲面 Lathe + 飞檐起翘 + 檐下斗拱带 + 鎏金檐口
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { glazeBlueTexture } from '../textures.js';

const bez = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

const roofMats = new Map();
function roofMaterial(rEave, h) {
  const key = `${Math.round(rEave)}|${Math.round(h)}`;
  if (roofMats.has(key)) return roofMats.get(key);
  const map = glazeBlueTexture();
  map.repeat.set(Math.max(6, Math.round(rEave * 0.66)), Math.max(2, Math.round(h * 0.5)));
  map.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({
    map, roughness: 0.42, metalness: 0.05, side: THREE.DoubleSide,
    emissive: 0x101a2e, emissiveIntensity: 0.55,
  });
  roofMats.set(key, m);
  return m;
}

// 单层曲面锥顶(rEave 檐口半径 → rTop 顶半径,h 竖高)
export function conicalRoof({ rEave, rTop, h, flare = 0.16 }) {
  const pts = [];
  const N = 14;
  const midR = rEave * 0.52 + rTop * 0.48;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let x = bez(rEave, midR, rTop, t);
    let y = bez(0, h * 0.66, h, t);
    // 反宇:檐口先垂后翘(屋面凹曲)
    if (t < 0.16) y -= flare * (0.16 - t) / 0.16 * h * 0.09;
    pts.push(new THREE.Vector2(Math.max(x, 0.04), y));
  }
  const g = new THREE.LatheGeometry(pts, 56);
  return g;
}

// 一重檐(屋面 + 金边 + 斗拱带)
export function roofTier(parent, mats, { cx, cz, yBase, rEave, rTop, h, flare = 0.16 }) {
  const mesh = new THREE.Mesh(conicalRoof({ rEave, rTop, h, flare }), roofMaterial(rEave, h));
  mesh.position.set(cx, yBase, cz);
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  // 檐口金边
  const rim = new THREE.Mesh(new THREE.TorusGeometry(rEave * 0.995, 0.14, 6, 72), mats.goldTrim);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(cx, yBase - h * 0.02, cz);
  rim.castShadow = true;
  parent.add(rim);
  // 檐下斗拱带(贴椽)
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(rEave * 0.965, rEave * 0.94, h * 0.16 + 0.7, 64, 1, true),
    mats.dougong,
  );
  band.material = mats.dougong;
  band.position.set(cx, yBase + (h * 0.16 + 0.7) / 2 - 0.12, cz);
  parent.add(band);
  return mesh;
}

// 鎏金宝顶(须弥座 + 火珠 + 尖)
export function finial(parent, mats, x, y, z, scale = 1) {
  const base = new THREE.CylinderGeometry(0.85, 1.25, 1.7, 16);
  base.translate(0, 0.85, 0);
  const ball = new THREE.SphereGeometry(1.3, 18, 14);
  ball.translate(0, 2.55, 0);
  const spike = new THREE.ConeGeometry(0.32, 1.5, 12);
  spike.translate(0, 4.05, 0);
  const g = mergeGeometries([base, ball, spike].map((p) => (p.index ? p.toNonIndexed() : p)), false);
  const m = new THREE.Mesh(g, mats.goldTrim);
  m.position.set(x, y, z);
  m.scale.setScalar(scale);
  m.castShadow = true;
  parent.add(m);
  return m;
}
