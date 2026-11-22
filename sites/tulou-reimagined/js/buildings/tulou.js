// 土楼本体:夯土环墙 + 内向瓦顶环 + 环廊木柱 + 石拱门 + 祖堂 + 灯笼;群楼复用
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../textures.js';
import { LAYOUT } from '../config.js';
import { hall } from './hall.js';
import { gableRoof } from './roof.js';

const LANTERN_Y = 3.2;

// 单座圆土楼(参数化)
export function buildRoundTulou(ctx, { x, z, r, h, floors, gate = false, lanterns = false }) {
  const { scene, mats, addCollider, updateFns } = ctx;
  const g = new THREE.Group();
  const wallMat = mats.earthBig;

  // 夯土环墙(南向留门洞:开口中心 theta=π 对准 -Z)
  const gateHalf = gate ? Math.atan(5.4 / r) : 0;
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 1.02, h, 64, 1, true, Math.PI + gateHalf, Math.PI * 2 - gateHalf * 2),
    wallMat,
  );
  wall.position.set(x, h / 2, z);
  wall.castShadow = true; wall.receiveShadow = true;
  g.add(wall);

  // 内向瓦顶(檐口环:外高内低的斜环面)
  const eave = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.99, 2.6, 64, 1, true), mats.tileGrey);
  eave.position.set(x, h + 1.0, z);
  eave.castShadow = true;
  g.add(eave);
  const eaveRim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.99, 0.3, 6, 72), mats.tileGrey);
  eaveRim.rotation.x = Math.PI / 2;
  eaveRim.position.set(x, h + 2.2, z);
  g.add(eaveRim);

  // 环廊木柱(每层一圈,径向放射)
  const colGeo = new THREE.CylinderGeometry(0.24, 0.28, h / floors - 0.4, 8);
  for (let f = 0; f < floors; f++) {
    const fy = (f * h) / floors + 0.9;
    const ringR = r - 1.5 - f * 0.0; // 廊贴墙
    const nCol = Math.max(16, Math.round((Math.PI * 2 * ringR) / 3.2));
    const cols = new THREE.InstancedMesh(colGeo, mats.wood, nCol);
    const _m = new THREE.Matrix4();
    let i = 0;
    for (let k = 0; k < nCol; k++) {
      const a = (k / nCol) * Math.PI * 2;
      if (gate && f === 0) {
        const da = Math.abs(((a - Math.PI + Math.PI * 2) % (Math.PI * 2)) - Math.PI);
        if (da < gateHalf) continue;
      }
      _m.identity();
      _m.setPosition(x + Math.cos(a) * ringR, fy, z + Math.sin(a) * ringR);
      cols.setMatrixAt(i++, _m);
    }
    cols.count = i;
    cols.castShadow = true; cols.receiveShadow = true;
    g.add(cols);
  }

  // 房间分隔(放射木墙,底层到顶层示意,InstancedMesh)
  const partGeo = new THREE.BoxGeometry(0.22, h - 1.2, r * 0.2);
  const nPart = Math.max(18, Math.round((Math.PI * 2 * (r - 3)) / 4.2));
  const parts = new THREE.InstancedMesh(partGeo, mats.wood, nPart);
  const _m2 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  for (let k = 0; k < nPart; k++) {
    const a = (k / nPart) * Math.PI * 2;
    if (gate) {
      const da = Math.abs(((a - Math.PI + Math.PI * 2) % (Math.PI * 2)) - Math.PI);
      if (da < gateHalf * 1.2) continue;
    }
    _e.set(0, -a, 0);
    _q.setFromEuler(_e);
    _m2.compose(new THREE.Vector3(x + Math.cos(a) * (r - 2.6), (h - 1.2) / 2 + 0.8, z + Math.sin(a) * (r - 2.6)), _q, new THREE.Vector3(1, 1, 1));
    parts.setMatrixAt(k, _m2);
  }
  parts.castShadow = true;
  g.add(parts);

  // 石拱门(南向)
  if (gate) {
    const G = { w: 5.2, h: 6.4 };
    for (const sgn of [-1, 1]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(1.8, G.h + 0.8, 2.6), mats.stoneDark);
      jamb.position.set(x + sgn * (G.w / 2 + 0.9), (G.h + 0.8) / 2, z - r);
      jamb.castShadow = true;
      g.add(jamb);
    }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(G.w / 2 + 0.8, 0.9, 8, 20, Math.PI), mats.stoneDark);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x, G.h + 0.8, z - r);
    arch.castShadow = true;
    g.add(arch);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(G.w + 4, 0.8, 3.0), mats.stone);
    lintel.position.set(x, G.h + 1.6, z - r);
    g.add(lintel);
    // 匾
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 0.2), mats.goldTrim);
    plaque.position.set(x, G.h + 1.0, z - r - 1.6);
    g.add(plaque);
  }

  // 灯笼(檐下)
  if (lanterns) {
    const rnd = mulberry32(Math.round(x * 7 + z));
    const nL = Math.max(10, Math.round((Math.PI * 2 * r) / 14));
    for (let k = 0; k < nL; k++) {
      const a = (k / nL) * Math.PI * 2;
      const lx = x + Math.cos(a) * (r - 1.8), lz = z + Math.sin(a) * (r - 1.8);
      const lant = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 10), mats.lantern);
      lant.position.set(lx, h - LANTERN_Y, lz);
      g.add(lant);
      const glow = new THREE.PointLight(0xff9040, 30, 12, 2);
      glow.position.set(lx, h - LANTERN_Y - 0.4, lz);
      g.add(glow);
    }
    const flameIdx = g.children.length - 1;
    updateFns.push((dt, t) => {
      const l = g.children[flameIdx];
      if (l) l.intensity = 30 + Math.sin(t * 6.3 + x) * 6;
    });
  }

  scene.add(g);
  // 漫游碰撞:环墙(门洞豁免)
  addCollider({ circle: [x, z, r - 0.6, r + 0.6], doors: gate ? [[Math.PI, 0.16]] : [] });
  return { group: g };
}

