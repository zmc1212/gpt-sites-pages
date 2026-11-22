// 长城本体:墙身 + 垛口 + 敌楼(砖拱箭窗)+ 烽火台(火/烟)+ 村舍 + 云海
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../textures.js';
import { RIDGE_PTS, WALL_H, STRUCTS, mountainHeight } from '../config.js';
import { hall } from './hall.js';

// ---- 墙身(沿山脊折线分段;每段贴地 + 垛口实例化) ----
export function buildWall(ctx) {
  const { scene, mats, addCollider } = ctx;
  const g = new THREE.Group();
  const wallMat = mats.brickWall;

  // 墙身段盒(每 8m 一段,顶 = 山脊高 + WALL_H)
  const segBoxes = [];
  const merlonMats = [];
  const merlonTrans = [];
  for (let i = 0; i < RIDGE_PTS.length - 1; i++) {
    const a = RIDGE_PTS[i], b = RIDGE_PTS[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    const ang = -Math.atan2(dz, dx);
    const nSeg = Math.max(2, Math.round(len / 8));
    for (let k = 0; k < nSeg; k++) {
      const t = (k + 0.5) / nSeg;
      const px = a[0] + dx * t, pz = a[1] + dz * t;
      // 敌楼/烽火台范围内断开墙段(楼体自身跨越)
      if (STRUCTS.towers.some((tw) => Math.hypot(px - tw.x, pz - tw.z) < tw.w / 2 + 3.5)) continue;
      if (Math.hypot(px - STRUCTS.beacon.x, pz - STRUCTS.beacon.z) < 12) continue;
      const crest = mountainHeight(px, pz);
      const top = crest + WALL_H;
      const h = WALL_H + 1.5;
      const box = new THREE.BoxGeometry(5.2, h, len / nSeg + 0.5);
      box.rotateY(ang);
      box.translate(px, top - h / 2, pz);
      segBoxes.push(box);
      // 垛口(两侧,间距 2.4)
      const nM = Math.floor((len / nSeg) / 2.4);
      for (let mI = 0; mI < nM; mI++) {
        const tm = (mI + 0.5) / nM;
        for (const sgn of [-1, 1]) {
          const ox = Math.cos(ang + (sgn > 0 ? 0 : Math.PI)) * 2.35;
          const oz = Math.sin(ang + (sgn > 0 ? 0 : Math.PI)) * 2.35;
          // 盒局部:沿段方向平移
          const mx = px + Math.cos(ang) * (tm - 0.5) * (len / nSeg) + ox;
          const mz = pz + Math.sin(ang) * (tm - 0.5) * (len / nSeg) + oz;
          merlonTrans.push([mx, top + 0.65, mz, ang]);
        }
      }
    }
  }
  const wallMesh = new THREE.Mesh(mergeGeometries(segBoxes, false), wallMat);
  wallMesh.castShadow = true; wallMesh.receiveShadow = true;
  g.add(wallMesh);

  // 垛口条(单几何实例化)
  const merlonGeo = new THREE.BoxGeometry(1.3, 1.3, 0.55);
  const merlons = new THREE.InstancedMesh(merlonGeo, mats.brick, merlonTrans.length);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  merlonTrans.forEach(([x, y, z, ang], i) => {
    _e.set(0, ang, 0);
    _q.setFromEuler(_e);
    _m.compose(new THREE.Vector3(x, y, z), _q, new THREE.Vector3(1, 1, 1));
    merlons.setMatrixAt(i, _m);
  });
  merlons.castShadow = true; merlons.receiveShadow = true;
  g.add(merlons);

  // 文字砖面(若干戳印砖嵌在墙顶内侧)
  const stampMeshes = [];
  const rnd = mulberry32(909);
  for (let i = 0; i < 10; i++) {
    const pi = Math.floor(rnd() * (RIDGE_PTS.length - 1));
    const a = RIDGE_PTS[pi], b = RIDGE_PTS[pi + 1];
    const t = rnd();
    const px = a[0] + (b[0] - a[0]) * t, pz = a[1] + (b[1] - a[1]) * t;
    if (STRUCTS.towers.some((tw) => Math.hypot(px - tw.x, pz - tw.z) < 12)) continue;
    const crest = mountainHeight(px, pz);
    const ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const st = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.12), mats.stamp);
    st.position.set(px + Math.cos(ang) * 2.0, crest + WALL_H - 1.0, pz + Math.sin(ang) * 2.0);
    st.rotation.y = ang;
    g.add(st);
    stampMeshes.push(st);
  }

  // 漫游:墙身整体用"厚 AABB 段"不可通行(厚度 > 3.4 的 AABB 不参与巡游相机推出,
  // 漫游由 groundHeight 的墙顶带接管:跌落侧高差 > 2.4 被挡)
  void addCollider;
  scene.add(g);
  return { group: g };
}

