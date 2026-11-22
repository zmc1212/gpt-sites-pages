// 台地(450×300×15m 挡墙平台)+ 台面铺装 + 西缘主双阶梯(含护坡浮雕带基座)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CFG, LAYOUT } from './config.js';
import { frieze } from './reliefs.js';

export function buildTerrace(scene, mats) {
  const t = CFG.terrace;
  const group = new THREE.Group();

  // 挡墙体(侧面砌墙纹理)
  const wallMap = mats.stone.map.clone();
  wallMap.repeat.set(56, 2.2);
  wallMap.needsUpdate = true;
  const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), wallMat);
  body.position.set(t.cx, t.h / 2, t.cz);
  body.receiveShadow = true; body.castShadow = true;
  group.add(body);

  // 台面铺装
  const pavMap = mats.paving.map.clone();
  pavMap.repeat.set(38, 26);
  pavMap.needsUpdate = true;
  const pavMat = new THREE.MeshStandardMaterial({ map: pavMap, roughness: 0.86 });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.d), pavMat);
  top.rotation.x = -Math.PI / 2;
  top.position.set(t.cx, t.h + 0.02, t.cz);
  top.receiveShadow = true;
  group.add(top);

  // 挡墙顶部压条
  const capMat = mats.stoneDark;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(t.w + 2.4, 1.1, t.d + 2.4), capMat);
  cap.position.set(t.cx, t.h + 0.55, t.cz);
  cap.castShadow = true;
  group.add(cap);

  // 建筑基座垫层(地图上所有建筑 rect 下垫 0.8m 台)
  for (const b of LAYOUT) {
    const [cx, cz, w, d] = b.rect;
    const pad = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 0.9, d + 6), mats.stone);
    pad.position.set(cx, t.h + 0.45, cz);
    pad.receiveShadow = true; pad.castShadow = true;
    group.add(pad);
  }

  group.add(buildGrandStair(mats));
  scene.add(group);
  return { group };
}

// 主双阶梯:两条坡道 + 阶梯护墙(墙面预留浮雕带,由 reliefs 填充)
function buildGrandStair(mats) {
  const s = CFG.grandStair;
  const t = CFG.terrace;
  const g = new THREE.Group();
  const zHalf = (s.rampWidth + s.rampGap) / 2;

  const stepMap = mats.stone.map.clone();
  stepMap.repeat.set(1, 1);
  stepMap.needsUpdate = true;
  const stepMat = new THREE.MeshStandardMaterial({ map: stepMap, roughness: 0.9 });

  for (const side of [-1, 1]) {
    const zc = s.zCenter + side * (s.rampGap / 2 + s.rampWidth / 2);
    const z0 = zc - s.rampWidth / 2, z1 = zc + s.rampWidth / 2;
    const n = s.steps;
    const rise = t.h / n;
    const tread = s.run / n;
    const boxes = [];
    for (let i = 0; i < n; i++) {
      const x = s.cx - s.run + (i + 1) * tread - tread / 2;
      const y = (i + 1) * rise;
      const box = new THREE.BoxGeometry(tread + 0.15, y, z1 - z0);
      box.translate(x, y / 2, zc);
      boxes.push(box);
    }
    // 阶梯下层实体(避免悬空)
    const base = new THREE.BoxGeometry(s.run, 2.4, z1 - z0);
    base.translate(s.cx - s.run / 2, 1.2, zc);
    boxes.push(base);
    const ramp = new THREE.Mesh(mergeGeometries(boxes), stepMat);
    ramp.castShadow = true; ramp.receiveShadow = true;
    g.add(ramp);

    // 外侧护墙(阶梯形随坡升高)
    const parBoxes = [];
    for (let i = 0; i < n; i++) {
      const x = s.cx - s.run + (i + 1) * tread - tread / 2;
      const y = (i + 1) * rise;
      const box = new THREE.BoxGeometry(tread + 0.15, s.parapetH, 1.3);
      box.translate(x, y + s.parapetH / 2, zc + side * (s.rampWidth / 2 + 0.65));
      parBoxes.push(box);
    }
    const par = new THREE.Mesh(mergeGeometries(parBoxes), stepMat);
    par.castShadow = true; par.receiveShadow = true;
    g.add(par);

    // 外侧护墙浮雕带:使节队列随阶梯起坡(登台仪式感)
    const zOuter = zc + side * (s.rampWidth / 2 + 0.65 + 0.06);
    frieze(g, mats.relief, {
      from: [s.cx - s.run + 2, zOuter], to: [s.cx - 1, zOuter],
      count: 18, y: 1.45, variant: 0, face: [0, side], offset: side * 0.06, rise: t.h,
    });
    frieze(g, mats.relief, {
      from: [s.cx - s.run + 2, zOuter], to: [s.cx - 1, zOuter],
      count: 18, y: 2.35, variant: 1, face: [0, side], offset: side * 0.06, rise: t.h,
    });
  }

  // 双坡道间中央脊墙(雕刻铭文带位)
  const spine = new THREE.Mesh(new THREE.BoxGeometry(s.run, s.parapetH + 1.1, s.rampGap), mats.stoneDark);
  spine.position.set(s.cx - s.run / 2, t.h / 2 + 0.9, s.zCenter);
  spine.rotation.z = Math.atan2(t.h, s.run);
  spine.castShadow = true; spine.receiveShadow = true;
  g.add(spine);

  return g;
}
