// 祈年殿:三层汉白玉台基 + 三重檐蓝琉璃攒尖顶 + 28 柱殿身 + 藻井 + 配殿/长廊
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { roundMarbleTerrace } from './marble.js';
import { columnRing, columnGeometry } from '../columns.js';
import { roofTier, finial, conicalRoof } from './roof.js';
import { LAYOUT } from '../config.js';

export function buildQiniandian(ctx) {
  const { scene, mats } = ctx;
  const addCollider = ctx.addCollider;
  const C = LAYOUT.qiniandian;
  const [cx, cz] = C.center;
  const g = new THREE.Group();

  // 三层台基(祈谷坛)
  const { topY } = roundMarbleTerrace(g, {
    cx, cz, tiers: C.tiers, mat: mats.marble, matFine: mats.marbleFine, stairW: 10,
  });
  const y0 = topY;

  // 28 柱:外檐柱 24 / 金柱 12 / 龙井柱 4
  columnRing(g, mats.redPaint, { cx, cz, y: y0, r: 17.2, count: 24, h: 10.4, colR: 0.5, rotFaceCenter: true });
  columnRing(g, mats.redPaint, { cx, cz, y: y0, r: 9.7, count: 12, h: 12.9, colR: 0.58, rotFaceCenter: true });
  columnRing(g, mats.redPaint, { cx, cz, y: y0, r: 2.7, count: 4, h: 18.4, colR: 0.68, rotFaceCenter: true });
  // 檐柱环形额枋(红) + 柱顶金箍环带
  const fang = new THREE.Mesh(new THREE.CylinderGeometry(17.35, 17.35, 0.85, 64, 1, true), mats.redPaint);
  fang.position.set(cx, y0 + 10.35, cz);
  fang.castShadow = true;
  g.add(fang);

  // 殿身红墙(r 8.6,四面留门)
  const wallMat = mats.redPaint;
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(8.6, 8.6, 12.6, 48, 1, true, Math.PI + 0.38, Math.PI * 2 - 0.76),
    wallMat,
  );
  // CylinderGeometry theta 0 位于 +Z;开口为南门(theta≈π)
  wall.position.set(cx, y0 + 6.3, cz);
  wall.castShadow = true; wall.receiveShadow = true;
  g.add(wall);
  const wallTop = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.22, 6, 48), mats.glazeGreen);
  wallTop.rotation.x = Math.PI / 2;
  wallTop.position.set(cx, y0 + 12.6, cz);
  g.add(wallTop);

  // 南门(格栅门示意,殿墙南向开门)
  const door = new THREE.Mesh(new THREE.BoxGeometry(5.2, 7.6, 0.4), mats.redPaint);
  door.position.set(cx, y0 + 4.6, cz + 8.6);
  g.add(door);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 0.5), mats.goldTrim);
  frame.position.set(cx, y0 + 9.0, cz + 8.75);
  g.add(frame);

  // 三重檐
  roofTier(g, mats, { cx, cz, yBase: y0 + 10.1, rEave: 22.4, rTop: 17.7, h: 4.7 });
  roofTier(g, mats, { cx, cz, yBase: y0 + 14.9, rEave: 17.5, rTop: 12.7, h: 4.3 });
  roofTier(g, mats, { cx, cz, yBase: y0 + 19.3, rEave: 12.5, rTop: 0.75, h: 10.4 });
  // 宝顶
  finial(g, mats, cx, y0 + 29.7, cz, 1.0);

  // 殿内天花(深色盘,遮住屋顶内壁)
  const ceiling = new THREE.Mesh(
    new THREE.CylinderGeometry(17.3, 17.3, 0.5, 56),
    new THREE.MeshStandardMaterial({ color: 0x32465c, roughness: 0.8, side: THREE.DoubleSide, emissive: 0x121c2a, emissiveIntensity: 0.8 }),
  );
  ceiling.position.set(cx, y0 + 18.7, cz);
  g.add(ceiling);
  // 藻井(天花中央,层层收分)
  const zaojin = new THREE.Group();
  const r1 = new THREE.Mesh(new THREE.CylinderGeometry(8.4, 9.6, 0.9, 32, 1, true), mats.dougong);
  r1.position.y = -0.6;
  const r2 = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 6.8, 0.8, 28, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x3a6ea8, roughness: 0.5, side: THREE.DoubleSide, emissive: 0x0e2440, emissiveIntensity: 0.9 }));
  r2.position.y = -1.5;
  const r3 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 3.6, 0.7, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide, emissive: 0x4a3a14, emissiveIntensity: 0.9 }));
  r3.position.y = -2.4;
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xd8b36c, roughness: 0.35, metalness: 0.4, emissive: 0x5c4416, emissiveIntensity: 1.0 }));
  core.position.y = -3.0;
  zaojin.add(r1, r2, r3, core);
  zaojin.position.set(cx, y0 + 17.6, cz); // 整体挂在天花(24.0)之下
  g.add(zaojin);
  // 天花同心环带(阶梯下沉,层层收向藻井)
  const ringDefs = [
    { r: 15.8, mat: mats.dougong, h: 1.25, dy: -0.55 },
    { r: 12.6, mat: mats.glazeBlue, h: 1.15, dy: -1.0 },
    { r: 9.6, mat: mats.dougong, h: 1.0, dy: -1.45 },
    { r: 7.0, mat: mats.glazeBlue, h: 0.9, dy: -1.85 },
  ];
  for (const rd of ringDefs) {
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(rd.r, rd.r, rd.h, 56, 1, true),
      rd.mat,
    );
    ring.position.set(cx, y0 + 18.7 + rd.dy, cz);
    g.add(ring);
  }
  // 放射肋(16 根,自环带伸向藻井)
  const ribGeo = new THREE.BoxGeometry(0.5, 0.28, 9.2);
  const ribs = new THREE.InstancedMesh(ribGeo, mats.redPaint, 16);
  const _rm = new THREE.Matrix4(), _rq = new THREE.Quaternion(), _re = new THREE.Euler();
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    _re.set(0, -a, 0);
    _rq.setFromEuler(_re);
    _rm.compose(
      new THREE.Vector3(cx + Math.sin(a) * 11.2, y0 + 18.3, cz + Math.cos(a) * 11.2),
      _rq,
      new THREE.Vector3(1, 1, 1),
    );
    ribs.setMatrixAt(k, _rm);
  }
  g.add(ribs);
  // 殿内暖光(补足直射光无法进入的殿内)
  const lamp = new THREE.PointLight(0xffdfae, 1200, 70, 2);
  lamp.position.set(cx, y0 + 10, cz);
  g.add(lamp);
  const lampSoft = new THREE.PointLight(0xffe9c8, 2600, 95, 2);
  lampSoft.position.set(cx, y0 + 15, cz);
  g.add(lampSoft);
  const lampHi = new THREE.PointLight(0xfff0d0, 900, 40, 2);
  lampHi.position.set(cx, y0 + 19.2, cz);
  g.add(lampHi);

  scene.add(g);

  // 碰撞:殿身圆墙(南门豁免)
  addCollider({ circle: [cx, cz, 8.2, 9.0], doors: [[Math.PI, 0.36]] });
  return { group: g, topY };
}