// ---- 敌楼(空心砖楼:拱门 + 箭窗 + 垛口顶) ----
export function buildTowers(ctx) {
  const { scene, mats, addCollider } = ctx;
  const g = new THREE.Group();
  for (const t of STRUCTS.towers) {
    const tg = new THREE.Group();
    const y0 = t.crest - 2;
    const topY = t.crest + WALL_H;
    // 楼体(留南北门洞:前后 4.2m 宽 × 5m 高贯通)
    const segs = [];
    const doorW = 2.1, doorH = 4.6;
    // 东西两壁(整块,开箭窗龛)
    for (const sgn of [-1, 1]) {
      const b = new THREE.BoxGeometry(t.w, t.h, t.d / 2 - doorW);
      b.translate(sgn * 0, 0, 0);
      void b;
    }
    // 简化:四壁 = 2 个横墙(x 向)+ 2 个纵墙各分两段留中门
    const wallE = new THREE.BoxGeometry(t.d, t.h, 2.2);
    wallE.translate(t.w / 2 - 1.1, t.h / 2, 0);
    segs.push(wallE);
    const wallW = new THREE.BoxGeometry(t.d, t.h, 2.2);
    wallW.translate(-t.w / 2 + 1.1, t.h / 2, 0);
    segs.push(wallW);
    for (const sgn of [-1, 1]) {
      const wallA = new THREE.BoxGeometry(2.2, t.h, t.d / 2 - doorW);
      wallA.translate(0, t.h / 2, sgn * (t.d / 4 + doorW / 2));
      segs.push(wallA);
      const lintel = new THREE.BoxGeometry(2.2, t.h - doorH, doorW * 2);
      lintel.translate(0, doorH + (t.h - doorH) / 2, 0);
      segs.push(lintel);
    }
    const body = new THREE.Mesh(mergeGeometries(segs, false), mats.brickWall);
    body.position.set(t.x, y0 + t.h / 2, t.z);
    body.castShadow = true; body.receiveShadow = true;
    tg.add(body);
    // 楼面(墙顶标高,中室铺砖)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(t.w - 1.2, 0.4, t.d - 1.2), mats.brick);
    floor.position.set(t.x, topY - 0.6, t.z);
    floor.receiveShadow = true;
    tg.add(floor);
    // 顶垛口环
    const nPost = Math.round((t.w + t.d) * 2 / 2.6);
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(1.3, 1.4, 0.6), mats.brick, nPost);
    const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
    let i = 0;
    for (let k = 0; k < nPost; k++) {
      const a = (k / nPost) * Math.PI * 2;
      const rx = Math.cos(a) * (t.w / 2 - 0.3), rz = Math.sin(a) * (t.d / 2 - 0.3);
      _e.set(0, -a, 0);
      _q.setFromEuler(_e);
      _m.compose(new THREE.Vector3(t.x + rx, topY + 0.7, t.z + rz), _q, new THREE.Vector3(1, 1, 1));
      posts.setMatrixAt(i++, _m);
    }
    posts.count = i;
    posts.castShadow = true; posts.receiveShadow = true;
    tg.add(posts);
    // 内室:木柱四根 + 壁龛带
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, t.h - 1.2, 8), mats.wood);
      post.position.set(t.x + sx * (t.w / 2 - 2.6), y0 + (t.h - 1.2) / 2, t.z + sz * (t.d / 2 - 2.6));
      post.castShadow = true;
      tg.add(post);
    }
    const niche = new THREE.Mesh(new THREE.BoxGeometry(t.w - 4.6, 1.1, t.d - 4.6), mats.wood);
    niche.position.set(t.x, y0 + 1.1, t.z);
    tg.add(niche);
    // 内部暖光(箭窗漏光)
    const lamp = new THREE.PointLight(0xffe0b0, 220, t.w * 1.6, 2);
    lamp.position.set(t.x, topY - 2.5, t.z);
    tg.add(lamp);

    scene.add(tg);
    // 漫游碰撞:楼体四壁(门洞豁免由 groundHeight 楼内区域 + 磴道实现;
    // 这里给东西两壁加碰撞,南北门洞通行)
    addCollider({ minX: t.x + t.w / 2 - 2.2, maxX: t.x + t.w / 2, minZ: t.z - t.d / 2 - 0.5, maxZ: t.z + t.d / 2 + 0.5 });
    addCollider({ minX: t.x - t.w / 2, maxX: t.x - t.w / 2 + 2.2, minZ: t.z - t.d / 2 - 0.5, maxZ: t.z + t.d / 2 + 0.5 });
  }
  return { group: g };
}

