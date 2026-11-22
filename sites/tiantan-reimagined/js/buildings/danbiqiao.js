// 丹陛桥 + 祈年门 + 坛墙(红墙绿瓦帽)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LAYOUT } from '../config.js';

export function buildDanbiqiao(ctx) {
  const { scene, mats } = ctx;
  const B = LAYOUT.danbi;
  const g = new THREE.Group();

  // 桥体(城砖灰 + 汉白玉边条 + 中心御路)
  const body = new THREE.Mesh(new THREE.BoxGeometry(B.w, B.h, B.z1 - B.z0), mats.brick);
  body.position.set(B.x, B.h / 2, (B.z0 + B.z1) / 2);
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  const paveMat = mats.brick.clone();
  paveMat.map = mats.brick.map.clone();
  paveMat.map.repeat.set(2, 46);
  paveMat.map.needsUpdate = true;
  const paving = new THREE.Mesh(new THREE.BoxGeometry(B.w - 0.8, 0.12, B.z1 - B.z0 - 0.4), paveMat);
  paving.position.set(B.x, B.h + 0.02, (B.z0 + B.z1) / 2);
  paving.receiveShadow = true;
  g.add(paving);
  // 两侧汉白玉路缘
  for (const sgn of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, B.z1 - B.z0), mats.marbleFine);
    edge.position.set(B.x + sgn * (B.w / 2 - 0.35), B.h + 0.05, (B.z0 + B.z1) / 2);
    edge.receiveShadow = true;
    g.add(edge);
  }
  // 两端引桥台阶(视觉与 groundHeight 坡道对应)
  const ramps = [
    { z0: B.z0 - 26, z1: B.z0 },
    { z0: B.z1, z1: B.z1 + 26 },
  ];
  for (const r of ramps) {
    const n = 12;
    const boxes = [];
    for (let k = 0; k < n; k++) {
      const h = B.h * ((k + 1) / n);
      const zc = r.z0 + ((k + 0.5) * (r.z1 - r.z0)) / n;
      boxes.push(new THREE.BoxGeometry(B.w, h, (r.z1 - r.z0) / n).translate(B.x, h / 2, zc));
    }
    const mesh = new THREE.Mesh(mergeGeometries(boxes, false), mats.brick);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
  }

  // ---- 祈年门(三洞门,位于丹陛桥北端)----
  const M = LAYOUT.qinianmen;
  const [mx, mz] = M.center;
  const plat = new THREE.Mesh(new THREE.BoxGeometry(M.w + 4, 1.9, M.d + 6), mats.brick);
  plat.position.set(mx, 0.95, mz);
  plat.castShadow = true; plat.receiveShadow = true;
  g.add(plat);
  const platTop = new THREE.Mesh(new THREE.BoxGeometry(M.w + 2, 0.14, M.d + 4), mats.marbleFine);
  platTop.position.set(mx, 1.97, mz);
  platTop.receiveShadow = true;
  g.add(platTop);
  // 门墙:四段红墙,中门 6.5 两侧门各 4
  const wallH = 6.2, wallD = 2.2;
  const segs = [
    [-M.w / 2, -11.25], [-7.25, -3.25], [3.25, 7.25], [11.25, M.w / 2],
  ];
  for (const [a, b] of segs) {
    const len = b - a;
    if (len <= 0.1) continue;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(len, wallH, wallD), mats.redPaint);
    seg.position.set(mx + (a + b) / 2, 1.9 + wallH / 2, mz);
    seg.castShadow = true; seg.receiveShadow = true;
    g.add(seg);
  }
  // 门楣 + 绿瓦帽
  for (const gc of [-9.25, 0, 9.25]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(gc === 0 ? 7.4 : 5.2, 0.7, wallD + 0.3), mats.glazeGreen);
    beam.position.set(mx + gc, 1.9 + wallH + 0.35, mz);
    beam.castShadow = true;
    g.add(beam);
  }
  // 城台屋顶(两坡蓝琉璃)
  const profile = new THREE.Shape();
  profile.moveTo(-M.d / 2 - 0.6, 0);
  profile.lineTo(0, 2.9);
  profile.lineTo(M.d / 2 + 0.6, 0);
  profile.lineTo(M.d / 2 + 0.6, -0.3);
  profile.lineTo(-M.d / 2 - 0.6, -0.3);
  profile.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(profile, { depth: M.w + 2.4, bevelEnabled: false });
  roofGeo.translate(-(M.w + 2.4) / 2, 1.9 + wallH + 0.6, 0);
  const roof = new THREE.Mesh(roofGeo, mats.glazeBlue);
  roof.castShadow = true; roof.receiveShadow = true;
  g.add(roof);

  scene.add(g);
  const ctx2 = ctx;
  return { group: g, ctx2 };
}