// 主楼(三环 + 祖堂 + 天井生活物件 + 炊烟)
export function buildMainTulou(ctx) {
  const { scene, mats, addCollider, updateFns } = ctx;
  const M = LAYOUT.main;
  const g = new THREE.Group();

  buildRoundTulou(ctx, { x: M.x, z: M.z, r: M.outerR, h: M.outerH, floors: M.floors, gate: true, lanterns: true });
  buildRoundTulou(ctx, { x: M.x, z: M.z, r: M.midR, h: M.midH, floors: 3 });
  buildRoundTulou(ctx, { x: M.x, z: M.z, r: M.innerR, h: M.innerH, floors: 2 });

  // 祖堂(圆心)
  const A = LAYOUT.ancestral;
  const ah = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(A.w + 2, 0.7, A.d + 2), mats.marble);
  base.position.set(A.x, 0.35 + 0.55, A.z);
  ah.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(A.w, 4.6, A.d), mats.wood);
  body.position.set(A.x, 0.9 + 2.3, A.z);
  body.castShadow = true; body.receiveShadow = true;
  ah.add(body);
  for (let i = 0; i < 6; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 4.4, 10), mats.redPaint);
    col.position.set(A.x - A.w / 2 + 1.5 + (i % 3) * ((A.w - 3) / 2), 0.9 + 2.2, A.z + (i < 3 ? 1 : -1) * (A.d / 2 - 0.4));
    col.castShadow = true;
    ah.add(col);
  }
  gableRoof(ah, mats, { x: A.x, y: 0.9 + 4.6, z: A.z, w: A.w, d: A.d, h: 2.6, kind: 'gold', eaveOver: 0.9 });
  // 匾额
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 0.18), mats.goldTrim);
  plaque.position.set(A.x, 0.9 + 5.0, A.z + A.d / 2 + 0.2);
  ah.add(plaque);
  g.add(ah);
  addCollider({ minX: A.x - A.w / 2, maxX: A.x + A.w / 2, minZ: A.z - A.d / 2, maxZ: A.z + A.d / 2 });

  // 水井(石沿)
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.8, 14), mats.stoneDark);
  well.position.set(LAYOUT.well.x, 0.9 + 0.4, LAYOUT.well.z);
  well.castShadow = true; well.receiveShadow = true;
  g.add(well);

  // 晾衣竹竿(横杆两根)
  for (const [wx2, wz2, ang] of [[18, -6, 0.4], [-14, 10, 1.2]]) {
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 6), mats.wood);
    pole1.position.set(wx2 - Math.cos(ang) * 2.3, 2.6, wz2 - Math.sin(ang) * 2.3);
    g.add(pole1);
    const pole2 = pole1.clone();
    pole2.position.set(wx2 + Math.cos(ang) * 2.3, 2.6, wz2 + Math.sin(ang) * 2.3);
    g.add(pole2);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 4.7, 6), mats.wood);
    bar.rotation.z = Math.PI / 2;
    bar.rotation.y = -ang;
    bar.position.set(wx2, 3.2, wz2);
    g.add(bar);
  }

  // 炊烟(厨房区升起,柔灰粒子)
  const N_S = 70;
  const smokeGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(N_S * 3);
  for (let i = 0; i < N_S; i++) {
    sPos[i * 3] = -8 + (Math.random() - 0.5) * 3;
    sPos[i * 3 + 1] = M.midH + 1 + Math.random() * 20;
    sPos[i * 3 + 2] = 14 + (Math.random() - 0.5) * 3;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const cc = cv.getContext('2d');
  const sg = cc.createRadialGradient(32, 32, 4, 32, 32, 32);
  sg.addColorStop(0, 'rgba(210,204,192,0.42)');
  sg.addColorStop(1, 'rgba(210,204,192,0)');
  cc.fillStyle = sg; cc.fillRect(0, 0, 64, 64);
  const smoke = new THREE.Points(smokeGeo, new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(cv), color: 0xd2c8b8, size: 5.5, transparent: true, opacity: 0.4,
    depthWrite: false,
  }));
  smoke.frustumCulled = false;
  smoke.userData.noOcclude = true;
  g.add(smoke);
  updateFns.push((dt, t) => {
    const p = smokeGeo.attributes.position.array;
    for (let i = 0; i < N_S; i++) {
      p[i * 3 + 1] += dt * 1.4;
      p[i * 3] += Math.sin(t * 0.7 + i) * dt * 0.7;
      if (p[i * 3 + 1] > M.midH + 24) p[i * 3 + 1] = M.midH + 1;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  });

  scene.add(g);
  // 中环/内环墙碰撞(漫游)
  addCollider({ circle: [M.x, M.z, M.midR - 0.6, M.midR + 0.6] });
  addCollider({ circle: [M.x, M.z, M.innerR - 0.6, M.innerR + 0.6] });
  return { group: g };
}

