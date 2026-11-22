// 瓦片几何构建：建筑（墙+顶，bid 顶点属性）、道路带（rid）、水面/绿地、招牌面片。
// 词之海 look：建筑用统一深色材质；素材之城 look：顶点色 + 颗粒纹理。通过换 material 实现。
import * as THREE from 'three';
import { ShapeUtils } from 'three';
import { grainTexture, signTexture, windowAtlasTexture } from './textures.js';

const BPALETTE = {
  0: [0xcabb9f, 0xbfb298, 0xd2c3a6, 0xb8ad96],   // 普通住宅（暖米）
  1: [0xc4bfb2, 0xd0c8b6],                        // 公寓
  2: [0xd6b98f, 0xc9a276, 0xdcc3a0],              // 商铺（暖褐）
  3: [0x9fb2cc, 0x8fa3bd, 0xaab8d2],              // 办公（冷蓝灰）
  4: [0xb0b8c2],                                  // 公共
  5: [0xa8a294],                                  // 厂房
  6: [0x8f8b7e],                                  // 小屋
  7: [0xc9b48c, 0xd0bd94],                        // 寺社
};
const ROOF = 0.34; // 顶面亮度系数（相乘后偏暗，符合夜景）

// 道路「光点线」配色与节距（原版的电路板气质）
const ROAD_GLOW = {
  0: { c: 0xff5a66, len: 3.4, w: 1.0, gap: 5.2 },  // 干线：红
  1: { c: 0xff5a66, len: 3.2, w: 0.95, gap: 5.2 }, // 大路：红
  2: { c: 0xffa63e, len: 2.8, w: 0.85, gap: 5.0 }, // 大道：橙
  3: { c: 0xffa63e, len: 2.5, w: 0.8, gap: 5.0 },  // 街道：橙
  4: { c: 0x56d85a, len: 2.2, w: 0.7, gap: 4.6 },  // 街巷：绿
  5: { c: 0x4fc8e8, len: 2.0, w: 0.7, gap: 4.6 },  // 步行街：青
  6: { c: 0x3aa0a8, len: 1.5, w: 0.5, gap: 4.2 },  // 小径：暗青
  7: { c: 0xd0d6df, len: 1.2, w: 0.6, gap: 2.2 },  // 台阶：密白
  8: { c: 0x4a5462, len: 1.6, w: 0.55, gap: 5.0 }, // 通道：灰
  9: { c: 0xb070ff, len: 2.8, w: 0.55, gap: 3.6 }, // 铁道：紫
  10: { c: 0x8ea2ff, len: 2.4, w: 0.5, gap: 3.8 }, // 轨道：蓝紫
  11: { c: 0x566475, len: 1.4, w: 0.45, gap: 5.0 },// 小路：暗灰
  12: { c: 0x7fe8f2, len: 3.8, w: 0.9, gap: 14 },  // 汽渡线：江面青点（江城标志）
};
const ROAD_COLOR = {
  0: 0x16181d, 1: 0x16181d, 2: 0x15171c, 3: 0x14161b,
  4: 0x121419, 5: 0x181b20, 6: 0x171a1f, 7: 0x20242a,
  8: 0x131519, 9: 0x101217, 10: 0x121318, 11: 0x121419, 12: 0x0a1a26,
};
const AREA_COLOR = { 0: 0x0c2036, 1: 0x111f10 }; // 长江：夜色里的深蓝缎带
const OUTLINE_COLOR = 0x3f8fc0; // 建筑全息轮廓

function mul32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function seedOf(s) { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// 常驻基础层（大江/大公园）网格：随 index 一起加载，保证长江从第一帧就在
export function buildAreasMesh(areas) {
  const pos = [], col = [];
  for (const a of areas) {
    const c = new THREE.Color(AREA_COLOR[a.k]);
    const n = a.p.length;
    const cont = a.p.slice(0, n - 1).map(([x, y]) => new THREE.Vector2(x, y));
    const tris = ShapeUtils.triangulateShape(cont, []);
    for (const [x, b2, c2] of tris) {
      for (const vi of [x, b2, c2]) {
        const [px, py] = a.p[vi];
        pos.push(px, a.k === 0 ? 0.03 : 0.025, -py);
        col.push(c.r, c.g, c.b);
      }
    }
  }
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true }));
  m.name = 'baseAreas';
  return m;
}

