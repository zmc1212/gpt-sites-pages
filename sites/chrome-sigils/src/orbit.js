/* chrome-sigils — 轨道相机状态(纯状态对象,零 DOM 监听)
 *
 * 指针事件由 drawing.js 统一路由:左键 / 触屏单指 = 绘制,
 * 右键 / 中键 / 触屏双指 = 相机(这里只接收 delta 与缩放因子)。
 * 拖动带惯性,怠速 5s 后缓慢自转,一有交互即停。
 */
(function (global) {
  'use strict';

  function OrbitState(opts) {
    opts = opts || {};
    this.target = new THREE.Vector3(0, 0, 0);
    this.yaw = opts.yaw !== undefined ? opts.yaw : -0.34;
    this.pitch = opts.pitch !== undefined ? opts.pitch : 0.10;
    this.radius = opts.radius || 4.8;
    this.minRadius = 2.1;
    this.maxRadius = 9;
    this.autoSpin = true;
    this._idleT = 0;
    this._velYaw = 0;
    this._velPitch = 0;
    this._dragging = false;
  }

  OrbitState.prototype._clampPitch = function (p) {
    return Math.max(-1.35, Math.min(1.35, p));
  };

  OrbitState.prototype.beginDrag = function () {
    this._dragging = true;
    this._velYaw = 0;
    this._velPitch = 0;
    this._idleT = 0;
  };

  OrbitState.prototype.dragDelta = function (dx, dy) {
    if (!this._dragging) return;
    this.yaw -= dx * 0.0052;
    this.pitch = this._clampPitch(this.pitch + dy * 0.0042);
    this._velYaw = -dx * 0.0052;
    this._velPitch = dy * 0.0042;
    this._idleT = 0;
  };

  OrbitState.prototype.endDrag = function () {
    this._dragging = false;
  };

  OrbitState.prototype.zoomBy = function (factor) {
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius * factor));
    this._idleT = 0;
  };

  OrbitState.prototype.nudge = function () {
    // 任何 UI 交互都重置怠速计时
    this._idleT = 0;
  };

  OrbitState.prototype.updateCamera = function (camera) {
    var cp = Math.cos(this.pitch);
    camera.position.set(
      this.target.x + this.radius * cp * Math.sin(this.yaw),
      this.target.y + this.radius * Math.sin(this.pitch),
      this.target.z + this.radius * cp * Math.cos(this.yaw)
    );
    camera.lookAt(this.target);
  };

  OrbitState.prototype.tick = function (dt, camera) {
    if (this._dragging) { this._idleT = 0; this.updateCamera(camera); return; }
    if (Math.abs(this._velYaw) > 1e-4 || Math.abs(this._velPitch) > 1e-4) {
      this.yaw += this._velYaw;
      this.pitch = this._clampPitch(this.pitch + this._velPitch);
      this._velYaw *= 0.90;
      this._velPitch *= 0.90;
      this.updateCamera(camera);
    }
    this._idleT += dt;
    if (this.autoSpin && this._idleT > 5) {
      this.yaw += dt * 0.10;
      this.updateCamera(camera);
    }
    this.updateCamera(camera);
  };

  global.SigilOrbit = OrbitState;
})(window);