// 坛墙(红墙 + 绿瓦帽;留门洞)
export function buildWalls(ctx) {
  const { scene, mats, addCollider } = ctx;
  const g = new THREE.Group();

  function wallRun(x0, z0, x1, z1, h = 3.4, gaps = []) {
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    const ux = dx / len, uz = dz / len;
    // gaps: [{c, w}] 沿墙轴向(0 = 起点)
    const segs = [];
    const sorted = [...gaps].sort((a, b) => a.c - b.c);
    let cur = 0;
    for (const gp of sorted) {
      const a = gp.c - gp.w / 2, b = gp.c + gp.w / 2;
      if (a - cur > 1) segs.push([cur, a]);
      cur = b;
    }
    if (len - cur > 1) segs.push([cur, len]);
    for (const [a, b] of segs) {
      const l = b - a;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(l, h, 1.5), mats.redPaint);
      wall.position.set(x0 + ux * (a + l / 2), h / 2, z0 + uz * (a + l / 2));
      wall.rotation.y = -Math.atan2(uz, ux);
      wall.castShadow = true; wall.receiveShadow = true;
      g.add(wall);
      // 绿瓦帽
      const cap = new THREE.Mesh(new THREE.BoxGeometry(l, 0.4, 1.9), mats.glazeGreen);
      cap.position.set(x0 + ux * (a + l / 2), h + 0.2, z0 + uz * (a + l / 2));
      cap.rotation.y = -Math.atan2(uz, ux);
      cap.castShadow = true;
      g.add(cap);
    }
    // 门洞上方的过梁
    for (const gp of sorted) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(gp.w, 0.9, 1.7), mats.glazeGreen);
      beam.position.set(x0 + ux * gp.c, h - 0.45, z0 + uz * gp.c);
      beam.rotation.y = -Math.atan2(uz, ux);
      beam.castShadow = true;
      g.add(beam);
    }
    return { len, ux, uz };
  }

  // 祈年殿院墙:x ±85,z -17..170(南墙中央为祈年门建筑,宽 34)
  wallRun(-85, -17, 85, -17, 3.4, [{ c: 85, w: 36 }]);           // 南墙(gap 居中)
  wallRun(-85, 170, 85, 170, 3.4, []);                            // 北墙
  wallRun(-85, -17, -85, 170, 3.4, [{ c: 100, w: 6 }]);           // 西墙(北段便门)
  wallRun(85, -17, 85, 170, 3.4, []);                             // 东墙
  // 圜丘院墙:x ±85,z -540..-360(南墙中门)
  wallRun(-85, -540, 85, -540, 3.4, [{ c: 85, w: 10 }]);
  wallRun(-85, -360, 85, -360, 3.4, [{ c: 85, w: 12 }]);
  wallRun(-85, -540, -85, -360, 3.4, []);
  wallRun(85, -540, 85, -360, 3.4, []);

  scene.add(g);
  // 碰撞(AABB 化的墙段,沿轴)
  const colls = [];
  const add = (x0, z0, x1, z1) => colls.push({
    minX: Math.min(x0, x1) - 0.75, maxX: Math.max(x0, x1) + 0.75,
    minZ: Math.min(z0, z1) - 0.75, maxZ: Math.max(z0, z1) + 0.75,
  });
  add(-85, -17, -17, -17); add(17, -17, 85, -17);
  add(-85, 170, 85, 170);
  add(-85, -17, -85, 62); add(-85, 68, -85, 170);
  add(85, -17, 85, 170);
  add(-85, -540, -5, -540); add(5, -540, 85, -540);
  add(-85, -360, -6, -360); add(6, -360, 85, -360);
  add(-85, -540, -85, -360); add(85, -540, 85, -360);
  for (const c of colls) addCollider(c);
  // 祈年门墙体碰撞(与四段墙一一对应,门洞通行)
  addCollider({ minX: -17.5, maxX: -11.25, minZ: -13.4, maxZ: -10.6 });
  addCollider({ minX: -7.25, maxX: -3.25, minZ: -13.4, maxZ: -10.6 });
  addCollider({ minX: 3.25, maxX: 7.25, minZ: -13.4, maxZ: -10.6 });
  addCollider({ minX: 11.25, maxX: 17.5, minZ: -13.4, maxZ: -10.6 });
  return { group: g };
}
