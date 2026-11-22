// 轨道相机：目标点(本地米制) + 距离 + 高度角 + 方位角。hash 与原站同语义（角度为弧度）。
import * as THREE from 'three';
import { project, unproject, writeHash, clamp } from './geo.js';

const EL_MIN = 0.12, EL_MAX = 1.52, D_MIN = 16, D_MAX = 2600;

export class OrbitCam {
  constructor(camera, dom, bounds) {
    this.cam = camera;
    this.dom = dom;
    this.bounds = bounds; // 数据范围（本地米制）用于钳制目标点
    this.target = { x: 0, y: 0 };
    this.dist = 160;
    this.el = 0.5;   // 高度角
    this.az = 0.6;   // 方位角
    this.targetScene = new THREE.Vector3();
    // 惯性
    this.vAz = 0; this.vEl = 0; this.vPan = { x: 0, y: 0 };
    this.vDist = 0;
    this._hashTimer = 0;
    this.onChange = null;
    this.onSettle = null;
    this.enabled = true;
    this.flight = null;

    this._bind();
  }

  setState(lat, lon, dist, el, az) {
    const [x, y] = project(lat, lon);
    this.target.x = x; this.target.y = y;
    if (Number.isFinite(dist)) this.dist = clamp(dist, D_MIN, D_MAX);
    if (Number.isFinite(el)) this.el = clamp(el, EL_MIN, EL_MAX);
    if (Number.isFinite(az)) this.az = az;
    this._sync(true);
  }

  flyTo(x, y, dist, el, az, ms = 850) {
    this.flight = {
      t0: performance.now(), ms,
      from: { x: this.target.x, y: this.target.y, dist: this.dist, el: this.el, az: this.az },
      to: {
        x, y,
        dist: dist ?? this.dist,
        el: clamp(el ?? this.el, EL_MIN, EL_MAX),
        az: az ?? this.az,
      },
    };
  }

  _sync(force) {
    const cos = Math.cos(this.el), sin = Math.sin(this.el);
    const cx = this.target.x + this.dist * cos * Math.sin(this.az);
    const cy = this.target.y + this.dist * cos * Math.cos(this.az);
    const h = this.dist * sin;
    this.cam.position.set(cx, h, -cy);
    this.targetScene.set(this.target.x, 0, -this.target.y);
    this.cam.lookAt(this.targetScene);
    if (this.onChange) this.onChange();
    const now = performance.now();
    if (force || now - this._hashTimer > 400) {
      this._hashTimer = now;
      const [lat, lon] = unproject(this.target.x, this.target.y);
      writeHash(lat, lon, this.dist, this.el, this.az);
    }
  }

  _clampTarget() {
    const [x0, y0, x1, y1] = this.bounds;
    this.target.x = clamp(this.target.x, x0, x1);
    this.target.y = clamp(this.target.y, y0, y1);
  }

  _bind() {
    const dom = this.dom;
    const pointers = new Map();
    let last = null;
    let moved = 0;
    let downBtn = -1;

    const pinch = () => {
      const [a, b] = [...pointers.values()];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    };

    dom.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      try { dom.setPointerCapture(e.pointerId); } catch { /* 合成事件可能无 pointerId */ }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      downBtn = e.button;
      moved = 0;
      this.flight = null;
      if (pointers.size === 1) last = { x: e.clientX, y: e.clientY, btn: e.button };
      else if (pointers.size === 2) last = { ...pinch(), btn: -2 };
    });
    dom.addEventListener('pointermove', (e) => {
      if (!this.enabled || !pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && last && last.btn === -2) {
        const p = pinch();
        // 双指：平移 + 捏合缩放
        const k = -p.d / (last.d || 1);
        this.dist = clamp(this.dist * (1 + k * 0.06), D_MIN, D_MAX);
        this._panBy(p.cx - last.cx, p.cy - last.cy, true);
        last = { ...p, btn: -2 };
        moved += 10;
        this._sync();
        return;
      }
      if (!last) return;
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      if (last.btn === 2 || last.btn === 1) { // 右键/中键平移
        this._panBy(dx, dy, false);
        this.vPan.x = dx; this.vPan.y = dy;
      } else { // 左键旋转
        const k = 0.0052;
        this.az += dx * k;
        this.el = clamp(this.el - dy * k * 0.85, EL_MIN, EL_MAX);
        this.vAz = dx * k; this.vEl = dy * k * 0.85;
      }
      last.x = e.clientX; last.y = e.clientY;
      this._sync();
    });
    const up = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        if (moved < 6 && e.button === 2) { /* 右键单击不动作 */ }
        last = null;
      } else if (pointers.size === 1) {
        const [p] = [...pointers.values()];
        last = { x: p.x, y: p.y, btn: 0 };
      }
      if (this.onUp) this.onUp(e, moved);
    };
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); last = null; });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    dom.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.flight = null;
      const k = Math.exp(e.deltaY * 0.0012);
      this.dist = clamp(this.dist * k, D_MIN, D_MAX);
      this.vDist = 0;
      this._sync();
    }, { passive: false });

    dom.addEventListener('dblclick', (e) => {
      if (!this.enabled) return;
      if (this.onDblClick) this.onDblClick(e);
    });
  }

  // 平移：屏幕位移 → 地面位移（随距离缩放，随方位角旋转）
  _panBy(dx, dy, touch) {
    const k = this.dist * 0.0016 * (touch ? 1.1 : 1);
    const s = Math.sin(this.az), c = Math.cos(this.az);
    this.target.x -= (dx * c - dy * s) * k;
    this.target.y -= (-dx * s - dy * c) * k * 1.0;
    this._clampTarget();
  }

  // 地面点 → 屏幕双击飞入
  groundAt(clientX, clientY, groundMeshes) {
    const r = this.dom.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.cam);
    const hit = ray.intersectObjects(groundMeshes, false)[0];
    return hit ? { x: hit.point.x, z: hit.point.z } : null;
  }

  // 每帧惯性 + 飞行
  update(dt) {
    if (this.flight) {
      const f = this.flight;
      let t = (performance.now() - f.t0) / f.ms;
      if (t >= 1) { t = 1; this.flight = null; }
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const L = f.from, R = f.to;
      // 方位角走最短弧
      let dAz = R.az - L.az;
      while (dAz > Math.PI) dAz -= Math.PI * 2;
      while (dAz < -Math.PI) dAz += Math.PI * 2;
      this.target.x = L.x + (R.x - L.x) * e;
      this.target.y = L.y + (R.y - L.y) * e;
      this.dist = L.dist + (R.dist - L.dist) * e;
      this.el = L.el + (R.el - L.el) * e;
      this.az = L.az + dAz * e;
      this._clampTarget();
      this._sync();
      return;
    }
    let dirty = false;
    if (Math.abs(this.vAz) > 0.01 || Math.abs(this.vEl) > 0.01) {
      this.az += this.vAz;
      this.el = clamp(this.el - this.vEl, EL_MIN, EL_MAX);
      this.vAz *= 0.9; this.vEl *= 0.9;
      dirty = true;
    }
    if (Math.abs(this.vPan.x) > 0.2 || Math.abs(this.vPan.y) > 0.2) {
      this._panBy(this.vPan.x, this.vPan.y, false);
      this.vPan.x *= 0.86; this.vPan.y *= 0.86;
      dirty = true;
    }
    if (dirty) this._sync();
    else if (this.onSettle && this._needsSettle) { this._needsSettle = false; this.onSettle(); }
  }
}
