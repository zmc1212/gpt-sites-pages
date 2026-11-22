/* 第三人称跟随相机：始终保持世界朝上（不随表面翻转，防眩晕）；
 * 仅在近平地上自动跟到机头后方；碰撞几何拉进 + 地形地板钳制。
 */
'use strict';

window.SpiderLib = window.SpiderLib || {};
(function (L) {

  const V3 = L.V3;
  const clamp = L.clamp, wrapPi = L.wrapPi, terrainH = L.terrainH, castAll = L.castAll;

  L.SpiderCamera = class SpiderCamera {
    constructor(camera) {
      this.camera = camera;
      this.yaw = Math.PI; this.pitch = 0.5; this.dist = 15;
      this.target = V3(0, 2, 0);
    }
    addDrag(dx, dy) { this.yaw -= dx * 0.005; this.pitch = clamp(this.pitch - dy * 0.005, 0.06, 1.28); }
    zoom(deltaY) { this.dist = clamp(this.dist * (1 + deltaY * 0.0011), 6, 34); }

    update(dt, spider, dragging) {
      const moving = spider.curSpeed > 0.5;
      if (moving && !dragging && spider.up.y > 0.6) {
        const k = 1 - Math.pow(0.72, dt);
        this.yaw = this.yaw + wrapPi((spider.heading + Math.PI) - this.yaw) * k;   // 角度插值走最短弧
      }
      const cp = Math.cos(this.pitch); const tgt = spider.position;
      this.target.lerp(V3(tgt.x, tgt.y + 1.0, tgt.z), 1 - Math.pow(0.0007, dt));
      const want = V3(
        this.target.x + Math.sin(this.yaw) * cp * this.dist,
        this.target.y + Math.sin(this.pitch) * this.dist,
        this.target.z + Math.cos(this.yaw) * cp * this.dist,
      );
      const toC = want.clone().sub(this.target); const dC = toC.length() || 1e-3; toC.multiplyScalar(1 / dC);
      const hit = castAll(this.target.clone().addScaledVector(toC, 0.5), toC, dC);
      let wantDist = dC;
      if (hit && hit.t < dC - 0.4) wantDist = Math.max(hit.t - 0.6, 4.5);   // 不挤到憋屈的距离
      if (this._d == null) this._d = wantDist;
      // 拉进要快（防穿模）、退出要缓（防变焦跳变）
      const k = wantDist < this._d ? (1 - Math.pow(0.0006, dt)) : (1 - Math.pow(0.22, dt));
      this._d += (wantDist - this._d) * k;
      const camPos = this.target.clone().addScaledVector(toC, this._d);
      this.camera.position.lerp(camPos, 1 - Math.pow(0.0018, dt));
      const minY = terrainH(this.camera.position.x, this.camera.position.z) + 1.6;
      if (this.camera.position.y < minY) this.camera.position.y = minY;
      this.camera.lookAt(this.target);
    }
  };

})(window.SpiderLib);