// ---- 烽火台(圆台 + 火焰/烟粒子) ----
export function buildBeacon(ctx) {
  const { scene, mats, addCollider, updateFns } = ctx;
  const B = STRUCTS.beacon;
  const g = new THREE.Group();
  const y0 = B.crest + WALL_H;
  // 台体(两层圆台)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(9, 10.5, 3.2, 20), mats.brickCyl);
  base.position.set(B.x, y0 + 1.6, B.z);
  base.castShadow = true; base.receiveShadow = true;
  g.add(base);
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 8, 4.6, 18), mats.brickCyl);
  upper.position.set(B.x, y0 + 5.4, B.z);
  upper.castShadow = true; upper.receiveShadow = true;
  g.add(upper);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.5, 18), mats.brick);
  top.position.set(B.x, y0 + 7.7, B.z);
  top.receiveShadow = true;
  g.add(top);
  // 火盆
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 1.9, 1.3, 14), new THREE.MeshStandardMaterial({ color: 0x3c3630, roughness: 0.8, metalness: 0.4 }));
  bowl.position.set(B.x, y0 + 8.4, B.z);
  bowl.castShadow = true;
  g.add(bowl);

  // 火焰粒子(加色)
  const N_FIRE = 260;
  const fireGeo = new THREE.BufferGeometry();
  const fPos = new Float32Array(N_FIRE * 3);
  const fVel = new Float32Array(N_FIRE * 3);
  const resetF = (i) => {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 1.6;
    fPos[i * 3] = B.x + Math.cos(a) * r;
    fPos[i * 3 + 1] = y0 + 9.0;
    fPos[i * 3 + 2] = B.z + Math.sin(a) * r;
    fVel[i * 3] = (Math.random() - 0.5) * 1.2;
    fVel[i * 3 + 1] = 4.5 + Math.random() * 3.5;
    fVel[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
  };
  for (let i = 0; i < N_FIRE; i++) resetF(i);
  fireGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fireTexC = document.createElement('canvas');
  fireTexC.width = fireTexC.height = 32;
  const fcc = fireTexC.getContext('2d');
  const fg = fcc.createRadialGradient(16, 16, 1, 16, 16, 16);
  fg.addColorStop(0, 'rgba(255,220,140,1)');
  fg.addColorStop(0.5, 'rgba(255,140,50,0.65)');
  fg.addColorStop(1, 'rgba(255,80,20,0)');
  fcc.fillStyle = fg; fcc.fillRect(0, 0, 32, 32);
  const fire = new THREE.Points(fireGeo, new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(fireTexC), color: 0xffc070, size: 1.6, transparent: true, opacity: 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  fire.frustumCulled = false;
  fire.userData.noOcclude = true;
  g.add(fire);
  // 烟粒子(柔灰,上升扩散)
  const N_SMOKE = 90;
  const smokeGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(N_SMOKE * 3);
  const sVel = new Float32Array(N_SMOKE * 3);
  const resetS = (i) => {
    sPos[i * 3] = B.x + (Math.random() - 0.5) * 2;
    sPos[i * 3 + 1] = y0 + 10 + Math.random() * 4;
    sPos[i * 3 + 2] = B.z + (Math.random() - 0.5) * 2;
    sVel[i * 3] = (Math.random() - 0.5) * 0.6;
    sVel[i * 3 + 1] = 2.2 + Math.random() * 1.6;
    sVel[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
  };
  for (let i = 0; i < N_SMOKE; i++) { resetS(i); sPos[i * 3 + 1] = y0 + 10 + Math.random() * 30; }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const smokeTexC = document.createElement('canvas');
  smokeTexC.width = smokeTexC.height = 64;
  const scc = smokeTexC.getContext('2d');
  const sg = scc.createRadialGradient(32, 32, 4, 32, 32, 32);
  sg.addColorStop(0, 'rgba(190,180,170,0.5)');
  sg.addColorStop(1, 'rgba(190,180,170,0)');
  scc.fillStyle = sg; scc.fillRect(0, 0, 64, 64);
  const smoke = new THREE.Points(smokeGeo, new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(smokeTexC), color: 0xcabcaa, size: 9, transparent: true, opacity: 0.32,
    depthWrite: false,
  }));
  smoke.frustumCulled = false;
  smoke.userData.noOcclude = true;
  g.add(smoke);
  // 火光
  const fireLight = new THREE.PointLight(0xff9040, 600, 60, 2);
  fireLight.position.set(B.x, y0 + 10, B.z);
  g.add(fireLight);

  updateFns.push((dt, t) => {
    const fp = fireGeo.attributes.position.array;
    for (let i = 0; i < N_FIRE; i++) {
      fVel[i * 3 + 1] -= 2.0 * dt;
      fp[i * 3] += fVel[i * 3] * dt + Math.sin(t * 7 + i) * 0.01;
      fp[i * 3 + 1] += fVel[i * 3 + 1] * dt;
      fp[i * 3 + 2] += fVel[i * 3 + 2] * dt;
      if (fp[i * 3 + 1] > y0 + 13.5 || fVel[i * 3 + 1] < 0.5) resetF(i);
    }
    fireGeo.attributes.position.needsUpdate = true;
    const sp = smokeGeo.attributes.position.array;
    for (let i = 0; i < N_SMOKE; i++) {
      sp[i * 3] += sVel[i * 3] * dt + Math.sin(t * 0.9 + i * 1.3) * dt * 1.4;
      sp[i * 3 + 1] += sVel[i * 3 + 1] * dt;
      sp[i * 3 + 2] += sVel[i * 3 + 2] * dt;
      if (sp[i * 3 + 1] > y0 + 60) resetS(i);
    }
    smokeGeo.attributes.position.needsUpdate = true;
    fireLight.intensity = 600 + Math.sin(t * 9.7) * 140 + Math.sin(t * 23.3) * 60;
  });

  scene.add(g);
  addCollider({ circle: [B.x, B.z, 8.5, 10.5], doors: [[0, 0.5]] });
  return { group: g };
}

