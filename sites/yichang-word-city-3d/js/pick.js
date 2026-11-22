// 拾取：射线找建筑/道路 → 组装抽屉详情。选中建筑给地面描边。
import * as THREE from 'three';
import { descFor, BCLASS } from './words.js';

export class Picker {
  constructor(world) {
    this.world = world;
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.highlight = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xf2c27f, transparent: true, opacity: 0.9 })
    );
    this.highlight.visible = false;
    this.highlight.renderOrder = 5;
    world.scene.add(this.highlight);
    this.onPick = null;
    this.onHover = null;
    this._hoverT = 0;
  }

  _setNdc(e) {
    const r = this.world.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.world.camera3);
  }

  _targets() {
    const out = [];
    for (const t of this.world.tileMeshes.values()) {
      if (t.bMesh) out.push(t.bMesh);
      if (t.roofMesh) out.push(t.roofMesh);
      if (t.rMesh) out.push(t.rMesh);
    }
    return out;
  }

  _hitAt(e) {
    this._setNdc(e);
    const hits = this.ray.intersectObjects(this._targets(), false);
    if (!hits.length) return null;
    const h = hits[0];
    const mesh = h.object;
    const attr = mesh.geometry.getAttribute('bid') || mesh.geometry.getAttribute('rid');
    if (!attr) return null;
    const idx = attr.getX(h.face.a);
    const kind = mesh.geometry.getAttribute('bid') ? 'b' : 'r';
    const owner = kind === 'b' ? mesh.userData.buildings[idx] : mesh.userData.roads[idx];
    return { kind, owner, idx, tileKey: mesh.userData.tileKey || '', mesh, dist: h.distance, point: h.point };
  }

  // 单击：开抽屉
  click(e) {
    const hit = this._hitAt(e);
    if (!hit) { this._clear(); return null; }
    if (hit.kind === 'b') this._markBuilding(hit.owner);
    else this._clear();
    return this.detailOf(hit);
  }

  // 悬停提示（节流；大网格下射线扫描不便宜）
  hover(e) {
    const now = performance.now();
    if (now - this._hoverT < 140) return;
    this._hoverT = now;
    const hit = this._hitAt(e);
    if (!hit) return this.onHover && this.onHover(null);
    const o = hit.owner;
    if (hit.kind === 'b') {
      this.onHover && this.onHover({
        kind: '建筑',
        title: o.n || (o.s && o.s[0]) || BCLASS[o.t] || '建筑',
        sub: o.n && o.s && o.s[0] ? o.s[0] : `${Math.round(o.h)}m · ${BCLASS[o.t] || ''}`,
      });
    } else {
      this.onHover && this.onHover({
        kind: '道路',
        title: o.n || '巷道',
        sub: `${Math.round(o.w)}m 宽`,
      });
    }
  }

  // hit: {kind:'b'|'r', owner, idx, tileKey}
  // owner 形状有两种来源（瓦片数据 b[i]/r[i] 与拾取网格 buildings[i]/roads[i]），此处统一读字段。
  detailOf(hit) {
    const { kind, owner, idx, tileKey } = hit;
    const W = this.world;
    if (kind === 'b') {
      const ring = owner.ring || owner.p;
      const list = W.words.wordsOf(0, tileKey, idx);
      const wordCards = list.map((l) => ({
        t: l.text, c: l.cat, d: descFor(l.cat, l.text),
      }));
      const town = W.nearestTown(ring);
      return {
        kind: '建筑',
        title: owner.n || (owner.s && owner.s[0]) || '无名的楼',
        sub: `${town.n} · ${BCLASS[owner.t] || '建筑'}`,
        kv: [
          ['高度', `${owner.h.toFixed(1)} m`],
          ['层数', `约 ${Math.max(1, Math.round(owner.h / 3.2))} 层`],
          ['占地', `${W.footprintArea(ring).toFixed(0)} m²`],
        ],
        signs: owner.s || [],
        words: wordCards,
        wordPos: list.length ? { x: list[0].geoX, y: list[0].geoY } : null,
        pos: ring[Math.floor(ring.length / 2)],
      };
    }
    const list = W.words.wordsOf(1, tileKey, idx);
    let len = 0;
    const p = owner.p;
    for (let i = 1; i < p.length; i++) len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    return {
      kind: '道路',
      title: owner.n || (owner.k === 12 ? '汽渡线' : '巷道'),
      sub: W.roadKindName(owner.k),
      kv: [
        ['宽度', `${owner.w.toFixed(1)} m`],
        ['这一段', `${len.toFixed(0)} m`],
      ],
      signs: [],
      words: list.map((l) => ({ t: l.text, c: l.cat, d: descFor(l.cat, l.text) })),
      wordPos: list.length ? { x: list[0].geoX, y: list[0].geoY } : null,
      pos: p[Math.floor(p.length / 2)],
    };
  }

  _markBuilding(owner) {
    const ring = owner.ring;
    const pts = [];
    for (let i = 0; i < ring.length - 1; i++) pts.push(ring[i][0], 0.2, -ring[i][1]);
    this.highlight.geometry.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.highlight.geometry = g;
    this.highlight.computeLineDistances?.();
    this.highlight.visible = true;
  }

  _clear() { this.highlight.visible = false; }
}
