// 崖面:砂岩崖体 + 窟龛阵列(木檐)+ 一/二层栈道 + 磴道 + 窟灯
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../textures.js';
import { LAYOUT } from '../config.js';

export function buildCliff(ctx) {
  const { scene, mats, addCollider, updateFns } = ctx;
  const CL = LAYOUT.cliff;
  const g = new THREE.Group();
  const W = LAYOUT.walkway1, W2 = LAYOUT.walkway2;

  // 崖体(大箱体 + 崖顶缓坡)
  const body = new THREE.Mesh(new THREE.BoxGeometry(CL.x1 - CL.x0, CL.h, CL.z1 - CL.z0), mats.cliff);
  body.position.set((CL.x0 + CL.x1) / 2, CL.h / 2, (CL.z0 + CL.z1) / 2);
  body.receiveShadow = true;
  body.userData.noOcclude = true;
  g.add(body);
  // 崖顶沙檐(风积)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(CL.x1 - CL.x0 + 8, 5, CL.z1 - CL.z0 + 8), mats.rock);
  cap.position.set((CL.x0 + CL.x1) / 2 - 2, CL.h + 2, (CL.z0 + CL.z1) / 2);
  cap.userData.noOcclude = true;
  g.add(cap);

  // 窟龛阵列(黑龛 + 木檐,上下两层,避开九层楼与特色窟)
  const rnd = mulberry32(1001);
  const openings = [];
  const levels = [
    { y: 10, z0: -390, z1: 290, dz: 15, skipZ: [120, 190] },
    { y: 28, z0: -250, z1: 110, dz: 18, skipZ: [120, 190] },
  ];
  for (const lv of levels) {
    for (let z = lv.z0; z < lv.z1; z += lv.dz) {
      if (z > lv.skipZ[0] && z < lv.skipZ[1]) continue; // 九层楼带
      const w = 3.2 + rnd() * 2.6, h = 3.6 + rnd() * 2.2;
      // 黑龛
      const niche = new THREE.Mesh(new THREE.BoxGeometry(1.4, h, w), mats.caveDark);
      niche.position.set(-0.6, lv.y + h / 2, z + (rnd() - 0.5) * 2);
      g.add(niche);
      // 木檐(小坡顶)
      const eave = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, w + 1.6), mats.wood);
      eave.position.set(0.4, lv.y + h + 0.5, niche.position.z);
      eave.rotation.z = 0.12;
      eave.castShadow = true;
      g.add(eave);
      // 部分窟灯(暖光点)
      if (rnd() < 0.34) {
        const lamp = new THREE.PointLight(0xffb46a, 26, 14, 2);
        lamp.position.set(0.8, lv.y + 1.2, niche.position.z);
        g.add(lamp);
        const glowMat = new THREE.MeshStandardMaterial({
          color: 0xffc070, emissive: 0xffa040, emissiveIntensity: 3.2, roughness: 0.6,
        });
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.62, h * 0.52), glowMat);
        glow.position.set(0.12, lv.y + h * 0.55, niche.position.z);
        glow.rotation.y = Math.PI / 2;
        g.add(glow);
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), glowMat);
        flame.position.copy(lamp.position);
        g.add(flame);
        const flameIdx = g.children.length - 1;
        updateFns.push((dt, t) => {
          const f = g.children[flameIdx];
          if (f) f.scale.setScalar(1 + Math.sin(t * 8 + flameIdx) * 0.18);
        });
      }
    }
  }

  // 一层栈道(木面 + 栏杆 + 立柱)
  buildWalkway(g, mats, { ...W, y: W.y });
  buildWalkway(g, mats, { ...W2, y: W2.y });
  // 栈道支撑(挑梁)
  const braces = [];
  for (let z = W.z0; z < W.z1; z += 8) {
    const beam = new THREE.BoxGeometry(3.2, 0.3, 0.3);
    beam.translate(-0.4, W.y - 0.4, z);
    braces.push(beam);
  }
  for (let z = W2.z0; z < W2.z1; z += 9) {
    const beam = new THREE.BoxGeometry(3.4, 0.3, 0.3);
    beam.translate(-0.2, W2.y - 0.4, z);
    braces.push(beam);
  }
  const braceMesh = new THREE.Mesh(mergeGeometries(braces, false), mats.wood);
  braceMesh.castShadow = true;
  g.add(braceMesh);

  // 登崖磴道(台阶盒)
  const S = LAYOUT.stair;
  const steps = [];
  const n = 14;
  for (let k = 0; k < n; k++) {
    const h = W.y * ((k + 1) / n);
    const zc = S.z0 + ((k + 0.5) * (S.z1 - S.z0)) / n;
    const b = new THREE.BoxGeometry(S.w, h, (S.z1 - S.z0) / n);
    b.translate(S.x, h / 2, zc);
    steps.push(b);
  }
  const stairMesh = new THREE.Mesh(mergeGeometries(steps, false), mats.rock);
  stairMesh.castShadow = true; stairMesh.receiveShadow = true;
  g.add(stairMesh);

  // 特色窟洞口(黑幕,真实窟室在 caves.js 内部)
  for (const key of ['buddha', 'mural', 'sutra']) {
    const C = LAYOUT.caves[key];
    const dw = key === 'buddha' ? C.w - 4 : Math.min(C.w - 2, 7);
    const dh = key === 'buddha' ? C.h - 6 : C.h - 2.6;
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(1.2, dh, dw), new THREE.MeshStandardMaterial({ color: 0x18120c, roughness: 1 }));
    mouth.position.set(-0.6, W.y + dh / 2, C.z);
    g.add(mouth);
    // 洞口木檐(大窟为楼,由 jiucenglou 处理;小窟加檐)
    if (key !== 'buddha') {
      const eave = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, dw + 2.4), mats.wood);
      eave.position.set(0.3, W.y + dh + 0.7, C.z);
      eave.castShadow = true;
      g.add(eave);
    }
    // 窟名匾
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.3, Math.min(dw * 0.5, 5)), mats.gold);
    plaque.position.set(0.3, W.y + dh + 1.9, C.z);
    g.add(plaque);
  }

  scene.add(g);
  // 漫游碰撞:崖体东缘(x=0 立面)——栈道带由 groundHeight 提供;崖体其余部分挡住
  addCollider({ minX: -60, maxX: -1.2, minZ: CL.z0 - 2, maxZ: CL.z1 + 2 });
  // 二层栈道栏杆(不可达,忽略)
  void addCollider;
  return { group: g };
}

function buildWalkway(parent, mats, { x0, x1, z0, z1, y }) {
  const w = x1 - x0;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, z1 - z0), mats.wood);
  deck.position.set((x0 + x1) / 2, y - 0.14, (z0 + z1) / 2);
  deck.receiveShadow = true; deck.castShadow = true;
  parent.add(deck);
  // 栏杆(外缘立柱 + 扶手)
  const railX = x1 - 0.25;
  const nPost = Math.round((z1 - z0) / 3.4);
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1.1, 0.16), mats.wood, nPost);
  const _m = new THREE.Matrix4();
  for (let i = 0; i < nPost; i++) {
    _m.identity();
    _m.setPosition(railX, y + 0.55, z0 + (i + 0.5) * ((z1 - z0) / nPost));
    posts.setMatrixAt(i, _m);
  }
  posts.castShadow = true;
  parent.add(posts);
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, z1 - z0), mats.wood);
  hand.position.set(railX, y + 1.12, (z0 + z1) / 2);
  parent.add(hand);
}