// 群楼(「四菜一汤」)
export function buildCluster(ctx) {
  const { scene } = ctx;
  for (const c of LAYOUT.cluster) {
    if (c.oval) {
      buildOvalHall(ctx, c);
    } else {
      buildRoundTulou(ctx, { x: c.x, z: c.z, r: c.r, h: c.h, floors: c.floors, lanterns: true });
    }
  }
  return { group: null };
}

// 椭圆祖堂楼(和昌楼意象)
function buildOvalHall(ctx, c) {
  const { scene, mats, addCollider, updateFns } = ctx;
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(c.rz, c.rx, c.h, 40, 1, true), mats.earthBig);
  wall.scale.set(1, 1, c.rx / c.rz);
  wall.position.set(c.x, c.h / 2, c.z);
  wall.castShadow = true; wall.receiveShadow = true;
  g.add(wall);
  const eave = new THREE.Mesh(new THREE.CylinderGeometry(c.rz * 0.84, c.rx * 0.97, 2.4, 40, 1, true), mats.tileGrey);
  eave.scale.set(1, 1, c.rx / c.rz);
  eave.position.set(c.x, c.h + 1, c.z);
  eave.castShadow = true;
  g.add(eave);
  const lamp = new THREE.PointLight(0xff9040, 40, 16, 2);
  lamp.position.set(c.x, 2.2, c.z);
  g.add(lamp);
  scene.add(g);
  addCollider({ circle: [c.x, c.z, Math.min(c.rx, c.rz) - 0.6, Math.max(c.rx, c.rz) + 0.6] });
  void updateFns;
  return { group: g };
}
