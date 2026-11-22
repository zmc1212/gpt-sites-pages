// 九层楼 + 大佛窟(弥勒大像)/ 壁画窟(覆斗顶 + 经变)/ 藏经洞(经卷遗存)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LAYOUT } from '../config.js';
import { mulberry32 } from '../textures.js';

const WY = 8; // 一层栈道标高(config.groundHeight 同步)

// 窟壳材质(BackSide:自内可见,自外被崖体遮挡)
const shellDark = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 1, side: THREE.BackSide });

// 暗廊(双面):连接崖面与窟室
function addTunnel(parent, mats, { cz, x0, x1, y0, w, h }) {
  const len = x1 - x0, mid = (x0 + x1) / 2;
  const tm = new THREE.MeshStandardMaterial({ color: 0x1c130c, roughness: 1, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(len, 0.3, w), tm);
  floor.position.set(mid, y0 + 0.15, cz);
  parent.add(floor);
  for (const sgn of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(len, h, 0.4), tm);
    side.position.set(mid, y0 + h / 2, cz + sgn * w / 2);
    parent.add(side);
  }
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(len, 0.4, w), tm);
  ceil.position.set(mid, y0 + h, cz);
  parent.add(ceil);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, h + 1.4, w + 1.4), tm);
  mouth.position.set(x1 + 0.3, y0 + (h + 1.4) / 2, cz);
  parent.add(mouth);
}

// ---- 九层楼(贴崖木楼,檐角风铃意象) ----
export function buildJiucenglou(ctx) {
  const { scene, mats, addCollider } = ctx;
  const J = LAYOUT.jiuceng;
  const g = new THREE.Group();
  const x = J.x, z = J.z;
  const y0 = WY;

  for (let i = 0; i < J.tiers; i++) {
    const w = J.w0 * (1 - (i / J.tiers) * 0.52);
    const d = 10 * (1 - (i / J.tiers) * 0.4);
    const y = y0 + i * J.hEach;
    // 平座(木栏)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w + 2.4, 0.5, d + 2), mats.wood);
    deck.position.set(x, y + 0.25, z);
    deck.castShadow = true; deck.receiveShadow = true;
    g.add(deck);
    // 柱列(前排,仅下部 4 层全柱,上层简化)
    if (i < 4) {
      const nCol = Math.max(4, Math.round(w / 3.2));
      const cols = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.34, J.hEach - 0.6, 10), mats.redPaint, nCol);
      const _m = new THREE.Matrix4();
      for (let k = 0; k < nCol; k++) {
        _m.identity();
        _m.setPosition(x - w / 2 + (k + 0.5) * (w / nCol), y + J.hEach / 2, z + d / 2 + 0.7);
        cols.setMatrixAt(k, _m);
      }
      cols.castShadow = true;
      g.add(cols);
    }
    // 檐(外挑两坡 + 翘角)
    const eaveY = y + J.hEach;
    const eave = new THREE.Mesh(new THREE.BoxGeometry(w + 4.6, 0.55, d + 3.6), mats.tileGrey);
    eave.position.set(x - 0.4, eaveY + 0.28, z);
    eave.rotation.z = 0.06;
    eave.castShadow = true;
    g.add(eave);
    // 身部(封闭背壁,贴崖)
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, J.hEach, d * 0.5), mats.wood);
    body.position.set(x - 1.4, eaveY - J.hEach / 2 + 0.5, z);
    g.add(body);
  }
  // 宝顶
  const finial = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.4, 12), mats.gold);
  finial.position.set(x - 1, y0 + J.tiers * J.hEach + 1.7, z);
  finial.castShadow = true;
  g.add(finial);
  // 楼内暖光(大佛窟口)
  const lamp = new THREE.PointLight(0xffcf90, 900, 90, 2);
  lamp.position.set(x + 2, y0 + 12, z);
  g.add(lamp);

  scene.add(g);
  addCollider({ minX: x - J.w0 / 2 - 1, maxX: x + 4, minZ: z - 8, maxZ: z + 8 });
  return { group: g };
}

