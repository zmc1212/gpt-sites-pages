/* 轨道相机:左键/单指旋转,滚轮/双指缩放,闲置自动环绕,随珊瑚生长自动取景。 */
(function () {
  'use strict';

  const DC = (window.DC = window.DC || {});

  class Controls {
    constructor(canvas, camera, getRadius) {
      this.canvas = canvas;
      this.camera = camera;
      this.getRadius = getRadius;
      this.theta = 0.72;
      this.phi = 1.14;          // 极角(0=顶, π=底)
      this.zoom = 1.0;
      this.dist = 18;
      this.autoRotate = true;
      this.idleT = 0;
      this._bind();
    }

    _bind() {
      const el = this.canvas;
      let dragging = false, lastX = 0, lastY = 0;
      const pointers = new Map();
      let pinchDist = 0;

      el.addEventListener('pointerdown', (e) => {
        el.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const p = [...pointers.values()];
          pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        }
        dragging = true; lastX = e.clientX; lastY = e.clientY;
        this.idleT = 0;
      });
      el.addEventListener('pointermove', (e) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const p = [...pointers.values()];
          const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
          if (pinchDist > 0) this.zoom = clamp(this.zoom * (pinchDist / Math.max(1, d)), 0.3, 4);
          pinchDist = d;
          this.idleT = 0;
          return;
        }
        if (!dragging) return;
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        this.theta -= dx * 0.0055;
        this.phi = clamp(this.phi - dy * 0.0045, 0.12, 1.52);
        this.idleT = 0;
      });
      const up = (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size === 0) dragging = false;
        pinchDist = 0;
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.zoom = clamp(this.zoom * Math.exp(e.deltaY * 0.0011), 0.3, 4);
        this.idleT = 0;
      }, { passive: false });
    }

    poke() { this.idleT = 0; }

    update(dt) {
      this.idleT += dt;
      if (this.autoRotate && this.idleT > 5) {
        this.theta += dt * 0.06;
      }
      const radius = Math.max(3, this.getRadius());
      const desired = radius * 3.4 * this.zoom + 7;
      this.dist += (desired - this.dist) * Math.min(1, dt * 1.8);
      const sinP = Math.sin(this.phi), cosP = Math.cos(this.phi);
      this.camera.position.set(
        this.dist * sinP * Math.sin(this.theta),
        this.dist * cosP,
        this.dist * sinP * Math.cos(this.theta)
      );
      this.camera.lookAt(0, 0, 0);
    }
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  DC.Controls = Controls;
})();