export function buildTile(data, colors12, tileKey = '') {
  const group = new THREE.Group();
  group.name = 'tile';
  const bPos = [], bCol = [], bBid = [], bUv = [];
  const fPos = [], fCol = [], fBid = []; // 屋顶（不用窗格 UV）
  const buildings = [];

  data.b.forEach((bt, i) => {
    const ring = bt.p;
    const rng = mul32(seedOf(String(bt.id ?? i)));
    const pal = BPALETTE[bt.t] || BPALETTE[0];
    const c = new THREE.Color(pal[Math.floor(rng() * pal.length)]);
    const roof = c.clone().multiplyScalar(ROOF);
    buildings.push({ ring, h: bt.h, t: bt.t, n: bt.n, s: bt.s, i });

    const n = ring.length;
    // 每栋楼自己的窗格相位（纹理一格 = 3m，整张铺 12m）
    const uo = rng() * 12, vo = rng() * 12;
    // 墙：每条边一个四边形（两个三角形），UV 采样亮窗图集
    for (let k = 0; k < n - 1; k++) {
      const [ax, ay] = ring[k], [bx, by] = ring[k + 1];
      const quad = [
        [ax, 0, -ay], [bx, 0, -by], [bx, bt.h, -by],
        [ax, 0, -ay], [bx, bt.h, -by], [ax, bt.h, -ay],
      ];
      for (const [x, y, z] of quad) {
        bPos.push(x, y, z);
        bCol.push(c.r, c.g, c.b);
        bBid.push(i);
        bUv.push((x + z + uo) / 12, (y + vo) / 12);
      }
    }
    // 顶：earcut 三角化 → 独立几何（平色，不叠窗）
    const cont = ring.slice(0, n - 1).map(([x, y]) => new THREE.Vector2(x, y));
    const tris = ShapeUtils.triangulateShape(cont, []);
    for (const [a, b2, c2] of tris) {
      for (const vi of [a, b2, c2]) {
        const [x, y] = ring[vi];
        fPos.push(x, bt.h, -y);
        fCol.push(roof.r, roof.g, roof.b);
        fBid.push(i);
      }
    }
  });

  let bMesh = null;
  if (bPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(bPos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(bCol, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(bUv, 2));
    g.setAttribute('bid', new THREE.Float32BufferAttribute(bBid, 1));
    g.computeVertexNormals();
    bMesh = new THREE.Mesh(g, null); // 材质由 world 按当前 look 赋
    bMesh.name = 'buildings';
    bMesh.userData.buildings = buildings;
    bMesh.userData.tileKey = tileKey;
    group.add(bMesh);
  }
  let roofMesh = null;
  if (fPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(fPos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(fCol, 3));
    g.setAttribute('bid', new THREE.Float32BufferAttribute(fBid, 1));
    g.computeVertexNormals();
    roofMesh = new THREE.Mesh(g, null);
    roofMesh.name = 'roofs';
    roofMesh.userData.buildings = buildings;
    roofMesh.userData.tileKey = tileKey;
    group.add(roofMesh);
  }

  // 建筑全息轮廓：底环 + 顶环 + 棱柱 + （高楼）楼圈线
  const oPos = [];
  const addRing = (ring, y) => {
    for (let k = 0; k < ring.length - 1; k++) {
      const [ax, ay] = ring[k], [bx, by] = ring[k + 1];
      oPos.push(ax, y, -ay, bx, y, -by);
    }
  };
  for (const bt of buildings) {
    const ring = bt.ring;
    const n = ring.length;
    addRing(ring, 0);
    addRing(ring, bt.h);
    for (let k = 0; k < n - 1; k++) {
      const [x, y] = ring[k];
      oPos.push(x, 0, -y, x, bt.h, -y);
    }
    if (bt.h > 14) { // 高层加楼圈线，维持原版那种「楼层密线」气质
      const floors = Math.min(6, Math.floor(bt.h / 6));
      for (let f = 1; f <= floors; f++) addRing(ring, (bt.h * f) / (floors + 1));
    }
  }
  let outline = null;
  if (oPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(oPos, 3));
    outline = new THREE.LineSegments(g, new THREE.LineBasicMaterial({
      color: OUTLINE_COLOR, transparent: true, opacity: 0.34,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    outline.name = 'outline';
    group.add(outline);
  }

  // 道路带
  const rPos = [], rCol = [], rRid = [];
  const roads = [];
  data.r.forEach((rd, i) => {
    roads.push({ p: rd.p, w: rd.w, k: rd.k, i });
    const c = new THREE.Color(ROAD_COLOR[rd.k] ?? 0x1a1d24);
    const hw = rd.w / 2;
    const pts = rd.p;
    const n = pts.length;
    const left = [], right = [];
    for (let k = 0; k < n; k++) {
      const [x, y] = pts[k];
      const [ax, ay] = pts[Math.max(0, k - 1)], [bx, by] = pts[Math.min(n - 1, k + 1)];
      let dx = bx - ax, dy = by - ay;
      const l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      left.push([x + -dy * hw, y + dx * hw]);
      right.push([x - -dy * hw, y - dx * hw]);
    }
    for (let k = 1; k < n; k++) {
      const quad = [
        [left[k - 1][0], left[k - 1][1]], [left[k][0], left[k][1]], [right[k][0], right[k][1]],
        [left[k - 1][0], left[k - 1][1]], [right[k][0], right[k][1]], [right[k - 1][0], right[k - 1][1]],
      ];
      for (const [x, y] of quad) {
        rPos.push(x, 0.045, -y);
        rCol.push(c.r, c.g, c.b);
        rRid.push(i);
      }
    }
  });
  let rMesh = null;
  if (rPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(rCol, 3));
    g.setAttribute('rid', new THREE.Float32BufferAttribute(rRid, 1));
    g.computeVertexNormals();
    rMesh = new THREE.Mesh(g, null);
    rMesh.name = 'roads';
    rMesh.userData.roads = roads;
    rMesh.userData.tileKey = tileKey;
    group.add(rMesh);
  }

  // 道路光点线：沿中心线撒彩色发光短块（电路板气质）
  const dPos = [], dCol = [];
  for (const rd of roads) {
    const glow = ROAD_GLOW[rd.k] || ROAD_GLOW[11];
    const c = new THREE.Color(glow.c);
    const pts = rd.p;
    let acc = glow.gap * 0.6; // 起步偏移
    for (let k = 1; k < pts.length; k++) {
      const [ax, ay] = pts[k - 1], [bx, by] = pts[k];
      const segLen = Math.hypot(bx - ax, by - ay);
      if (segLen < 0.01) continue;
      const dx = (bx - ax) / segLen, dy = (by - ay) / segLen;
      const ang = Math.atan2(-(by - ay), bx - ax);
      const ux = Math.cos(ang), uz = -Math.sin(ang); // 沿路向
      const vx = -uz, vy2 = ux;                      // 垂直向（宽）
      let t = acc;
      while (t < segLen) {
        const px = ax + dx * t, py = ay + dy * t;
        const hl = glow.len / 2, hw = glow.w / 2;
        // 小四边形（两三角），沿路向为长边
        const quad = [
          [px - ux * hl - vx * hw, py - uz * hl - vy2 * hw],
          [px + ux * hl - vx * hw, py + uz * hl - vy2 * hw],
          [px + ux * hl + vx * hw, py + uz * hl + vy2 * hw],
          [px - ux * hl - vx * hw, py - uz * hl - vy2 * hw],
          [px + ux * hl + vx * hw, py + uz * hl + vy2 * hw],
          [px - ux * hl + vx * hw, py - uz * hl + vy2 * hw],
        ];
        for (const [qx, qy] of quad) {
          dPos.push(qx, 0.09, -qy);
          dCol.push(c.r, c.g, c.b);
        }
        t += glow.gap;
      }
      acc = t - segLen;
    }
  }
  let dashMesh = null;
  if (dPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(dCol, 3));
    dashMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    dashMesh.name = 'dashes';
    dashMesh.renderOrder = 1;
    group.add(dashMesh);
  }

  // 水面 / 绿地
  const aPos = [], aCol = [];
  for (const a of data.a) {
    const c = new THREE.Color(AREA_COLOR[a.k]);
    const n = a.p.length;
    const cont = a.p.slice(0, n - 1).map(([x, y]) => new THREE.Vector2(x, y));
    const tris = ShapeUtils.triangulateShape(cont, []);
    for (const [x, b2, c2] of tris) {
      for (const vi of [x, b2, c2]) {
        const [px, py] = a.p[vi];
        aPos.push(px, a.k === 0 ? 0.03 : 0.025, -py);
        aCol.push(c.r, c.g, c.b);
      }
    }
  }
  if (aPos.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(aPos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(aCol, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true }));
    m.name = 'areas';
    group.add(m);
  }

  // 招牌（素材之城 look 才显示）：第 1 块贴立面横排，其余做竖向霓虹（垂直挑出）
  const signs = [];
  data.b.forEach((bt, i) => {
    if (!bt.s || !bt.s.length) return;
    const ring = bt.p;
    const edges = [];
    for (let k = 0; k < ring.length - 1; k++) {
      edges.push([k, Math.hypot(ring[k + 1][0] - ring[k][0], ring[k + 1][1] - ring[k][1])]);
    }
    edges.sort((a, b) => b[1] - a[1]);
    let cx = 0, cy = 0;
    for (const p of ring) { cx += p[0]; cy += p[1]; }
    cx /= ring.length; cy /= ring.length;
    const [bk, blen] = edges[0];
    const [bax, bay] = ring[bk], [bbx, bby] = ring[bk + 1];
    const bdx = bbx - bax, bdy = bby - bay;
    let bnx = -bdy / blen, bny = bdx / blen;
    const bmx = (bax + bbx) / 2, bmy = (bay + bby) / 2;
    if ((bmx - cx) * bnx + (bmy - cy) * bny < 0) { bnx = -bnx; bny = -bny; }
    const h = bt.h || 8;
    const take = Math.min(bt.s.length, 3);
    for (let s = 0; s < take; s++) {
      const text = bt.s[s];
      const tex = signTexture(text, seedOf(text) + i);
      const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      let mesh;
      if (s === 0) {
        // 横排：贴最长立面
        const sw = Math.min(Math.max(text.length * 1.15, 2.4), blen * 0.8, 12);
        const sh = Math.min(1.5, h * 0.3);
        const yy = Math.min(3.2, h - sh - 0.4);
        if (yy < 1) continue;
        mesh = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), mat);
        mesh.position.set(bmx + bnx * 0.16, yy, -(bmy + bny * 0.16));
        mesh.rotation.y = Math.atan2(-bdy, bdx);
      } else {
        // 竖向霓虹：从立面边角垂直挑出（街边店招的经典形态）
        const sh = Math.min(Math.max(text.length * 0.95, 2.2), h - 1.6);
        const sw = Math.min(1.1, blen * 0.4);
        const t = 0.25 + ((seedOf(text) >>> 8) % 100) / 100 * 0.5; // 沿立面位置
        const px = bax + bdx * t + bnx * 0.9;
        const py = bay + bdy * t + bny * 0.9;
        const yy = Math.min(1.4 + sh / 2, h - sh / 2 - 0.3);
        if (yy < 1.2) continue;
        mesh = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), mat);
        mesh.position.set(px, yy, -py);
        mesh.rotation.y = Math.atan2(-bdy, bdx) + Math.PI / 2;
      }
      mesh.visible = false;
      mesh.userData.bid = i;
      group.add(mesh);
      signs.push(mesh);
    }
  });

  const dispose = () => {
    for (const m of [bMesh, rMesh, roofMesh]) if (m) m.geometry.dispose();
    if (dashMesh) { dashMesh.geometry.dispose(); dashMesh.material.dispose(); }
    if (outline) { outline.geometry.dispose(); outline.material.dispose(); }
    for (const s of signs) { s.geometry.dispose(); s.material.dispose(); }
    group.traverse((o) => { if (o.isMesh && (o.name === 'areas')) o.geometry.dispose(); });
  };

  return { group, bMesh, roofMesh, rMesh, dashMesh, outline, signs, buildings, roads, dispose };
}

// look 材质
export function makeMaterials() {
  const grain = grainTexture();
  grain.repeat.set(1, 1);
  const matCity = new THREE.MeshBasicMaterial({ map: windowAtlasTexture(), vertexColors: true }); // 亮窗自发光
  const matRoof = new THREE.MeshLambertMaterial({ vertexColors: true, map: grain });
  const matSil = new THREE.MeshBasicMaterial({ color: 0x0e1119 });
  const matDim = new THREE.MeshBasicMaterial({ color: 0x090b10 }); // 俯瞰读：建筑压成暗底
  const roadCity = new THREE.MeshLambertMaterial({ vertexColors: true });
  const roadSil = new THREE.MeshBasicMaterial({ color: 0x14171d, vertexColors: false });
  return { matCity, matRoof, matSil, matDim, roadCity, roadSil };
}
