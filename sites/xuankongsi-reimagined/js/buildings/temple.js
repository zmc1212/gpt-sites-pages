// 悬空寺:横梁插崖 + 立木 + 一/二层栈道 + 殿阁群 + 栏杆红绸 + 龛佛
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../textures.js';
import { LAYOUT } from '../config.js';
import { gableRoof } from './roof.js';
import { hall } from './hall.js';

const W1 = 12, W2 = 26; // 栈道标高

export function buildTemple(ctx) {
  const { scene, mats, addCollider, updateFns } = ctx;
  const g = new THREE.Group();
  const rnd = mulberry32(1111);

  // ---- 横梁(插崖悬臂:两层各一排) ----
  const beams = [];
  for (const [y, z0, z1, n] of [[W1 - 0.5, -50, 48, 22], [W2 - 0.5, -24, 46, 16]]) {
    for (let i = 0; i < n; i++) {
      const z = z0 + (i / (n - 1)) * (z1 - z0);
      const b = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.5, 0.5), mats.log);
      b.position.set(0.4, y, z);
      b.castShadow = true;
      g.add(b);
      // 凿孔暗盒
      const hole = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 0.6), mats.stoneDark);
      hole.position.set(-3.6, y, z);
      g.add(hole);
      beams.push(b);
    }
  }

  // 中间层横梁(腰殿层)
  for (let i = 0; i < 9; i++) {
    const z = -12 + (i / 8) * 40;
    const b = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.5, 0.5), mats.log);
    b.position.set(0.4, W1 + 5.5, z);
    b.castShadow = true;
    g.add(b);
  }

  // ---- 立木(细长支撑,部分微斜) ----
  const props = [];
  for (const [y, z0, z1, n] of [[W1, -46, 44, 14], [W2, -20, 42, 10]]) {
    for (let i = 0; i < n; i++) {
      const z = z0 + (i / (n - 1)) * (z1 - z0);
      const len = y - gorgeFloorY(z);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, len, 8), mats.wood);
      p.position.set(1.6, gorgeFloorY(z) + len / 2, z);
      p.castShadow = true;
      g.add(p);
      props.push(p);
    }
  }
  function gorgeFloorY(z) { return 1.5; }

  // ---- 栈道面(板条 + 栏杆) ----
  buildWalkway(g, mats, LAYOUT.walkway1);
  buildWalkway(g, mats, LAYOUT.walkway2);

  // ---- 石阶(谷底 → 一层) ----
  const S = LAYOUT.stair;
  const steps = [];
  const nS = 12;
  for (let k = 0; k < nS; k++) {
    const h = W1 * ((k + 1) / nS);
    const zc = S.z0 + ((k + 0.5) * (S.z1 - S.z0)) / nS;
    const b = new THREE.BoxGeometry(S.w, h, (S.z1 - S.z0) / nS);
    b.translate(S.x, h / 2, zc);
    steps.push(b);
  }
  const stairMesh = new THREE.Mesh(mergeGeometries(steps, false), mats.stone);
  stairMesh.castShadow = true; stairMesh.receiveShadow = true;
  g.add(stairMesh);

  // ---- 殿阁(一层:罗汉殿 + 门楼;二层:长线桥楼 + 三教殿) ----
  const H = LAYOUT.halls;
  smallHall(g, mats, { ...H.luohan, x: 1.5, w: 11, d: 8, h: 4.0, y: W1, lanterns: true });
  smallHall(g, mats, { name: '山门楼', x: 1.5, z: -32, w: 9, d: 7, h: 3.6, y: W1, lanterns: true });
  smallHall(g, mats, { name: '观音堂', x: 1.5, z: 0, w: 8, d: 7, h: 3.2, y: W1, lanterns: true });
  smallHall(g, mats, { name: '伽蓝殿', x: 1.5, z: -10, w: 8, d: 7, h: 3.4, y: W1 + 5.5, lanterns: true });
  smallHall(g, mats, { name: '大士阁', x: 1.5, z: 22, w: 8, d: 7, h: 3.4, y: W1 + 5.5, lanterns: true });
  smallHall(g, mats, { ...H.qiaolou, x: 1.5, w: 9, d: 7, h: 3.6, y: W2, lanterns: true });
  smallHall(g, mats, { name: '大雄宝殿', x: 1.5, z: 26, w: 9, d: 7, h: 3.6, y: W2, lanterns: true });
  smallHall(g, mats, { ...H.sanjiao, x: 1.5, w: 11, d: 9, h: 4.0, y: W2, lanterns: true, threeStatues: true });

  // 二层连接桥(长线桥意象:两殿之间的廊)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 12), mats.wood);
  bridge.position.set(-1.6, W2 + 0.15, 26);
  bridge.castShadow = true; bridge.receiveShadow = true;
  g.add(bridge);
  for (const sgn of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 12), mats.redPaint);
    rail.position.set(-1.6 + sgn * 1.5, W2 + 0.75, 26);
    g.add(rail);
  }

  // ---- 龛佛(崖壁佛龛,抽象) ----
  for (const [z, y] of [[-4, W1 + 5.5], [10, W2 + 5.5]]) {
    const niche = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.8), mats.stoneDark);
    niche.position.set(0.6, y, z);
    g.add(niche);
    const buddha = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), mats.gold);
    buddha.scale.set(1, 1.2, 1);
    buddha.position.set(1.6, y, z);
    g.add(buddha);
  }

  // ---- 祈福红绸(栏杆上,风中摆动) ----
  const ribbons = [];
  for (let i = 0; i < 8; i++) {
    const z = -40 + i * 11;
    const rb = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.2, 1, 4), mats.ribbon);
    rb.position.set(2.45, W1 + 0.4, z + (rnd() - 0.5) * 3);
    rb.rotation.y = Math.PI / 2;
    g.add(rb);
    ribbons.push({ mesh: rb, phase: rnd() * 6.28, baseX: 2.45 });
  }
  updateFns.push((dt, t) => {
    for (const r of ribbons) {
      r.mesh.rotation.x = Math.sin(t * 1.6 + r.phase) * 0.24;
      r.mesh.position.x = r.baseX + Math.sin(t * 1.1 + r.phase) * 0.08;
    }
  });

  // 全寺暮色暖光(终章剪影时勾勒朱红)
  const duskGlow = new THREE.PointLight(0xff9a50, 1400, 110, 2);
  duskGlow.position.set(6, 20, 6);
  g.add(duskGlow);

  // ---- 殿内暖光 ----
  for (const h of [H.luohan, H.sanjiao]) {
    const lamp = new THREE.PointLight(0xffcf90, 90, 18, 2);
    lamp.position.set(h.x + 3, h.y + 2.4, h.z);
    g.add(lamp);
  }

  scene.add(g);
  // 漫游碰撞:栈道栏杆侧(崖体已由地形;这里挡外侧跌落——用高度差即可,不加碰撞)
  return { group: g };
}

