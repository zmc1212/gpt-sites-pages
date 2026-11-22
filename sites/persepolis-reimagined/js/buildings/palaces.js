// 宫殿群:三门厅 Tripylon / 大流士宫 Tachara / 薛西斯宫 Hadish / 后宫 Harem
import * as THREE from 'three';
import { columnGeometry } from '../columns.js';
import { makeDoorframe, wallStub } from './common.js';
import { frieze } from '../reliefs.js';

export function buildTripylon(ctx) {
  const { scene, mats, addCollider } = ctx;
  const CX = 62, CZ = -18, Y = 16.2;
  const g = new THREE.Group();

  const plat = new THREE.Mesh(new THREE.BoxGeometry(17, 0.8, 17), mats.stone);
  plat.position.set(CX, Y - 0.4, CZ);
  plat.receiveShadow = true; plat.castShadow = true;
  g.add(plat);

  // 4 柱 + 三面门框
  const geo = columnGeometry(11, 'bull');
  const mesh = new THREE.InstancedMesh(geo, mats.stone, 4);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (const dx of [-4.5, 4.5]) for (const dz of [-4.5, 4.5]) {
    _m.identity(); _m.setPosition(CX + dx, Y, CZ + dz);
    mesh.setMatrixAt(i++, _m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);

  g.add(makeDoorframe(mats.stone, mats.rose, { w: 4.4, h: 7, d: 1.7, x: CX, y: Y, z: CZ - 7.5 }));
  g.add(makeDoorframe(mats.stone, mats.rose, { w: 4.4, h: 7, d: 1.7, x: CX - 7.5, y: Y, z: CZ, rotY: Math.PI / 2 }));
  g.add(makeDoorframe(mats.stone, mats.rose, { w: 4.4, h: 7, d: 1.7, x: CX + 7.5, y: Y, z: CZ, rotY: Math.PI / 2 }));

  scene.add(g);
  addCollider({ minX: CX - 8.5, maxX: CX + 8.5, minZ: CZ - 8.5, maxZ: CZ + 8.5 });
  return { group: g };
}

// 大流士宫 Tachara:打磨灰岩,主厅 12 柱 + 北门廊 8 柱 + 门框浮雕
export function buildTachara(ctx) {
  const { scene, mats, addCollider } = ctx;
  const CX = -178, CZ = -85, Y = 17.4; // 台基顶
  const g = new THREE.Group();

  // 双层台基(打磨石)
  for (let i = 0; i < 2; i++) {
    const s = 34 - i * 4;
    const layer = new THREE.Mesh(new THREE.BoxGeometry(s, 0.75, 27 - i * 3), mats.marble);
    layer.position.set(CX, 15.9 + i * 0.75, CZ);
    layer.castShadow = true; layer.receiveShadow = true;
    g.add(layer);
  }

  // 主厅 12 柱(4×3,柱高 11)
  const geo = columnGeometry(11, 'bull');
  const mesh = new THREE.InstancedMesh(geo, mats.marble, 12);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    _m.identity();
    _m.setPosition(CX + (c - 1.5) * 5.4, Y, CZ - 3 + r * 5.6);
    mesh.setMatrixAt(i++, _m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);

  // 北门廊 8 柱(2×4)
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const col = new THREE.Mesh(columnGeometry(9.5, 'bull'), mats.marble);
    col.position.set(CX + (c - 1.5) * 5.4, Y, CZ - 10.5 + r * 2.6);
    col.castShadow = true; col.receiveShadow = true;
    g.add(col);
  }

  // 门框(南墙两扇 + 西墙一扇)
  g.add(makeDoorframe(mats.marble, mats.rose, { w: 3.6, h: 6.5, d: 1.5, x: CX - 6, y: Y, z: CZ + 10.8 }));
  g.add(makeDoorframe(mats.marble, mats.rose, { w: 3.6, h: 6.5, d: 1.5, x: CX + 6, y: Y, z: CZ + 10.8 }));
  g.add(makeDoorframe(mats.marble, mats.rose, { w: 3.6, h: 6.5, d: 1.5, x: CX - 12.5, y: Y, z: CZ + 3, rotY: Math.PI / 2 }));

  // 南墙(留双门)
  g.add(wallStub(mats.marble, { x: CX - 13.5, z: CZ + 12, w: 9, d: 1.5, h: 8 }));
  g.add(wallStub(mats.marble, { x: CX + 13.5, z: CZ + 12, w: 9, d: 1.5, h: 8 }));

  // 门口浮雕(侍卫)
  frieze(g, mats.relief, { from: [CX - 8.6, CZ + 13.2], to: [CX - 4.4, CZ + 13.2], count: 3, y: Y + 0.1, variant: 1, face: [0, 1], offset: 0.5 });
  frieze(g, mats.relief, { from: [CX + 4.4, CZ + 13.2], to: [CX + 8.6, CZ + 13.2], count: 3, y: Y + 0.1, variant: 1, face: [0, 1], offset: 0.5 });

  scene.add(g);
  addCollider({ minX: CX - 17, maxX: CX + 17, minZ: CZ - 14, maxZ: CZ + 14, doorN: true });
  return { group: g };
}

// 薛西斯宫 Hadish:南侧大殿(6×6=36 柱)+ 残墙
export function buildHadish(ctx) {
  const { scene, mats, addCollider } = ctx;
  const CX = -42, CZ = -102, Y = 17.0; // 台基顶
  const g = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(42, 1.1, 30), mats.stone);
  base.position.set(CX, Y - 0.55, CZ);
  base.receiveShadow = true; base.castShadow = true;
  g.add(base);

  const geo = columnGeometry(13, 'bull');
  const mesh = new THREE.InstancedMesh(geo, mats.stone, 36);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    _m.identity();
    _m.setPosition(CX + (c - 2.5) * 6.2, Y, CZ + (r - 2.5) * 4.6);
    mesh.setMatrixAt(i++, _m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);

  g.add(makeDoorframe(mats.stone, mats.rose, { w: 5, h: 8, d: 2, x: CX, y: Y, z: CZ + 14.5 }));
  g.add(wallStub(mats.stone, { x: CX - 16, z: CZ + 14.8, w: 10, d: 1.6, h: 7 }));
  g.add(wallStub(mats.stone, { x: CX + 16, z: CZ + 14.8, w: 10, d: 1.6, h: 7 }));

  scene.add(g);
  addCollider({ minX: CX - 21, maxX: CX + 21, minZ: CZ - 15, maxZ: CZ + 15, doorN: true });
  return { group: g };
}

// 后宫 Harem:西墙长条翼殿 + 门廊柱排
export function buildHarem(ctx) {
  const { scene, mats, addCollider } = ctx;
  const CX = -196, CZ = 55, Y = 16.8; // 台基顶
  const g = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 60), mats.stone);
  base.position.set(CX, Y - 0.45, CZ);
  base.receiveShadow = true; base.castShadow = true;
  g.add(base);

  // 东向门廊:6 柱
  const geo = columnGeometry(9.5, 'plain');
  const mesh = new THREE.InstancedMesh(geo, mats.stone, 6);
  const _m = new THREE.Matrix4();
  for (let r = 0; r < 6; r++) {
    _m.identity();
    _m.setPosition(CX + 8.5, Y, CZ - 20 + r * 8);
    mesh.setMatrixAt(r, _m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);

  // 实体殿身
  g.add(wallStub(mats.stone, { x: CX - 4, z: CZ, w: 13, d: 52, h: 8.5 }));

  scene.add(g);
  addCollider({ minX: CX - 11, maxX: CX + 11, minZ: CZ - 26, maxZ: CZ + 26 });
  return { group: g };
}
