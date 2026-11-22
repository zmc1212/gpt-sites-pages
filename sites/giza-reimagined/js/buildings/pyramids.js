// 金字塔群:阶梯堆叠方锥(风化砂岩)+ 卡夫拉光滑石灰岩帽 + 卫星塔
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LAYOUT } from '../config.js';

// 阶梯方锥:layer 层堆叠,逐层收分(吉萨金字塔现在的废墟阶梯形态)
function stepPyramidGeometry(base, h, layers = 44) {
  const geos = [];
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const w = base * (1 - 0.985 * t);
    const lh = h / layers;
    const box = new THREE.BoxGeometry(w, lh, w);
    box.translate(0, lh * (i + 0.5), 0);
    geos.push(box);
  }
  return mergeGeometries(geos, false);
}

// 光滑方锥(卡夫拉顶壳)
function smoothPyramidGeometry(base, h, seg = 1) {
  const r = base / Math.SQRT2 / 2;
  const g = new THREE.ConeGeometry(r * Math.SQRT2 / 2 * 2 / Math.SQRT2, h, 4);
  return g;
}

export function buildPyramids(ctx) {
  const { scene, mats } = ctx;
  const g = new THREE.Group();
  const addCollider = ctx.addCollider;

  for (const P of LAYOUT) {
    if (!P.base) continue;
    const y0 = ctx.groundHeightAt(P.x, P.z);
    const pyr = new THREE.Mesh(stepPyramidGeometry(P.base, P.h), mats.sandstone);
    pyr.position.set(P.x, y0, P.z);
    pyr.castShadow = true; pyr.receiveShadow = true;
    g.add(pyr);
    // 卡夫拉:顶部 25% 光滑石灰岩壳
    if (P.cap) {
      const capH = P.h * 0.25;
      const capBase = P.base * (1 - 0.985 * 0.75);
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(capBase / Math.SQRT2, capH, 4),
        mats.limestone,
      );
      cap.rotateY(Math.PI / 4);
      cap.position.set(P.x, y0 + P.h - capH / 2, P.z);
      cap.castShadow = true; cap.receiveShadow = true;
      g.add(cap);
    }
    // 塔基座(切割台地)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(P.base + 14, 1.2, P.base + 14), mats.limestone);
    plinth.position.set(P.x, y0 + 0.6, P.z);
    plinth.receiveShadow = true;
    g.add(plinth);
    addCollider({
      minX: P.x - P.base / 2, maxX: P.x + P.base / 2,
      minZ: P.z - P.base / 2, maxZ: P.z + P.base / 2,
    });
  }
  scene.add(g);
  return { group: g };
}

// 孟卡拉旁三座卫星塔
export function buildSatellites(ctx) {
  const { scene, mats } = ctx;
  const g = new THREE.Group();
  const specs = [
    { x: -268, z: -352, base: 44, h: 28 },
    { x: -232, z: -368, base: 38, h: 22 },
    { x: -206, z: -384, base: 30, h: 16 },
  ];
  for (const s of specs) {
    const y0 = ctx.groundHeightAt(s.x, s.z);
    const pyr = new THREE.Mesh(stepPyramidGeometry(s.base, s.h, 18), mats.sandstone);
    pyr.position.set(s.x, y0, s.z);
    pyr.castShadow = true; pyr.receiveShadow = true;
    g.add(pyr);
  }
  scene.add(g);
  return { group: g };
}
