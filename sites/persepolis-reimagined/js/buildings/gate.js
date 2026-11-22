// 万国门 Gate of All Nations:四方厅(4 柱)+ 西/东门洞 + 人首翼牛像 + 铭文凹带
import * as THREE from 'three';
import { columnGeometry, lintel } from '../columns.js';
import { lamassuGeometry, lamassuPair } from '../lamassu.js';

const CX = -160, CZ = -30; // 与 LAYOUT 一致

export function buildGate(ctx) {
  const { scene, mats, addCollider } = ctx;
  const y = 16.7; // 台地 15 + 垫层 0.9 + 微调
  const g = new THREE.Group();

  // 平台
  const plat = new THREE.Mesh(new THREE.BoxGeometry(30, 1.4, 30), mats.stone);
  plat.position.set(CX, y - 0.7, CZ);
  plat.receiveShadow = true; plat.castShadow = true;
  g.add(plat);

  // 四面墙体(西门洞朝西、东门洞朝东,宽 6m)
  const wallH = 8.6, wallT = 2.2, sideLen = 27;
  const wallMap = mats.stone.map.clone(); wallMap.repeat.set(6, 4); wallMap.needsUpdate = true;
  const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, roughness: 0.95 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x6f5f43, roughness: 0.9 });

  // N/S 墙:长条无洞
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sideLen, wallH, wallT), wallMat);
    m.position.set(CX, y + wallH / 2, CZ + s * sideLen / 2);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
  // 西/东墙:沿 Z 双段,门洞 z CZ±3(轴线通道)
  for (const s of [-1, 1]) {
    const segLen = (sideLen - 6) / 2;
    for (const k of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, segLen), wallMat);
      m.position.set(CX + s * (sideLen / 2), y + wallH / 2, CZ + k * (3 + segLen / 2));
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
    // 门楣
    const beam = new THREE.Mesh(new THREE.BoxGeometry(wallT + 0.6, 2.4, 6.4), wallMat);
    beam.position.set(CX + s * (sideLen / 2), y + wallH + 1.2, CZ);
    beam.castShadow = true; beam.receiveShadow = true;
    g.add(beam);
    // 铭文凹带(门洞两侧)
    for (const k of [-1, 1]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 5.4, 0.3), bandMat);
      strip.position.set(CX + s * (sideLen / 2 + 0.05), y + 4.4, CZ + k * 3.3);
      g.add(strip);
    }
  }

  // 4 根柱(16.5m,双牛头柱头)
  const colGeo = columnGeometry(16.5, 'bull');
  const colMesh = new THREE.InstancedMesh(colGeo, mats.stone, 4);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (const dx of [-6, 6]) for (const dz of [-6, 6]) {
    _m.identity(); _m.setPosition(CX + dx, y, CZ + dz);
    colMesh.setMatrixAt(i++, _m);
  }
  colMesh.castShadow = true; colMesh.receiveShadow = true;
  g.add(colMesh);
  // 柱顶横梁(位于柱顶 16.5 之上)
  g.add(lintel(20, 1.8, 3.4, CX, y + 17.6, CZ + 6, mats.stoneDark));
  g.add(lintel(20, 1.8, 3.4, CX, y + 17.6, CZ - 6, mats.stoneDark));

  // 人首翼牛像:西门一对(面朝西)、东门一对(面朝东)
  const lamGeo = lamassuGeometry(1.15);
  g.add(lamassuPair(lamGeo, mats.stone, CX - 4.6, y, CZ, -1));
  g.add(lamassuPair(lamGeo, mats.stone, CX + 4.6, y, CZ, 1));
  // 拉玛苏移到门洞两侧(z ±5.5,不再挡轴线通道)

  scene.add(g);
  addCollider({ minX: CX - 15, maxX: CX + 15, minZ: CZ - 15, maxZ: CZ + 15, doorW: 3 });
  return { group: g };
}
