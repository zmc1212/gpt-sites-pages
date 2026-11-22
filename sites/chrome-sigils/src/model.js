/* chrome-sigils — 笔画数据模型(距离场并集渲染)
 *
 * strokes[] 是唯一事实源;整个符记是一张由全部骨架点云融合出的
 * 「距离场并集网格」(交叉处光滑无缝)。任何增删改 → 重建管线:
 *   骨架缓存(按笔画)→ buildField → fieldToGeometry → 单 Mesh 换 geometry。
 * 宽度滑杆的连续调节走 scheduleRebuild 防抖,避免每帧重建。
 * fit(归一化取景)与撤销/重做、localStorage 持久化与本站约定一致。
 */
(function (global) {
  'use strict';

  var STORE_KEY = 'chrome-sigils-state-v1';

  function SigilModel(material) {
    this.root = new THREE.Group();          // 场景外层组(承担 fit 变换)
    this.inner = new THREE.Group();         // 模型空间
    this.root.add(this.inner);
    this.strokes = [];                      // {id, pts, width, closed, mirrorOf, skeleton, _committedWidth}
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    this.inner.add(this.mesh);
    this.material = material;
    this.selectedId = null;
    this._nextId = 1;
    this._undoStack = [];
    this._redoStack = [];
    this._fit = { scale: 1, x: 0, y: 0 };
    this._anim = { scale: 1, x: 0, y: 0 };
    this._rebuildTimer = 0;
    this.onChange = null;
  }

  // ---------- 重建管线 ----------
  SigilModel.prototype._allSkeletonPoints = function () {
    var pts = [];
    var SEP = { x: 0, y: 0, r: -1 }; // 笔画分隔标记:距离场不跨笔画连段
    for (var i = 0; i < this.strokes.length; i++) {
      var s = this.strokes[i];
      if (!s.skeleton) s.skeleton = SigilGeom.buildSkeleton(s.pts, s.width, s.closed);
      for (var k = 0; k < s.skeleton.length; k++) pts.push(s.skeleton[k]);
      pts.push(SEP);
      if (s.mirrorOf) {
        for (k = 0; k < s.skeleton.length; k++) {
          var p = s.skeleton[k];
          pts.push({ x: -p.x, y: p.y, r: p.r });
        }
        pts.push(SEP);
      }
    }
    return pts;
  };

  SigilModel.prototype.rebuild = function () {
    if (this._rebuildTimer) { clearTimeout(this._rebuildTimer); this._rebuildTimer = 0; }
    var skel = this._allSkeletonPoints();
    var old = this.mesh.geometry;
    if (old) old.dispose();
    if (!skel.length) {
      this.mesh.geometry = new THREE.BufferGeometry();
    } else {
      var field = SigilGeom.buildField(skel);
      this.mesh.geometry = SigilGeom.fieldToGeometry(field);
    }
    this.refit();
  };

  /* 防抖重建:滑杆连续调节用;结构操作直接 rebuild() */
  SigilModel.prototype.scheduleRebuild = function () {
    var self = this;
    if (this._rebuildTimer) return;
    this._rebuildTimer = setTimeout(function () {
      self._rebuildTimer = 0;
      self.rebuild();
    }, 45);
  };

  // ---------- 增删改 ----------
  SigilModel.prototype._invalidateSkeleton = function (stroke) {
    stroke.skeleton = null;
  };

  SigilModel.prototype.addStroke = function (pts, width, closed, symmetric) {
    if (!pts.length) return null;
    var stroke = {
      id: this._nextId++,
      pts: pts.map(function (p) { return { x: p.x, y: p.y }; }),
      width: width,
      closed: !!closed,
      mirrorOf: symmetric ? 'x' : null,
      skeleton: null
    };
    stroke._committedWidth = width;
    this.strokes.push(stroke);
    this._pushHistory({ type: 'add', stroke: stroke });
    this.rebuild();
    this._save();
    return stroke;
  };

  SigilModel.prototype._removeById = function (id) {
    var idx = this.strokes.findIndex(function (s) { return s.id === id; });
    if (idx < 0) return null;
    var stroke = this.strokes[idx];
    this.strokes.splice(idx, 1);
    return stroke;
  };

  SigilModel.prototype._insertStroke = function (stroke) {
    this.strokes.push(stroke);
  };

  SigilModel.prototype.deleteStroke = function (id) {
    var stroke = this._removeById(id);
    if (!stroke) return;
    if (this.selectedId === id) this.selectedId = null;
    this._pushHistory({ type: 'del', stroke: stroke });
    this.rebuild();
    this._save();
  };

  SigilModel.prototype.setStrokeWidth = function (id, width) {
    var stroke = this.strokes.find(function (s) { return s.id === id; });
    if (!stroke || stroke.width === width) return;
    var from = stroke._committedWidth !== undefined ? stroke._committedWidth : stroke.width;
    stroke.width = width;
    stroke._committedWidth = width;
    this._invalidateSkeleton(stroke);
    this._pushHistory({ type: 'width', id: id, from: from, to: width });
    this.rebuild();
    this._save();
  };

  /* 滑杆拖动中的静默改宽:防抖重建,不进历史、不重取景跳动 */
  SigilModel.prototype.setStrokeWidthQuiet = function (id, width) {
    var stroke = this.strokes.find(function (s) { return s.id === id; });
    if (!stroke || stroke.width === width) return;
    stroke.width = width;
    this._invalidateSkeleton(stroke);
    this.scheduleRebuild();
    this._save();
    this._emit();
  };

  /* 松手提交:以最近一次提交值为 from 记一步历史 */
  SigilModel.prototype.commitWidthHistory = function (id, width) {
    var stroke = this.strokes.find(function (s) { return s.id === id; });
    if (!stroke) return;
    var from = stroke._committedWidth !== undefined ? stroke._committedWidth : stroke.width;
    stroke._committedWidth = width;
    if (from === width) return;
    this._undoStack.push({ type: 'width', id: id, from: from, to: width });
    if (this._undoStack.length > 60) this._undoStack.shift();
    this._redoStack.length = 0;
    this.rebuild();
    this._emit();
  };

  SigilModel.prototype.setSymmetry = function (id, symmetric) {
    var stroke = this.strokes.find(function (s) { return s.id === id; });
    if (!stroke) return;
    stroke.mirrorOf = symmetric ? 'x' : null;
    this.rebuild();
    this._save();
    this._emit();
  };

  SigilModel.prototype.clear = function () {
    if (!this.strokes.length) return;
    var removed = this.strokes.slice();
    this.strokes = [];
    this.selectedId = null;
    this._pushHistory({ type: 'clear', strokes: removed });
    this.rebuild();
    this._save();
  };

  // ---------- 撤销 / 重做 ----------
  SigilModel.prototype._pushHistory = function (action) {
    this._undoStack.push(action);
    if (this._undoStack.length > 60) this._undoStack.shift();
    this._redoStack.length = 0;
    this._emit();
  };

  SigilModel.prototype.undo = function () {
    var a = this._undoStack.pop();
    if (!a) return;
    if (a.type === 'add') this._removeById(a.stroke.id);
    else if (a.type === 'del') this._insertStroke(a.stroke);
    else if (a.type === 'clear') { var self = this; a.strokes.forEach(function (s) { self._insertStroke(s); }); }
    else if (a.type === 'width') {
      var s = this.strokes.find(function (x) { return x.id === a.id; });
      if (s) { s.width = a.from; s._committedWidth = a.from; this._invalidateSkeleton(s); }
    }
    this._redoStack.push(a);
    if (this.selectedId && !this.strokes.some(function (x) { return x.id === this.selectedId; }, this)) {
      this.selectedId = null;
    }
    this.rebuild(); this._save(); this._emit();
  };

  SigilModel.prototype.redo = function () {
    var a = this._redoStack.pop();
    if (!a) return;
    if (a.type === 'add') this._insertStroke(a.stroke);
    else if (a.type === 'del') this._removeById(a.stroke.id);
    else if (a.type === 'clear') {
      var self = this;
      this.strokes.slice().forEach(function (s) { /* 已在 clear 时移除 */ });
      this.strokes = [];
    }
    else if (a.type === 'width') {
      var s = this.strokes.find(function (x) { return x.id === a.id; });
      if (s) { s.width = a.to; s._committedWidth = a.to; this._invalidateSkeleton(s); }
    }
    this._undoStack.push(a);
    this.rebuild(); this._save(); this._emit();
  };

  SigilModel.prototype.canUndo = function () { return this._undoStack.length > 0; };
  SigilModel.prototype.canRedo = function () { return this._redoStack.length > 0; };

  // ---------- 归一化取景 ----------
  SigilModel.prototype.refit = function () {
    var geo = this.mesh.geometry;
    var box = new THREE.Box3();
    if (geo && geo.boundingBox && geo.attributes.position && geo.attributes.position.count > 0) {
      box.copy(geo.boundingBox);
    } else {
      geo.computeBoundingBox();
      if (geo.boundingBox && !geo.boundingBox.isEmpty()) box.copy(geo.boundingBox);
    }
    if (box.isEmpty()) { this._fit = { scale: 1, x: 0, y: 0 }; return; }
    var size = new THREE.Vector3(); box.getSize(size);
    var center = new THREE.Vector3(); box.getCenter(center);
    var maxDim = Math.max(size.x, size.y, 1e-6);
    var scale = 2.0 / maxDim;
    this._fit = { scale: scale, x: -center.x * scale, y: -center.y * scale };
  };

  SigilModel.prototype.tick = function (dt) {
    var k = 1 - Math.pow(0.0018, dt);
    var a = this._anim, f = this._fit;
    a.scale += (f.scale - a.scale) * k;
    a.x += (f.x - a.x) * k;
    a.y += (f.y - a.y) * k;
    this.root.scale.setScalar(a.scale);
    this.root.position.set(a.x, a.y, 0);
  };

  // ---------- 材质 / 选中 ----------
  SigilModel.prototype.setMaterial = function (mat) {
    this.material = mat;
    this.mesh.material = mat;
  };

  SigilModel.prototype.select = function (id) {
    this.selectedId = id;
    this._emit();
  };

  // ---------- 预设装载(不入历史,替换当前全部) ----------
  SigilModel.prototype.loadPreset = function (list, width) {
    this.clearAllQuiet();
    var self = this;
    list.forEach(function (d) {
      var stroke = {
        id: self._nextId++,
        pts: d.pts.map(function (p) { return { x: p.x, y: p.y }; }),
        width: d.width || width || 0.16,
        closed: !!d.closed,
        mirrorOf: null,
        skeleton: null
      };
      stroke._committedWidth = stroke.width;
      self.strokes.push(stroke);
    });
    this._undoStack.length = 0;
    this._redoStack.length = 0;
    this.rebuild();
    this._anim = { scale: this._fit.scale, x: this._fit.x, y: this._fit.y };
    this._emit();
  };

  SigilModel.prototype.clearAllQuiet = function () {
    this.strokes = [];
    this.selectedId = null;
  };

  // ---------- 持久化 ----------
  SigilModel.prototype._save = function () {
    try {
      var data = {
        strokes: this.strokes.map(function (s) {
          return { pts: s.pts, width: s.width, closed: s.closed, mirrorOf: s.mirrorOf };
        })
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) { /* file:// 某些浏览器禁 localStorage:静默降级 */ }
  };

  SigilModel.prototype.restore = function () {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.strokes || !data.strokes.length) return false;
      var self = this;
      data.strokes.forEach(function (d) {
        if (!d.pts || !d.pts.length) return;
        var stroke = {
          id: self._nextId++,
          pts: d.pts,
          width: d.width || 0.16,
          closed: !!d.closed,
          mirrorOf: d.mirrorOf || null,
          skeleton: null
        };
        stroke._committedWidth = stroke.width;
        self.strokes.push(stroke);
      });
      this.rebuild();
      this._anim = { scale: this._fit.scale, x: this._fit.x, y: this._fit.y };
      this._emit();
      return this.strokes.length > 0;
    } catch (e) { return false; }
  };

  SigilModel.prototype._emit = function () {
    if (this.onChange) this.onChange(this);
  };

  global.SigilModel = SigilModel;
})(window);