function buildWalkway(parent, mats, { x0, x1, z0, z1, y }) {
  const w = x1 - x0;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, z1 - z0), mats.wood);
  deck.position.set((x0 + x1) / 2, y - 0.12, (z0 + z1) / 2);
  deck.receiveShadow = true; deck.castShadow = true;
  parent.add(deck);
  const railX = x1 - 0.2;
  const nPost = Math.round((z1 - z0) / 3);
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), mats.redPaint, nPost);
  const _m = new THREE.Matrix4();
  for (let i = 0; i < nPost; i++) {
    _m.identity();
    _m.setPosition(railX, y + 0.5, z0 + (i + 0.5) * ((z1 - z0) / nPost));
    posts.setMatrixAt(i, _m);
  }
  posts.castShadow = true;
  parent.add(posts);
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, z1 - z0), mats.redPaint);
  hand.position.set(railX, y + 1.02, (z0 + z1) / 2);
  parent.add(hand);
}

// 小殿(贴崖:石基 + 红墙木构 + 灰瓦顶 + 可选三教像)
function smallHall(parent, mats, { x, z, w, d, h, y, lanterns = false, threeStatues = false }) {
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.5, d + 1.2), mats.stone);
  base.position.set(x, y + 0.25, z);
  base.castShadow = true; base.receiveShadow = true;
  grp.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.redPaint);
  body.position.set(x, y + 0.5 + h / 2, z);
  body.castShadow = true; body.receiveShadow = true;
  grp.add(body);
  gableRoof(grp, mats, { x, y: y + 0.5 + h, z, w, d, h: 1.9, kind: 'grey', eaveOver: 1.0 });
  // 前檐柱
  const nCol = 3;
  for (let i = 0; i < nCol; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, h, 8), mats.redPaint);
    col.position.set(x + (i - (nCol - 1) / 2) * (w / nCol - 0.4), y + 0.5 + h / 2, z + d / 2 + 0.3);
    col.castShadow = true;
    grp.add(col);
  }
  // 三教像(三尊抽象坐像)
  if (threeStatues) {
    for (let i = 0; i < 3; i++) {
      const st = new THREE.Group();
      const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.3, 10), mats.gold);
      robe.position.y = 0.65;
      st.add(robe);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), i === 1 ? mats.stoneDark : mats.gold);
      head.position.y = 1.5;
      st.add(head);
      st.position.set(x - 2 + i * 2, y + 0.6, z - d / 2 + 1.2);
      grp.add(st);
    }
  }
  // 灯笼
  if (lanterns) {
    for (const sgn of [-1, 1]) {
      const lant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 8), new THREE.MeshStandardMaterial({
        color: 0xe8562c, emissive: 0xff7030, emissiveIntensity: 1.8, roughness: 0.6,
      }));
      lant.position.set(x + sgn * (w / 2 + 0.4), y + 1.1, z + d / 2 + 0.5);
      grp.add(lant);
    }
  }
  parent.add(grp);
  return grp;
}
