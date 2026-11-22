// 阿帕达纳宫 Apadana:60m 方厅(36 柱,~18.6m)+ 三面门廊 + 角塔 + 南面大型浮雕双阶梯
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { columnGeometry } from '../columns.js';
import { frieze, rosetteBand, bandStrip } from '../reliefs.js';

const CX = -30, CZ = 45;
// 台地 15 + 垫层顶 15.9 + 三层台基 0.77×3 → 顶面 18.21
const Y = 18.2;
const RISE = 3.2; // 台基总高(自台面 15 登上 Y)

export function buildApadana(ctx) {
  const { scene, mats, addCollider } = ctx;
  const g = new THREE.Group();

  // 大台基(三层收分)
  for (let i = 0; i < 3; i++) {
    const s = 85 - i * 6;
    const layer = new THREE.Mesh(new THREE.BoxGeometry(s, 0.77, s), mats.stone);
    layer.position.set(CX, 15.9 + i * 0.77, CZ);
    layer.castShadow = true; layer.receiveShadow = true;
    g.add(layer);
  }

  // 中央方厅 36 柱(6×6,间距 11m,柱高 18.6)
  const hallGeo = columnGeometry(18.6, 'bull');
  const hall = new THREE.InstancedMesh(hallGeo, mats.stone, 36);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    _m.identity();
    _m.setPosition(CX + (c - 2.5) * 11, Y, CZ + (r - 2.5) * 11);
    hall.setMatrixAt(i++, _m);
  }
  hall.castShadow = true; hall.receiveShadow = true;
  g.add(hall);

  // 三面门廊(W/N/E,各 2 排 × 4 柱,柱高 15.5)+ 角塔
  const porGeo = columnGeometry(15.5, 'bull');
  const por = new THREE.InstancedMesh(porGeo, mats.stone, 24);
  i = 0;
  const place = (x, z) => { _m.identity(); _m.setPosition(x, Y, z); por.setMatrixAt(i++, _m); };
  const side = 33;
  for (const k of [-10, 10]) {
    place(CX - side, CZ + k); place(CX - side - 7, CZ + k);      // 西廊两排
    place(CX + side, CZ + k); place(CX + side + 7, CZ + k);      // 东廊两排
    place(CX + k, CZ + side); place(CX + k, CZ + side + 7);      // 北廊两排
  }
  por.castShadow = true; por.receiveShadow = true;
  g.add(por);

  // 角塔(西北/东北实心塔)
  for (const dx of [-1, 1]) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(11, 14, 11), mats.stone);
    tower.position.set(CX + dx * (side + 3.5), Y + 7, CZ + side + 3.5);
    tower.castShadow = true; tower.receiveShadow = true;
    g.add(tower);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 12), mats.stoneDark);
    cap.position.set(CX + dx * (side + 3.5), Y + 14.6, CZ + side + 3.5);
    g.add(cap);
  }

  // 南面大型浮雕双阶梯(登台基)
  g.add(buildStairFrieze(mats));

  scene.add(g);
  addCollider({ minX: CX - 44, maxX: CX + 44, minZ: CZ - 44, maxZ: CZ + 44, doorS: true });
  return { group: g };
}

// 南双阶梯:两坡道 + 中央铭文板 + 护墙浮雕带(下层使节 / 上层卫兵)
function buildStairFrieze(mats) {
  const g = new THREE.Group();
  const W = 13, RUN = 12, GAP = 6;
  const y0 = 15; // 阶梯自台面起
  const zTop = CZ - 42.5;  // 台基南缘
  const n = 16;

  const steps = [];
  for (const sgn of [-1, 1]) {
    for (let k = 0; k < n; k++) {
      const h = (RISE * (k + 1)) / n;
      const x = CX + sgn * (GAP / 2 + W / 2);
      const zc = zTop - RUN * (k + 1) / (2 * n);
      steps.push(new THREE.BoxGeometry(W, h, RUN * (k + 1) / n).translate(x, y0 + h / 2, zc));
      const px = CX + sgn * (GAP / 2 + W + 0.8);
      steps.push(new THREE.BoxGeometry(1.6, h + 1.4, RUN * (k + 1) / n).translate(px, y0 + (h + 1.4) / 2, zc));
    }
  }
  const stairMat = new THREE.MeshStandardMaterial({ map: mats.stone.map.clone(), roughness: 0.92 });
  const rampMesh = new THREE.Mesh(mergeGeometries(steps, false), stairMat);
  rampMesh.castShadow = true; rampMesh.receiveShadow = true;
  g.add(rampMesh);

  // 中央铭文板
  const mid = new THREE.Mesh(new THREE.BoxGeometry(GAP - 1, RISE + 0.6, RUN + 0.8), mats.stoneDark);
  mid.position.set(CX, y0 + (RISE + 0.6) / 2, zTop - RUN / 2);
  mid.castShadow = true;
  g.add(mid);

  // 浮雕带:沿两坡道护墙内外两侧,随阶梯起坡
  const relMat = mats.relief;
  for (const sgn of [-1, 1]) {
    const zA = zTop - RUN + 1, zB = zTop - 0.5;
    // 外侧(朝东西)
    const wOut = CX + sgn * (GAP / 2 + W + 1.68);
    frieze(g, relMat, { from: [wOut, zA], to: [wOut, zB], count: 8, y: y0 + 0.95, variant: 0, face: [sgn, 0], offset: sgn * 0.08, rise: RISE });
    frieze(g, relMat, { from: [wOut, zA], to: [wOut, zB], count: 8, y: y0 + 2.15, variant: 1, face: [sgn, 0], offset: sgn * 0.08, rise: RISE });
    bandStrip(g, mats.stoneDark, { from: [wOut, zA], to: [wOut, zB], y: y0 + 2.9, face: [sgn, 0], width: 0.22, depth: sgn * 0.08, rise: RISE });
    bandStrip(g, mats.stoneDark, { from: [wOut, zA], to: [wOut, zB], y: y0 + 0.45, face: [sgn, 0], width: 0.22, depth: sgn * 0.08, rise: RISE });
    // 内侧(面向坡道之间的通道,迎向登阶者)
    const wIn = CX + sgn * (GAP / 2 + W);
    frieze(g, relMat, { from: [wIn, zA], to: [wIn, zB], count: 8, y: y0 + 1.0, variant: 1, face: [-sgn, 0], offset: 0, rise: RISE });
  }
  // 中央板玫瑰纹(朝南)
  rosetteBand(g, mats.rose, { from: [CX - 2.2, zTop - RUN + 3], to: [CX + 2.2, zTop - RUN + 3], y: y0 + RISE - 0.5, face: [0, -1], count: 4 });
  return g;
}