// ---- 大佛窟(弥勒大像:泥塑彩绘抽象,金彩袈裟) ----
export function buildBuddhaCave(ctx) {
  const { scene, mats, addCollider } = ctx;
  const C = LAYOUT.caves.buddha;
  const g = new THREE.Group();
  const y0 = WY;
  const cx = C.x, cz = C.z;

  // 窟室(箱体,东壁开口)
  const shell = new THREE.Mesh(new THREE.BoxGeometry(C.w + 4, C.h, C.d + 4), shellDark);
  shell.position.set(cx - 2, y0 + C.h / 2, cz);
  shell.userData.noOcclude = true;
  g.add(shell);
  // 入窟隧道(崖体内暗廊:连接崖面与窟室)
  addTunnel(g, mats, { cz: C.z, x0: -18.5, x1: -0.6, y0, w: C.w - 4, h: C.h - 6 });
  // 窟内壁(浅色泥层)
  const inner = new THREE.Mesh(new THREE.BoxGeometry(C.w, C.h - 1, C.d), new THREE.MeshStandardMaterial({ color: 0x8a7060, roughness: 1, side: THREE.BackSide }));
  inner.position.set(cx, y0 + C.h / 2, cz);
  g.add(inner);
  // 窟顶藻井(阶梯方井)
  for (let k = 0; k < 4; k++) {
    const s = (C.w - 4) * (1 - k * 0.18);
    const zj = new THREE.Mesh(new THREE.BoxGeometry(s, 0.5, s * 0.9), mats.muralAlt);
    zj.position.set(cx, y0 + C.h - 1 - k * 0.9, cz);
    g.add(zj);
  }
  // 地面(莲砖意象:大圆台)
  const lotus = new THREE.Mesh(new THREE.CylinderGeometry(C.w * 0.42, C.w * 0.42, 0.4, 32), mats.marble);
  lotus.position.set(cx, y0 + 0.2, cz - 2);
  lotus.receiveShadow = true;
  g.add(lotus);

  // ---- 弥勒大像(抽象坐姿:不刻画五官) ----
  const fx = cx - 8, fz = cz - 4; // 佛位(偏西,面东)
  const bh = 26; // 总高
  // 莲座
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 8.4, 2.6, 24), mats.gold);
  pedestal.position.set(fx, y0 + 2.9, fz);
  pedestal.castShadow = true; pedestal.receiveShadow = true;
  g.add(pedestal);
  // 双膝(横置大椭柱)
  const knees = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 11, 20), mats.robe);
  knees.rotation.x = Math.PI / 2;
  knees.position.set(fx + 1.2, y0 + 8.2, fz);
  knees.castShadow = true;
  g.add(knees);
  // 躯干(锥台)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 5.4, 9.5, 20), mats.robe);
  torso.position.set(fx, y0 + 15.5, fz);
  torso.castShadow = true;
  g.add(torso);
  // 胸前衣带
  const sash = new THREE.Mesh(new THREE.BoxGeometry(1.1, 8.5, 0.5), mats.gold);
  sash.position.set(fx + 2.4, y0 + 15.2, fz + 4.2);
  sash.rotation.z = 0.24;
  g.add(sash);
  // 头(球 + 肉髻)
  const head = new THREE.Mesh(new THREE.SphereGeometry(2.5, 20, 16), mats.skin);
  head.scale.set(1, 1.14, 1.05);
  head.position.set(fx, y0 + 22.2, fz + 1.4);
  head.castShadow = true;
  g.add(head);
  const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), mats.skin);
  ushnisha.position.set(fx, y0 + 24.9, fz + 1.1);
  g.add(ushnisha);
  // 双耳
  for (const sgn of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.6, 10), mats.skin);
    ear.scale.set(1, 1, 0.4);
    ear.position.set(fx + sgn * 2.3, y0 + 21.8, fz + 1.3);
    g.add(ear);
  }
  // 双手(腹前定印)
  for (const sgn of [-1, 1]) {
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), mats.skin);
    hand.scale.set(1.4, 0.5, 1);
    hand.position.set(fx + sgn * 1.3, y0 + 12.4, fz + 4.4);
    g.add(hand);
  }
  // 背光(火焰纹大圆)
  const halo = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 0.3, 40), mats.muralAlt);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(fx, y0 + 19, fz - 4);
  g.add(halo);
  // 窟内照明
  const up = new THREE.PointLight(0xffd9a0, 1400, 60, 2);
  up.position.set(fx + 4, y0 + C.h - 4, cz);
  g.add(up);
  const low = new THREE.PointLight(0xffb878, 700, 44, 2);
  low.position.set(fx + 5, y0 + 8, cz + 4);
  g.add(low);

  scene.add(g);
  addCollider({ minX: fx - 6.5, maxX: fx + 6.5, minZ: fz - 5.5, maxZ: fz + 5.5 }); // 佛座(漫游不穿佛)
  return { group: g };
}

