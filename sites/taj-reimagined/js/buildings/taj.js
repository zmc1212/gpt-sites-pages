// 泰姬陵主体:95m 大理石台基 + 57m 陵体(四坡 iwan)+ 洋葱穹顶 + 四宣礼塔 + 东西配殿 + 南门楼
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LAYOUT } from '../config.js';

// 洋葱穹顶轮廓:底部最大,向上收分,中部微鼓
function onionGeometry(R, H) {
  const pts = [
    [1.0, 0.0], [1.12, 0.12], [1.14, 0.26], [1.08, 0.42], [0.96, 0.56],
    [0.78, 0.68], [0.58, 0.78], [0.40, 0.86], [0.26, 0.92], [0.14, 0.965], [0.0, 1.0],
  ];
  const v = pts.map(([r, t]) => new THREE.Vector2(r * R, t * H));
  return new THREE.LatheGeometry(v, 48);
}

// iwan(尖拱凹龛):暗色凹体 + 拱形框
function addIwan(parent, mats, { x, y, z, w, h, rotY }) {
  const g = new THREE.Group();
  const recess = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), mats.dark);
  recess.position.set(0, h / 2, 0);
  g.add(recess);
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.42, w * 0.42, 1.25, 24, 1, false, 0, Math.PI), mats.dark);
  arch.rotation.z = Math.PI / 2;
  arch.position.set(0, h, 0);
  g.add(arch);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
}

// 小穹顶亭(chhatri)
function chhatri(parent, mats, x, y, z, R = 3.4, H = 5) {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, H * 0.62, 8), mats.marblePolish);
    col.position.set(Math.cos(a) * R * 0.8, H * 0.31, Math.sin(a) * R * 0.8);
    g.add(col);
  }
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H * 0.1, 24), mats.marble);
  roof.position.y = H * 0.66;
  g.add(roof);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 0.72, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.marblePolish);
  dome.position.y = H * 0.71;
  g.add(dome);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), mats.gold);
  tip.position.y = H * 1.05;
  g.add(tip);
  g.position.set(x, y, z);
  parent.add(g);
}

