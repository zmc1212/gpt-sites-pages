// 皇穹宇 + 回音壁:圆形红墙(磨砖对缝)内的单檐蓝琉璃圆殿
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { columnRing, columnGeometry } from '../columns.js';
import { roofTier, finial, conicalRoof } from './roof.js';
import { LAYOUT } from '../config.js';

export function buildHuangqiongyu(ctx) {
  const { scene, mats, addCollider } = ctx;
  const C = LAYOUT.huangqiongyu;
  const [cx, cz] = C.center;
  const g = new THREE.Group();

  // ---- 回音壁(圆形磨砖墙,南向留门)----
  const wallH = 3.72;
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(C.wallR, C.wallR, wallH, 72, 1, true, Math.PI + 0.16, Math.PI * 2 - 0.32),
    mats.brick,
  );
  wall.material = mats.brick;
  wall.position.set(cx, wallH / 2, cz);
  wall.castShadow = true; wall.receiveShadow = true;
  g.add(wall);
  // 墙帽(绿琉璃)
  const cap = new THREE.Mesh(new THREE.TorusGeometry(C.wallR + 0.06, 0.3, 6, 72), mats.glazeGreen);
  cap.rotation.x = Math.PI / 2;
  cap.position.set(cx, wallH + 0.05, cz);
  cap.castShadow = true;
  g.add(cap);
  // 南门(琉璃门)
  const gateW = 5.6;
  for (const sgn of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(1.1, wallH + 0.4, 1.1), mats.brick);
    post.position.set(cx + sgn * (gateW / 2 + 0.55), (wallH + 0.4) / 2, cz + C.wallR);
    post.castShadow = true;
    g.add(post);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(gateW + 2.2, 0.55, 1.3), mats.glazeGreen);
  lintel.position.set(cx, wallH + 0.35, cz + C.wallR);
  lintel.castShadow = true;
  g.add(lintel);

  // ---- 皇穹宇圆殿 ----
  // 汉白玉台基
  const base = new THREE.Mesh(new THREE.CylinderGeometry(11.2, 11.6, 1.5, 48), mats.marble);
  base.position.set(cx, 0.75, cz);
  base.castShadow = true; base.receiveShadow = true;
  g.add(base);
  // 台基栏板
  const bal = new THREE.Mesh(new THREE.TorusGeometry(11.0, 0.14, 5, 64), mats.marbleFine);
  bal.rotation.x = Math.PI / 2;
  bal.position.set(cx, 1.75, cz);
  g.add(bal);
  // 8 根檐柱
  columnRing(g, mats.redPaint, { cx, cz, y: 1.5, r: 10.4, count: 8, h: 7.2, colR: 0.42, rotFaceCenter: true });
  // 殿身红墙(南向开门)
  const hall = new THREE.Mesh(
    new THREE.CylinderGeometry(8.9, 8.9, 5.6, 48, 1, true, Math.PI + 0.3, Math.PI * 2 - 0.6),
    mats.redPaint,
  );
  hall.position.set(cx, 1.5 + 2.8, cz);
  hall.castShadow = true; hall.receiveShadow = true;
  g.add(hall);
  const hallCap = new THREE.Mesh(new THREE.TorusGeometry(8.9, 0.18, 6, 48), mats.glazeGreen);
  hallCap.rotation.x = Math.PI / 2;
  hallCap.position.set(cx, 7.1, cz);
  g.add(hallCap);
  // 环形额枋
  const fang = new THREE.Mesh(new THREE.CylinderGeometry(10.55, 10.55, 0.8, 56, 1, true), mats.redPaint);
  fang.position.set(cx, 1.5 + 7.0, cz);
  fang.castShadow = true;
  g.add(fang);
  // 单檐蓝琉璃攒尖顶
  roofTier(g, mats, { cx, cz, yBase: 1.5 + 7.6, rEave: 13.6, rTop: 0.8, h: 6.6 });
  finial(g, mats, cx, 1.5 + 14.2 + 0.3, cz, 0.62);
  // 南向石阶
  const steps = [];
  const n = 5;
  for (let k = 0; k < n; k++) {
    const h = 1.5 * ((k + 1) / n);
    const box = new THREE.BoxGeometry(6.4, h, 0.9);
    box.translate(cx, h / 2, cz + 11.2 + (n - 1 - k) * 0.9);
    steps.push(box);
  }
  const stairMesh = new THREE.Mesh(mergeGeometries(steps, false), mats.marble);
  stairMesh.castShadow = true; stairMesh.receiveShadow = true;
  g.add(stairMesh);

  scene.add(g);
  // 碰撞:回音壁(南门豁免)+ 殿身
  addCollider({ circle: [cx, cz, C.wallR - 0.5, C.wallR + 0.5], doors: [[Math.PI, 0.28]] });
  addCollider({ circle: [cx, cz, 8.6, 9.3], doors: [[Math.PI, 0.3]] });
  return { group: g };
}
