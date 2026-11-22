// 词标签系统（v2）：屏幕空间覆盖层 —— 与原站一致，词是「地图标注」式渲染，
// 远近恒定像素大小，铺满城市且始终可读。分层看仍用世界空间成层。
// 全部描写句为本站原创写作（与原站的 AI 言语化文本无关），{w} 为词本身。
import * as THREE from 'three';
import { wordTexture } from './textures.js';

// 每个意义类的描写句模板（宜昌版，原创写作）——汽渡、船闸、滨江合唱、萝卜饺子
export const DESC = [
  ['{w}被过早的人流磨得发亮，辣椒油还嵌在砖缝里。', '{w}的砖缝里积着昨夜的雨，走过去的人把水声留在了身后。', '{w}不说话，只是把每一步都接住，再还给天空一点回声。', '有人蹲在{w}旁端着一碗小面，影子先一步过了马路。', '{w}把白天的脚步收进夜里，夜里的江风又把它们一条条放出来。', '{w}斜过路口，像一句写到一半被踩住的句子。'],
  ['{w}守在江堤上，看惯了汽渡来来去去。', '{w}被摸得比门把手还亮，像是这条街默认的守夜人。', '滨江公园的{w}身上缠满了风筝线，撕掉一层还有一层。', '{w}在午后打盹，偶尔被一只麻雀借走一分钟的阴影。', '{w}记得每一个按过它的人，但从不记名字。'],
  ['{w}在卷帘门拉下的那一刻仍然醒着，替店主守到最后一位客人。', '{w}朝着街角喊话，把今天也喊成了特价。', '{w}的边角被江风掀起来，像一本被翻旧的账簿。', '晚上{w}亮起来，二马路的人声就顺着它往上爬。'],
  ['{w}把老巷围出一小片工地，也围出一段停下来的日子。', '{w}后面有人敲敲打打，敲出来的节奏比船闸的闸门还有耐心。', '老厂区改造推着{w}往前走，走一步，回头看一眼。', '{w}拦住的是路，拦不住的是探头张望的好奇。'],
  ['{w}记得每年夏天涨水的刻度。', '{w}把天光折成两半，一半给葛洲坝，一半给过江的人。', '冬泳的人从{w}边下水，把长江游成家门口的泳池。', '汛期一到，{w}就成了这条街最要紧的告示。', '{w}里映着半个坝影，另半个在上游继续亮。'],
  ['{w}从江面掠过，桥墩替它记着方向。', '{w}在江滩的芦苇里过冬，把渡口当成自己的领地。', '{w}看人，人也看它，谁也不肯先眨眼。', '清晨的{w}比闹钟更早醒来，替整条江报晓。'],
  ['{w}一到晚上就把两岸点亮，江水替它调色。', '{w}把影子压得很短，行人各自领走一段。', '大坝的{w}一排排亮着，像给长江系上一条灯带。', '对岸的{w}倒进江水里，被汽渡的浪揉碎又拼好。'],
  ['{w}前站着三种等待：赶汽渡的、不赶的、和已经忘记要过哪条江的。', '过闸的船在{w}前排着队，把耐心交给闸门慢慢放行。', '{w}亮起的那三秒，整条街都学会了安静。', '过江的人从{w}前走过，江风替他们翻衣领。'],
  ['{w}的香气顺着巷口钻出来，把过早的队伍又拉长了一截。', '{w}不排队，却让每个人都站了一会儿。', '{w}和热气、油炸香搅在一起，成了这条街的底色。', '一碗{w}下肚，宜昌的一天才算真正开始。'],
  ['{w}隔着江传过来，到耳朵里只剩轮廓。', '{w}比钟表还准，它响的时候，两岸开始换气。', '傍晚的滨江公园，{w}把散步的人都唱进同一个调子里。', '江面上{w}一声，闸下的浪就替它应一句。'],
  ['{w}用最小的字说了最要紧的事——水位涨了，可惜风从不认真读。', '{w}被太阳晒得发白，字还倔强地立在那里。', '江边的{w}刻着两千年前的句子，念出来还是滚烫。', '{w}指着相反的两个方向，都写着「由此去」。'],
  ['{w}比巷子还窄，却装得下整条老街的下午。', '{w}里晾着别人家的衣裳，江风吹过来就都摇一摇。', '{w}在两栋楼的夹缝里，替宜昌保管没人要的安静。', '夏夜{w}摆出来，一条街都睡在星星底下。'],
];