export function buildTaj(ctx) {
  const { scene, mats, addCollider } = ctx;
  const [CX, CZ] = [0, -320];
  const g = new THREE.Group();

  // 大理石台基 95×95×7
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(95, 7, 95), mats.marble);
  plinth.position.set(CX, 3.5, CZ);
  plinth.castShadow = true; plinth.receiveShadow = true;
  g.add(plinth);
  // 台基顶面
  const deck = new THREE.Mesh(new THREE.BoxGeometry(93, 0.4, 93), mats.marblePolish);
  deck.position.set(CX, 7.1, CZ);
  deck.receiveShadow = true;
  g.add(deck);
  // 台基边缘矮栏
  for (const [dx, dz, w, d] of [[0, -47.5, 95, 1], [0, 47.5, 95, 1], [-47.5, 0, 1, 95], [47.5, 0, 1, 95]]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, d), mats.marblePolish);
    rail.position.set(CX + dx, 8, CZ + dz);
    g.add(rail);
  }

  // 陵体 57×57(高 20 墙身)
  const bodyY = 7.2;
  const body = new THREE.Mesh(new THREE.BoxGeometry(57, 20, 57), mats.marblePolish);
  body.position.set(CX, bodyY + 10, CZ);
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  // 四面 iwan 尖拱
  const iwans = [
    { x: CX, z: CZ - 28.5, rotY: 0 },
    { x: CX, z: CZ + 28.5, rotY: Math.PI },
    { x: CX - 28.5, z: CZ, rotY: -Math.PI / 2 },
    { x: CX + 28.5, z: CZ, rotY: Math.PI / 2 },
  ];
  for (const iw of iwans) addIwan(g, mats, { x: iw.x, y: bodyY + 1.5, z: iw.z, w: 15, h: 15.5, rotY: iw.rotY });
  // 二层小 iwan(檐上 8 龛简化为 4 正向)
  for (const iw of iwans) addIwan(g, mats, { x: iw.x, y: bodyY + 17.2, z: iw.z, w: 9, h: 7.5, rotY: iw.rotY });

  // 鼓座 + 洋葱穹顶
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(20, 22, 7, 40), mats.marblePolish);
  drum.position.set(CX, bodyY + 20 + 3.5, CZ);
  drum.castShadow = true;
  g.add(drum);
  const dome = new THREE.Mesh(onionGeometry(24, 26), mats.marblePolish);
  dome.position.set(CX, bodyY + 20 + 7, CZ);
  dome.castShadow = true; dome.receiveShadow = true;
  g.add(dome);
  // 鎏金顶
  const finial = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), mats.gold);
  finial.position.set(CX, bodyY + 20 + 7 + 26 + 1.5, CZ);
  g.add(finial);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.5, 6, 8), mats.gold);
  spire.position.set(CX, bodyY + 20 + 7 + 26 + 3.5, CZ);
  g.add(spire);

  // 四角 chhatri 亭
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    chhatri(g, mats, CX + dx * 20.5, bodyY + 20, CZ + dz * 20.5, 4.2, 7);
  }

  // 四宣礼塔(台基四角外,高 41m,三段)
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const mx = CX + dx * 47.5, mz = CZ + dz * 47.5;
    const tower = new THREE.Group();
    const h1 = 14, h2 = 13, h3 = 12;
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.5, h1, 16), mats.marblePolish);
    s1.position.y = h1 / 2;
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.1, 1.1, 16), mats.marble);
    b1.position.y = h1;
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, h2, 16), mats.marblePolish);
    s2.position.y = h1 + h2 / 2;
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 1, 16), mats.marble);
    b2.position.y = h1 + h2;
    const s3 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, h3, 16), mats.marblePolish);
    s3.position.y = h1 + h2 + h3 / 2;
    tower.add(s1, b1, s2, b2, s3);
    tower.position.set(mx, 0, mz);
    tower.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.add(tower);
    addCollider({ minX: mx - 4, maxX: mx + 4, minZ: mz - 4, maxZ: mz + 4 });
  }

  // 东西配殿(红砂岩,莫卧儿式,各 18×79×13)
  for (const s of [-1, 1]) {
    const hall = new THREE.Mesh(new THREE.BoxGeometry(20, 13, 79), mats.sandstone);
    hall.position.set(CX + s * 78, 6.5, CZ);
    hall.castShadow = true; hall.receiveShadow = true;
    g.add(hall);
    // 中央大穹顶
    const domeM = new THREE.Mesh(new THREE.SphereGeometry(5.5, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mats.marblePolish);
    domeM.position.set(CX + s * 78, 13, CZ);
    g.add(domeM);
  }

  // 南门楼(红砂岩,拱门)
  const gate = new THREE.Group();
  const gBody = new THREE.Mesh(new THREE.BoxGeometry(38, 24, 18), mats.sandstone);
  gBody.position.y = 12;
  gBody.castShadow = true; gBody.receiveShadow = true;
  gate.add(gBody);
  const gDome = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mats.marblePolish);
  gDome.position.y = 24;
  gate.add(gDome);
  const arch = new THREE.Mesh(new THREE.BoxGeometry(12, 16, 1), mats.marblePolish);
  arch.position.set(0, 9.5, 9.15);
  gate.add(arch);
  const dark = new THREE.Mesh(new THREE.BoxGeometry(7.5, 12.5, 1), mats.dark);
  dark.position.set(0, 8.5, 9.35);
  gate.add(dark);
  gate.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  gate.position.set(0, 0, 165);
  g.add(gate);

  // 泰姬陵台基 + 主体 + 宣礼塔碰撞
  addCollider({ minX: CX - 47.5, maxX: CX + 47.5, minZ: CZ - 47.5, maxZ: CZ + 47.5 });
  addCollider({ minX: CX - 32, maxX: CX + 32, minZ: CZ - 32, maxZ: CZ + 32 });
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const mx = CX + dx * 47.5, mz = CZ + dz * 47.5;
    addCollider({ minX: mx - 4, maxX: mx + 4, minZ: mz - 4, maxZ: mz + 4 });
  }

  scene.add(g);
  return { group: g };
}
