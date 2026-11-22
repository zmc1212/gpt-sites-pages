// 百柱厅 Hall of 100 Columns:68m 方厅 10×10 柱阵(~22m,深色石)+ 巨型门框 + 残墙围合
import * as THREE from 'three';
import { columnGeometry, stumpGeometry } from '../columns.js';
import { makeDoorframe, wallStub } from './common.js';

const CX = 140, CZ = 55;
const Y = 18.3; // 台地 15 + 垫层 + 三层台基

export function buildThroneHall(ctx) {
  const { scene, mats, addCollider } = ctx;
  const g = new THREE.Group();

  // 台基
  for (let i = 0; i < 3; i++) {
    const s = 75 - i * 5;
    const layer = new THREE.Mesh(new THREE.BoxGeometry(s, 0.8, s), mats.stoneDark);
    layer.position.set(CX, 15.9 + i * 0.8, CZ);
    layer.castShadow = true; layer.receiveShadow = true;
    g.add(layer);
  }

  // 10×10 柱阵
  const geo = columnGeometry(22, 'bull');
  const mesh = new THREE.InstancedMesh(geo, mats.stoneDark, 100);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    _m.identity();
    _m.setPosition(CX + (c - 4.5) * 6.9, Y, CZ + (r - 4.5) * 6.9);
    mesh.setMatrixAt(i++, _m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);

  // 主门框(南面中央,朝向三门厅方向)
  g.add(makeDoorframe(mats.stoneDark, mats.goldTrim, { w: 7, h: 11, d: 2.4, x: CX, y: Y, z: CZ - 34, rotY: 0 }));
  // 东门框
  g.add(makeDoorframe(mats.stoneDark, mats.goldTrim, { w: 7, h: 11, d: 2.4, x: CX + 34, y: Y, z: CZ, rotY: Math.PI / 2 }));

  // 残墙围合(四面低墙留门)
  const wallMat = new THREE.MeshStandardMaterial({ map: mats.stone.map.clone(), roughness: 0.95 });
  wallMat.map.repeat.set(10, 1); wallMat.map.needsUpdate = true;
  const W = 72, T = 1.8, H = 3.2;
  for (const [dx, dz, len, rot] of [[0, -W / 2, W, 0], [0, W / 2, W, 0], [-W / 2, 0, W, Math.PI / 2], [W / 2, 0, W, Math.PI / 2]]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, H, T), wallMat);
    wall.position.set(CX + dx, Y + H / 2, CZ + dz);
    wall.rotation.y = rot;
    wall.castShadow = true; wall.receiveShadow = true;
    g.add(wall);
  }

  scene.add(g);
  addCollider({ minX: CX - 36, maxX: CX + 36, minZ: CZ - 36, maxZ: CZ + 36, doorS: true, doorE: true });
  return { group: g };
}

// 国库 Royal Treasury:柱列废墟(整柱 + 破桩)+ 矮墙分区
export function buildTreasury(ctx) {
  const { scene, mats, addCollider } = ctx;
  const CX2 = 148, CZ2 = 122, Y2 = 15.9;
  const g = new THREE.Group();

  const geoIntact = columnGeometry(12.5, 'plain');
  const geoStump = stumpGeometry(4.5, 0.75);
  const rnd = (i) => {
    const s = Math.sin(i * 12.9898 + CX2 * 7.7 + CZ2 * 3.1) * 43758.5453;
    return s - Math.floor(s);
  };

  let nIntact = 0, nStump = 0;
  const cols = 10, rows = 5, sx = 10, sz = 9;
  const total = cols * rows;
  const intact = new THREE.InstancedMesh(geoIntact, mats.stone, total);
  const stumps = new THREE.InstancedMesh(geoStump, mats.stoneDark, total);
  const _m = new THREE.Matrix4();
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = CX2 + (c - (cols - 1) / 2) * sx;
    const z = CZ2 + (r - (rows - 1) / 2) * sz;
    _m.identity(); _m.setPosition(x, Y2, z);
    if (rnd(r * cols + c) < 0.45) intact.setMatrixAt(nIntact++, _m);
    else stumps.setMatrixAt(nStump++, _m);
  }
  intact.count = nIntact; stumps.count = nStump;
  intact.castShadow = true; intact.receiveShadow = true;
  stumps.castShadow = true; stumps.receiveShadow = true;
  g.add(intact); g.add(stumps);

  // 分隔矮墙(库房格局)
  for (let r = 0; r <= rows; r++) {
    const z = CZ2 + (r - rows / 2) * sz - sz / 2;
    g.add(wallStub(mats.stoneDark, { x: CX2, z, w: cols * sx, d: 1.4, h: 2.6 }));
  }
  // 外围残墙
  g.add(wallStub(mats.stone, { x: CX2, z: CZ2 - 28, w: 100, d: 1.6, h: 4.2 }));
  g.add(wallStub(mats.stone, { x: CX2, z: CZ2 + 28, w: 100, d: 1.6, h: 3.4 }));

  scene.add(g);
  addCollider({ minX: CX2 - 55, maxX: CX2 + 55, minZ: CZ2 - 30, maxZ: CZ2 + 30, doorW: true });
  return { group: g };
}