// ---- 壁画窟(覆斗顶经变窟:四壁画 + 中心塔柱) ----
export function buildMuralCave(ctx) {
  const { scene, mats, addCollider } = ctx;
  const C = LAYOUT.caves.mural;
  const g = new THREE.Group();
  const y0 = WY;
  const cx = C.x, cz = C.z;

  // 窟室(暗壳)
  const shell = new THREE.Mesh(new THREE.BoxGeometry(C.w + 3, C.h, C.d + 3), shellDark);
  shell.position.set(cx - 1.5, y0 + C.h / 2, cz);
  shell.userData.noOcclude = true;
  g.add(shell);
  addTunnel(g, mats, { cz: C.z, x0: -14.5, x1: -0.6, y0, w: 7, h: C.h - 3 });
  // 四壁壁画(内贴)
  const wallMat = mats.mural;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(C.w - 1, C.h - 2), wallMat);
  back.position.set(cx - C.w / 2 + 0.6, y0 + C.h / 2, cz);
  back.rotation.y = Math.PI / 2;
  g.add(back);
  for (const sgn of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(C.d - 2, C.h - 2), mats.muralAlt);
    side.position.set(cx, y0 + C.h / 2, cz + sgn * (C.d / 2 - 0.6));
    side.rotation.y = sgn > 0 ? Math.PI : 0;
    g.add(side);
  }
  // 覆斗顶(梯形藻井,壁画带)
  const roofH = 3.2;
  const roofProfile = new THREE.Shape();
  roofProfile.moveTo(-(C.w - 2) / 2, 0);
  roofProfile.lineTo(-(C.w - 2) / 4, roofH);
  roofProfile.lineTo((C.w - 2) / 4, roofH);
  roofProfile.lineTo((C.w - 2) / 2, 0);
  roofProfile.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofProfile, { depth: C.d - 2, bevelEnabled: false });
  roofGeo.translate(0, y0 + C.h - 1, 0);
  const roof = new THREE.Mesh(roofGeo, wallMat);
  roof.rotation.y = Math.PI / 2;
  roof.position.set(cx, 0, cz);
  g.add(roof);
  // 中心塔柱(四方柱 + 上龛)
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(4.4, C.h - 3, 4.4), mats.rock);
  pillar.position.set(cx + 3, y0 + (C.h - 3) / 2, cz + 2);
  pillar.castShadow = true; pillar.receiveShadow = true;
  g.add(pillar);
  const niche = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 0.4), mats.muralAlt);
  niche.position.set(cx + 3, y0 + C.h - 5, cz + 4.3);
  g.add(niche);
  const nicheBuddha = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), mats.gold);
  nicheBuddha.position.set(cx + 3, y0 + C.h - 5, cz + 4.7);
  g.add(nicheBuddha);
  // 窟灯
  const lamp = new THREE.PointLight(0xffd0a0, 420, 30, 2);
  lamp.position.set(cx + 1, y0 + C.h - 3, cz);
  g.add(lamp);
  const lamp2 = new THREE.PointLight(0xffc890, 260, 22, 2);
  lamp2.position.set(cx - 3, y0 + 2.4, cz - 3);
  g.add(lamp2);

  scene.add(g);
  addCollider({ minX: cx + 1, maxX: cx + 5, minZ: cz, maxZ: cz + 4 }); // 塔柱
  return { group: g };
}

// ---- 藏经洞(小耳窟:空窟 + 散卷) ----
export function buildSutraCave(ctx) {
  const { scene, mats, addCollider } = ctx;
  const C = LAYOUT.caves.sutra;
  const g = new THREE.Group();
  const y0 = WY;
  const cx = C.x, cz = C.z;
  const rnd = mulberry32(1717);

  const shell = new THREE.Mesh(new THREE.BoxGeometry(C.w + 2.4, C.h, C.d + 2.4), shellDark);
  shell.position.set(cx - 1.2, y0 + C.h / 2, cz);
  shell.userData.noOcclude = true;
  g.add(shell);
  addTunnel(g, mats, { cz: C.z, x0: -10.5, x1: -0.6, y0, w: 6, h: C.h - 2 });
  const inner = new THREE.Mesh(new THREE.BoxGeometry(C.w, C.h - 1, C.d), new THREE.MeshStandardMaterial({ color: 0x9a8068, roughness: 1, side: THREE.BackSide }));
  inner.position.set(cx, y0 + C.h / 2, cz);
  g.add(inner);
  // 壁画(西壁引路菩萨意象:简化条幅)
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(C.w - 3, C.h - 3), mats.muralAlt);
  scroll.position.set(cx - C.w / 2 + 0.4, y0 + C.h / 2, cz);
  scroll.rotation.y = Math.PI / 2;
  g.add(scroll);
  // 地面散卷(小卷轴盒)
  const scrolls = [];
  for (let i = 0; i < 7; i++) {
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6 + rnd(), 8), mats.wood);
    roll.rotation.z = Math.PI / 2;
    roll.rotation.y = rnd() * Math.PI;
    roll.position.set(cx + (rnd() - 0.5) * (C.w - 3), y0 + 0.14, cz + (rnd() - 0.5) * (C.d - 3));
    roll.castShadow = true;
    g.add(roll);
    scrolls.push(roll);
  }
  // 空匣(经匣遗痕)
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 1.2), mats.wood);
  box.position.set(cx + 1, y0 + 0.35, cz - 2);
  box.castShadow = true;
  g.add(box);
  const lamp = new THREE.PointLight(0xffcf9c, 180, 18, 2);
  lamp.position.set(cx + 1, y0 + C.h - 2, cz);
  g.add(lamp);

  scene.add(g);
  return { group: g };
}
