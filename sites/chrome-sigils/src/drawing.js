/* chrome-sigils — 绘制交互路由
 *
 * canvas 上所有指针事件由这里统一调度,互不打架:
 *   鼠标左键 / 触屏单指 / 笔尖  → 画笔画(实时管网格预览)
 *   鼠标右键 / 中键             → 轨道旋转
 *   触屏第二指落下              → 取消进行中的笔画,切「双指旋转 + 捏合缩放」
 *   滚轮                        → 缩放
 * 提交时:首尾接近 → 自动识别为闭合环;对称开 → 同步生成镜像笔画。
 * 视角太侧(视线与绘制平面夹角过小)时拒绝起笔,避免采样畸变。
 */
(function (global) {
  'use strict';

  function DrawingRouter(model, camera, orbit, canvas, opts) {
    opts = opts || {};
    var self = this;
    this.model = model;
    this.camera = camera;
    this.orbit = orbit;
    this.canvas = canvas;
    this.strokeWidth = opts.strokeWidth || 0.16;
    this.symmetry = !!opts.symmetry;
    this.onStrokeCommit = opts.onStrokeCommit || function () {};
    this.onSelectionChange = opts.onSelectionChange || function () {};
    this.onSymmetryHint = opts.onSymmetryHint || function () {};

    this._pointers = new Map();   // pointerId → {x, y}
    this._mode = null;            // 'draw' | 'orbit' | 'pinch'
    this._raw = [];               // 进行中笔画的原始点(模型坐标)
    this._preview = null;         // {mesh, mirrorMesh}
    this._downXY = null;
    this._moved = false;
    this._pinchD0 = 0;
    this._raf = 0;

    this._plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this._ray = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();

    canvas.addEventListener('pointerdown', function (e) { self._down(e); });
    canvas.addEventListener('pointermove', function (e) { self._move(e); });
    canvas.addEventListener('pointerup', function (e) { self._up(e); });
    canvas.addEventListener('pointercancel', function (e) { self._up(e, true); });
    canvas.addEventListener('wheel', function (e) {
      var dy = e.deltaY * (e.deltaMode === 1 ? 18 : 1);
      self.orbit.zoomBy(1 + dy * 0.0011);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // ---------- 坐标换算 ----------
  DrawingRouter.prototype._toModel = function (clientX, clientY) {
    var rect = this.canvas.getBoundingClientRect();
    this._ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this._ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this._ray.setFromCamera(this._ndc, this.camera);
    var hit = new THREE.Vector3();
    if (!this._ray.ray.intersectPlane(this._plane, hit)) return null;
    // 世界 → 模型坐标(root 只做 x/y 平移与等比缩放,z 恒 0)
    var root = this.model.root;
    return {
      x: (hit.x - root.position.x) / root.scale.x,
      y: (hit.y - root.position.y) / root.scale.y
    };
  };

  DrawingRouter.prototype._viewFacing = function () {
    // 视线与绘制平面法线的夹角余弦:太侧时起笔会严重畸变
    var dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return Math.abs(dir.dot(this._plane.normal));
  };

  // ---------- 指针事件 ----------
  DrawingRouter.prototype._down = function (e) {
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType, button: e.button });
    this.orbit.nudge();
    try { this.canvas.setPointerCapture(e.pointerId); } catch (err) { /* 无碍 */ }

    if (this._pointers.size === 2) {
      // 第二指落下:终止绘制,进入双指视角模式
      this._cancelStroke();
      var arr = Array.from(this._pointers.values());
      this._pinchD0 = Math.max(20, Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y));
      this._mode = 'pinch';
      this.orbit.beginDrag();
      return;
    }
    if (this._pointers.size > 2) return;

    if (e.pointerType === 'mouse' && e.button !== 0) {
      this._mode = 'orbit';
      this.orbit.beginDrag();
      return;
    }

    // 起笔:先试选择,若按住拖动则转为新笔画
    this._mode = 'draw';
    this._downXY = { x: e.clientX, y: e.clientY };
    this._moved = false;
    this._pendingSelect = null;
    var p = this._toModel(e.clientX, e.clientY);
    if (!p || this._viewFacing() < 0.22) {
      this._mode = null;
      this.onSymmetryHint('视角太侧,转到正面再画');
      return;
    }
    var hitId = this._pickStroke(p);
    if (hitId) this._pendingSelect = hitId;
  };

  DrawingRouter.prototype._move = function (e) {
    var rec = this._pointers.get(e.pointerId);
    if (!rec) return;
    var dx = e.clientX - rec.x, dy = e.clientY - rec.y;
    rec.x = e.clientX; rec.y = e.clientY;
    this.orbit.nudge();

    if (this._mode === 'orbit') {
      this.orbit.dragDelta(dx, dy);
      return;
    }
    if (this._mode === 'pinch') {
      var arr = Array.from(this._pointers.values());
      if (arr.length >= 2) {
        var d = Math.max(20, Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y));
        this.orbit.zoomBy(this._pinchD0 / d);
        this._pinchD0 = d;
      }
      return;
    }
    if (this._mode !== 'draw') return;

    if (!this._moved && Math.hypot(e.clientX - this._downXY.x, e.clientY - this._downXY.y) > 6) {
      this._moved = true;
      if (this._pendingSelect) {
        this.model.select(null);
        this._pendingSelect = null;
      }
      this._startStrokeAt(e);
    }
    if (this._pendingSelect) return; // 原地按住未动:保持选中预判

    this._addPoint(e);
  };

  DrawingRouter.prototype._up = function (e, cancel) {
    var had = this._pointers.delete(e.pointerId);
    try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) { /* 无碍 */ }

    if (this._pointers.size > 0 && this._mode === 'pinch') {
      // 抬起一指:退回单指(若剩余是鼠标/笔则结束视角)
      this._mode = null;
      this.orbit.endDrag();
      return;
    }
    if (!had) return;

    if (this._mode === 'orbit') { this._mode = null; this.orbit.endDrag(); return; }
    if (this._mode !== 'draw') { this._mode = null; return; }

    var wasSelect = this._pendingSelect && !this._moved;
    this._mode = null;
    if (cancel) { this._cancelStroke(); return; }
    if (wasSelect) {
      this.model.select(this._pendingSelect);
      this.onSelectionChange(this.model.selectedId);
      this._pendingSelect = null;
      return;
    }
    this._commitStroke();
  };

  // ---------- 笔画收集与预览 ----------
  DrawingRouter.prototype._startStrokeAt = function (e) {
    var p = this._toModel(e.clientX, e.clientY);
    if (!p) return;
    this._raw = [p];
    this._ensurePreview();
    this._schedulePreviewUpdate();
  };

  DrawingRouter.prototype._addPoint = function (e) {
    if (!this._raw.length) return;
    var p = this._toModel(e.clientX, e.clientY);
    if (!p) return;
    var last = this._raw[this._raw.length - 1];
    var minDist = this.strokeWidth * 0.14;
    if (Math.hypot(p.x - last.x, p.y - last.y) < minDist) return;
    this._raw.push(p);
    this._schedulePreviewUpdate();
  };

  DrawingRouter.prototype._ensurePreview = function () {
    if (this._preview) return;
    var mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.model.material);
    var mirror = new THREE.Mesh(new THREE.BufferGeometry(), this.model.material);
    mesh.renderOrder = 10; mirror.renderOrder = 10;
    this.model.inner.add(mesh);
    if (this.symmetry) this.model.inner.add(mirror); else mirror.visible = false;
    this._preview = { mesh: mesh, mirrorMesh: mirror };
  };

  DrawingRouter.prototype._schedulePreviewUpdate = function () {
    if (this._raf) return;
    var self = this;
    this._raf = requestAnimationFrame(function () {
      self._raf = 0;
      self._updatePreview();
    });
  };

  DrawingRouter.prototype._updatePreview = function () {
    if (!this._preview || this._raw.length < 1) return;
    var willClose = this._raw.length > 8 &&
      Math.hypot(this._raw[0].x - this._raw[this._raw.length - 1].x,
                 this._raw[0].y - this._raw[this._raw.length - 1].y) < this.strokeWidth * 0.9;

    if (this._preview.mesh.geometry) this._preview.mesh.geometry.dispose();
    this._preview.mesh.geometry = SigilGeom.build(this._raw, this.strokeWidth, { closed: willClose, radialSegs: 16 });

    if (this.symmetry) {
      if (this._preview.mirrorMesh.geometry) this._preview.mirrorMesh.geometry.dispose();
      this._preview.mirrorMesh.geometry = SigilGeom.build(SigilGeom.mirrorStroke(this._raw), this.strokeWidth, { closed: willClose, radialSegs: 16 });
      this._preview.mirrorMesh.visible = true;
    }
  };

  DrawingRouter.prototype._cancelStroke = function () {
    if (this._preview) {
      this.model.inner.remove(this._preview.mesh);
      this.model.inner.remove(this._preview.mirrorMesh);
      this._preview.mesh.geometry.dispose();
      this._preview.mirrorMesh.geometry.dispose();
      this._preview = null;
    }
    this._raw = [];
  };

  DrawingRouter.prototype._commitStroke = function () {
    var raw = this._raw;
    if (raw.length < 2) { this._cancelStroke(); return; }
    var closed = raw.length > 8 &&
      Math.hypot(raw[0].x - raw[raw.length - 1].x, raw[0].y - raw[raw.length - 1].y) < this.strokeWidth * 0.9;
    // 太短的误触直接丢弃
    var len = 0;
    for (var i = 1; i < raw.length; i++) len += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
    if (!closed && len < this.strokeWidth * 1.6 && raw.length < 6) { this._cancelStroke(); return; }

    this._cancelStroke();
    this.model.select(null);
    var stroke = this.model.addStroke(raw, this.strokeWidth, closed, this.symmetry);
    this.onStrokeCommit(stroke);
  };

  // ---------- 选择拾取 ----------
  DrawingRouter.prototype._pickStroke = function (p) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < this.model.strokes.length; i++) {
      var s = this.model.strokes[i];
      var sets = [s.pts];
      if (s.mirrorOf) sets.push(SigilGeom.mirrorStroke(s.pts));
      for (var g = 0; g < sets.length; g++) {
        var pts = sets[g];
        var d = distToPolyline(p, pts);
        var thresh = Math.max(s.width, 0.09) * 0.85;
        if (d < thresh && d < bestD) { bestD = d; best = s.id; }
      }
    }
    return best;
  };

  function distToPolyline(p, pts) {
    var min = Infinity;
    for (var i = 1; i < pts.length; i++) {
      var ax = pts[i - 1].x, ay = pts[i - 1].y;
      var bx = pts[i].x, by = pts[i].y;
      var vx = bx - ax, vy = by - ay;
      var wx = p.x - ax, wy = p.y - ay;
      var L2 = vx * vx + vy * vy;
      var t = L2 > 0 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / L2)) : 0;
      var dx = ax + vx * t - p.x, dy = ay + vy * t - p.y;
      var d = Math.hypot(dx, dy);
      if (d < min) min = d;
    }
    return min;
  }

  DrawingRouter.prototype.setSymmetry = function (on) {
    this.symmetry = !!on;
    if (this._preview) {
      if (!on) this._preview.mirrorMesh.visible = false;
    }
  };

  DrawingRouter.prototype.dispose = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._cancelStroke();
  };

  global.SigilDrawing = DrawingRouter;
})(window);