export const descFor = (cat, text) => {
  const pool = DESC[cat] || DESC[0];
  let h = 2166136261;
  for (const ch of text) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return pool[(h >>> 0) % pool.length].replaceAll('{w}', text);
};

export const BCLASS = ['普通建筑', '公寓', '商铺', '办公楼', '公共设施', '厂房仓库', '附属小屋', '寺庙教堂'];

const GEO = new THREE.PlaneGeometry(1, 1);
GEO.translate(0, 0.5, 0); // 锚点在底边

// 屏幕空间字号（px）：编号最小，路词中等，墙面词醒目
const PX = { id: 9, road: 12, wall: 14 };
const isIdWord = (t) => /^bldg_\d+$/.test(t) || /^\d+层$/.test(t);

// 一个词的实例。entry = [x, y, kind, ownerIdx, cat, text]
class Label {
  constructor(entry, tileData, tileKey, colors) {
    const [x, y, kind, ownerIdx, cat, text] = entry;
    this.tileKey = tileKey;
    this.kind = kind;           // 0 墙面 / 1 路面
    this.ownerIdx = ownerIdx;
    this.geo = kind === 0 ? tileData.b[ownerIdx] : tileData.r[ownerIdx];
    this.cat = cat;
    this.text = text;
    this.geoX = x;
    this.geoY = y;
    this.color = colors[cat] || '#f2c27f';
    this.mesh = null;
    this._d = 1e9;
    this._anchor = null; // {x, y, z} 场景坐标（墙面/路面两种）
  }

  // 锚点：墙面贴最长立面外浮，路面就在路上；俯瞰读时墙面词落到楼脚
  _computeAnchor() {
    if (this.kind === 0) {
      const ring = this.geo.p;
      let best = 0, bi = 0;
      for (let i = 0; i < ring.length - 1; i++) {
        const d = Math.hypot(ring[i + 1][0] - ring[i][0], ring[i + 1][1] - ring[i][1]);
        if (d > best) { best = d; bi = i; }
      }
      const [ax, ay] = ring[bi], [bx, by] = ring[bi + 1];
      const dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len;
      let cx = 0, cy = 0;
      for (const p of ring) { cx += p[0]; cy += p[1]; }
      cx /= ring.length; cy /= ring.length;
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
      const h = this.geo.h || 8;
      if (this._readOn) {
        const off = 1.5 + Math.min(h * 0.6, 9);
        this._anchor = { x: mx + nx * off, y: 0.3, z: -(my + ny * off), rotY: Math.atan2(-dy, dx) };
      } else {
        this._anchor = { x: mx + nx * 0.6, y: Math.min(h * 0.45, 12), z: -(my + ny * 0.6), rotY: Math.atan2(-dy, dx) };
      }
    } else {
      const road = this.geo;
      const [x, y] = [this.geoX, this.geoY];
      this._anchor = { x, y: 0.16, z: -y, rotY: 0 };
    }
    return this._anchor;
  }

  _make() {
    const { tex, aspect } = wordTexture(this.text, this.color, this.kind === 1);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthTest: false, depthWrite: false,
      side: THREE.DoubleSide, toneMapped: false,
    });
    this.mesh = new THREE.Mesh(GEO, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    this.aspect = aspect;
  }
}

// 管理器：世界空间组（分层看用）+ 屏幕空间覆盖组（常态用）
export class WordLayer {
  constructor(scene) {
    this.scene = scene;
    this.labels = [];
    this.catOn = new Array(12).fill(true);
    this.limit = 1300;
    this.range = 650;
    this.worldGroup = new THREE.Group(); // 分层看的漂浮层
    this.worldGroup.name = 'words-world';
    this.overlayGroup = new THREE.Group(); // 屏幕空间标注层
    this.overlayGroup.name = 'words-overlay';
    scene.add(this.worldGroup);
    scene.add(this.overlayGroup);
    this._v = new THREE.Vector3();
    this._cells = new Set(); // 标注碰撞网格
    this._px = { id: PX.id, road: PX.road, wall: PX.wall };
  }