// ---- 山脚村舍(灰瓦石墙小院) ----
export function buildVillage(ctx) {
  const { scene, mats, addCollider } = ctx;
  const V = STRUCTS.village;
  const g = new THREE.Group();
  const rnd = mulberry32(404);
  const spots = [
    [0, 0], [22, 8], [-20, 10], [12, -18], [-14, -16], [30, -6], [-30, 2], [4, 22],
  ];
  for (const [ox, oz] of spots) {
    const x = V.x + ox + (rnd() - 0.5) * 4, z = V.z + oz + (rnd() - 0.5) * 4;
    const y = mountainHeight(x, z);
    const rot = (rnd() - 0.5) * 0.6;
    const grp = new THREE.Group();
    hall(grp, mats, { x: 0, z: 0, y, w: 8 + rnd() * 3, d: 6 + rnd() * 2, wallH: 2.9, roofH: 1.9, kind: 'grey', base: true });
    // 石墙院
    const yard = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 10), mats.rock);
    void yard;
    grp.position.set(x, 0, z);
    grp.rotation.y = rot;
    g.add(grp);
    addCollider({ minX: x - 5, maxX: x + 5, minZ: z - 4, maxZ: z + 4 });
  }
  scene.add(g);
  return { group: g };
}

// ---- 云海(终章:谷底云层平面 + 云团精灵) ----
export function buildCloudSea(ctx) {
  const { scene, updateFns } = ctx;
  const g = new THREE.Group();
  // 云层平面(柔噪声 alpha)
  const cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  const cc = cv.getContext('2d');
  const rnd = mulberry32(808);
  cc.fillStyle = 'rgba(210,206,220,0.62)';
  cc.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 150; i++) {
    const gx = rnd() * 512, gy = rnd() * 512, rr = 40 + rnd() * 110;
    const gr = cc.createRadialGradient(gx, gy, 4, gx, gy, rr);
    gr.addColorStop(0, `rgba(246,244,252,${0.55 + rnd() * 0.4})`);
    gr.addColorStop(1, 'rgba(246,244,252,0)');
    cc.fillStyle = gr;
    cc.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
  }
  for (let i = 0; i < 240; i++) {
    const rr = 20 + rnd() * 60;
    const rg = cc.createRadialGradient(rnd() * 512, rnd() * 512, 2, 0, 0, rr);
    void rg;
    const gx = rnd() * 512, gy = rnd() * 512;
    const gr = cc.createRadialGradient(gx, gy, 2, gx, gy, rr);
    gr.addColorStop(0, `rgba(246,244,250,${0.5 + rnd() * 0.4})`);
    gr.addColorStop(1, 'rgba(246,244,250,0)');
    cc.fillStyle = gr;
    cc.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
  }
  const cloudTex = new THREE.CanvasTexture(cv);
  void cloudTex;
  // 云团(大软点)
  const puffTexC = document.createElement('canvas');
  puffTexC.width = puffTexC.height = 128;
  const pcc = puffTexC.getContext('2d');
  const pg = pcc.createRadialGradient(64, 64, 6, 64, 64, 64);
  pg.addColorStop(0, 'rgba(248,246,252,0.85)');
  pg.addColorStop(1, 'rgba(248,246,252,0)');
  pcc.fillStyle = pg; pcc.fillRect(0, 0, 128, 128);
  const puffTex = new THREE.CanvasTexture(puffTexC);
  const N_PUFF = 340;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(N_PUFF * 3);
  for (let i = 0; i < N_PUFF; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 5200;
    pPos[i * 3 + 1] = 14 + Math.random() * 60;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 5200 + 60;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const puffs = new THREE.Points(pGeo, new THREE.PointsMaterial({
    map: puffTex, color: 0xeae4f0, size: 150, transparent: true, opacity: 0.55,
    depthWrite: false, sizeAttenuation: true,
  }));
  puffs.frustumCulled = false;
  puffs.userData.noOcclude = true;
  g.add(puffs);
  updateFns.push((dt) => {
    puffs.position.x += dt * 1.1;
    if (puffs.position.x > 2100) puffs.position.x = -2100;
  });
  scene.add(g);
  return { group: g };
}