// 配殿(红墙蓝瓦硬山) + 长廊
export function buildCourtyard(ctx) {
  const { scene, mats, addCollider } = ctx;
  const g = new THREE.Group();

  // 硬山屋顶(两坡 + 蓝琉璃)
  function hall(x, z, w, d, wallH, roofH, rotY = 0) {
    const grp = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 0.9, d + 1.6), mats.marble);
    base.position.y = 0.45;
    base.castShadow = true; base.receiveShadow = true;
    grp.add(base);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), mats.redPaint);
    body.position.y = 0.9 + wallH / 2;
    body.castShadow = true; body.receiveShadow = true;
    grp.add(body);
    // 两坡屋面(棱柱)
    const profile = new THREE.Shape();
    profile.moveTo(-d / 2 - 0.7, 0);
    profile.lineTo(0, roofH);
    profile.lineTo(d / 2 + 0.7, 0);
    profile.lineTo(d / 2 + 0.7, -0.35);
    profile.lineTo(-d / 2 - 0.7, -0.35);
    profile.closePath();
    const geo = new THREE.ExtrudeGeometry(profile, { depth: w + 1.4, bevelEnabled: false });
    geo.translate(-(w + 1.4) / 2, 0.9 + wallH, 0);
    const roof = new THREE.Mesh(geo, mats.glazeBlue);
    roof.castShadow = true; roof.receiveShadow = true;
    grp.add(roof);
    // 正脊
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 0.3, 0.5), mats.glazeBlue);
    ridge.position.set(0, 0.9 + wallH + roofH + 0.12, 0);
    grp.add(ridge);
    grp.position.set(x, 0, z);
    grp.rotation.y = rotY;
    g.add(grp);
    return grp;
  }

  // 东西配殿
  hall(-56, 78, 12, 30, 4.6, 2.6);
  hall(56, 78, 12, 30, 4.6, 2.6);
  // 长廊(东侧,72 间意象)
  const LG = { x: 96, z0: 20, z1: 150 };
  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, LG.z1 - LG.z0), mats.marble);
  base.position.set(LG.x, 0.3, (LG.z0 + LG.z1) / 2);
  base.receiveShadow = true; base.castShadow = true;
  g.add(base);
  // 长廊柱列(两排,InstancedMesh)
  const nPairs = Math.floor((LG.z1 - LG.z0) / 5.2) + 1;
  const colGeo = columnGeometry(4.6, 0.3);
  const cols = new THREE.InstancedMesh(colGeo, mats.redPaint, nPairs * 2);
  const _m = new THREE.Matrix4();
  let i = 0;
  for (let k = 0; k < nPairs; k++) {
    const z = LG.z0 + k * 5.2;
    for (const dx of [-3.8, 3.8]) {
      _m.identity();
      _m.setPosition(LG.x + dx, 0.6, z);
      cols.setMatrixAt(i++, _m);
    }
  }
  cols.count = i;
  cols.castShadow = true; cols.receiveShadow = true;
  g.add(cols);
  // 长廊屋面(细长两坡)
  const profile = new THREE.Shape();
  profile.moveTo(-4.6, 0);
  profile.lineTo(0, 2.1);
  profile.lineTo(4.6, 0);
  profile.lineTo(4.6, -0.3);
  profile.lineTo(-4.6, -0.3);
  profile.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(profile, { depth: LG.z1 - LG.z0 + 1.2, bevelEnabled: false });
  roofGeo.rotateY(Math.PI / 2);
  roofGeo.translate(LG.x - (LG.z1 - LG.z0 + 1.2) / 2, 5.2, (LG.z0 + LG.z1) / 2 - 0.0);
  const roof = new THREE.Mesh(roofGeo, mats.glazeBlue);
  roof.castShadow = true; roof.receiveShadow = true;
  g.add(roof);

  scene.add(g);
  addCollider({ minX: -63, maxX: -49, minZ: 62, maxZ: 94 });
  addCollider({ minX: 49, maxX: 63, minZ: 62, maxZ: 94 });
  addCollider({ minX: 90.5, maxX: 101.5, minZ: 20, maxZ: 150 });
  return { group: g };
}