  addTile(tileKey, data, colors) {
    for (const w of data.w) {
      const owner = w[2] === 0 ? data.b[w[3]] : data.r[w[3]];
      if (!owner) continue;
      this.labels.push(new Label(w, data, tileKey, colors));
    }
  }

  removeTile(tileKey) {
    for (const l of this.labels) {
      if (l.tileKey === tileKey && l.mesh) {
        l.mesh.parent?.remove(l.mesh);
        l.mesh.material.dispose();
      }
    }
    this.labels = this.labels.filter((l) => l.tileKey !== tileKey);
  }

  setCat(cat, on) { this.catOn[cat] = on; }

  _basePx(l) {
    if (l.kind === 1) return this._px.road;
    return isIdWord(l.text) ? this._px.id : this._px.wall;
  }

  // 每帧：cam3 透视相机、orbit（目标点用于距离排序）、W/H 视口像素
  update(cam3, orbit, W, H, modes) {
    const cx = orbit.target.x, cz = orbit.target.y;
    const cand = [];
    for (const l of this.labels) {
      if (l._readOn !== modes.read) { l._readOn = modes.read; l._anchor = null; }
      if (!l._anchor) l._computeAnchor();
      const d = Math.hypot(l.geoX - cx, l.geoY - cz);
      l._d = d;
      if (d < this.range && this.catOn[l.cat]) cand.push(l);
    }
    cand.sort((a, b) => a._d - b._d);

    // 屏幕空间放置：碰撞避让（细网格 + 中心格占位），只给放下的词建网格
    this._cells.clear();
    let placed = 0;
    const v = this._v;
    const CELL = 64, CELLH = 20;
    const placedSet = [];
    for (const l of cand) {
      if (placed >= this.limit) break;
      const a = l._anchor;
      v.set(a.x, a.y, a.z).project(cam3);
      if (v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) continue;
      const px = (v.x * 0.5 + 0.5) * W;
      const pyUp = (v.y * 0.5 + 0.5) * H;
      const hpx = this._basePx(l) * (1 + Math.max(0, 1 - l._d / 300) * 0.35);
      const wpx = hpx * l.aspect;
      // 只查中心格：允许边缘轻微贴靠，保证字海密度
      const key = Math.floor(px / CELL) + ',' + Math.floor(pyUp / CELLH);
      if (this._cells.has(key)) continue;
      this._cells.add(key);
      if (!l.mesh) l._make();
      const mesh = l.mesh;
      if (modes.layerMode) {
        if (mesh.parent !== this.worldGroup) this.worldGroup.add(mesh);
        mesh.position.set(a.x, 26 + l.cat * 34, a.z);
        mesh.rotation.set(0, Math.atan2(cam3.position.x - a.x, cam3.position.z - a.z), 0);
        const s = Math.min(10 + l._d * 0.02, 26);
        mesh.scale.set(s, s / l.aspect, 1);
      } else {
        if (mesh.parent !== this.overlayGroup) this.overlayGroup.add(mesh);
        mesh.position.set(px, pyUp - hpx / 2, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(wpx, hpx, 1);
      }
      mesh.visible = true;
      placedSet.push(l);
      placed++;
    }
    const activeSet = new Set(placedSet);
    for (const l of this.labels) {
      if (l.mesh && !activeSet.has(l)) l.mesh.visible = false;
    }
  }

  search(q) {
    const out = [];
    for (const l of this.labels) {
      if (!this.catOn[l.cat]) continue;
      if (l.text.includes(q)) out.push(l);
      if (out.length >= 60) break;
    }
    return out;
  }

  wordsOf(kind, tileKey, ownerIdx) {
    return this.labels.filter((l) => l.kind === kind && l.tileKey === tileKey && l.ownerIdx === ownerIdx);
  }
}
