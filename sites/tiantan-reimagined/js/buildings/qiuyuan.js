// 圜丘坛:三层汉白玉圆台 + 天心石 + 九环石板(块数依史实,皆九的倍数)
import * as THREE from 'three';
import { roundMarbleTerrace } from './marble.js';
import { LAYOUT, QIUYUAN_RINGS } from '../config.js';

export function buildQiuyuan(ctx) {
  const { scene, mats } = ctx;
  const { center, tiers } = LAYOUT.qiuyuan;
  const [cx, cz] = center;
  const g = new THREE.Group();

  const { topY } = roundMarbleTerrace(g, {
    cx, cz, tiers, mat: mats.marble, matFine: mats.marbleFine, stairW: 8.5,
  });

  // 各层顶面装饰盘(石板分位)
  const deckMat = mats.marbleFine;
  tiers.forEach((tier) => {
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(tier.r * 0.975, tier.r * 0.975, 0.1, 64), deckMat);
    deck.position.set(cx, tier.h + 0.05, cz);
    deck.receiveShadow = true;
    g.add(deck);
  });

  // 九环石板(上/中/下三层,共 3402 块,一个 InstancedMesh)
  const bandDefs = [
    { R: QIUYUAN_RINGS.upper, tierTop: tiers[2].h, mul: 0 },   // 9i
    { R: QIUYUAN_RINGS.middle, tierTop: tiers[1].h, mul: 9 },  // 9(9+i)
    { R: QIUYUAN_RINGS.lower, tierTop: tiers[0].h, mul: 18 },  // 9(18+i)
  ];
  let total = 0;
  const ringList = [];
  for (const bd of bandDefs) {
    const bandW = (bd.R.r1 - bd.R.r0) / 9;
    for (let ring = 1; ring <= 9; ring++) {
      const count = 9 * (bd.mul + ring);
      const r = bd.R.r0 + bandW * (ring - 0.5);
      ringList.push({ r, count, y: bd.tierTop + 0.3, bandW });
      total += count;
    }
  }
  const slabGeo = new THREE.BoxGeometry(1, 0.22, 1);
  const slabs = new THREE.InstancedMesh(slabGeo, deckMat, total);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
  let i = 0;
  for (const rg of ringList) {
    const arc = (Math.PI * 2 * rg.r) / rg.count;
    for (let k = 0; k < rg.count; k++) {
      const a = (k / rg.count) * Math.PI * 2;
      _e.set(0, -a + Math.PI / 2, 0);
      _q.setFromEuler(_e);
      _s.set(arc * 0.9, 1, rg.bandW * 0.82);
      _m.compose(new THREE.Vector3(cx + Math.cos(a) * rg.r, rg.y, cz + Math.sin(a) * rg.r), _q, _s);
      slabs.setMatrixAt(i++, _m);
    }
  }
  slabs.count = total;
  slabs.receiveShadow = true;
  g.add(slabs);

  // 天心石(中心副圆石,青黑磨光)
  const heart = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.92, 0.3, 32),
    new THREE.MeshStandardMaterial({ color: 0x46536b, roughness: 0.3, metalness: 0.08 }),
  );
  heart.position.set(cx, tiers[2].h + 0.32, cz);
  heart.receiveShadow = true;
  g.add(heart);

  scene.add(g);
  return { group: g, topY };
}
