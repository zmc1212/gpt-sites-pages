/* water.js — 水中点缀粒子:装饰闪光片(随喷流起舞)+ 喷口气泡池。
 * 均为无碰撞装饰(与原作一致,装饰粒子不做碰撞以省算力)。
 */
(function () {
  'use strict';
  const WT = (window.WT = window.WT || {});
  const T = WT.geom;

  // ---- 贴图 ----
  function dotTexture() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 32;
    const g = cv.getContext('2d');
    const rg = g.createRadialGradient(16, 16, 0, 16, 16, 15);
    rg.addColorStop(0, 'rgba(255,255,255,1)');
    rg.addColorStop(0.45, 'rgba(255,255,255,.55)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(cv);
  }
  function bubbleTexture() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 48;
    const g = cv.getContext('2d');
    g.beginPath(); g.arc(24, 24, 20, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(230,248,255,.9)'; g.lineWidth = 3.5; g.stroke();
    const rg = g.createRadialGradient(24, 24, 2, 24, 24, 20);
    rg.addColorStop(0, 'rgba(255,255,255,.05)');
    rg.addColorStop(0.8, 'rgba(210,240,255,.14)');
    rg.addColorStop(1, 'rgba(255,255,255,.4)');
    g.fillStyle = rg; g.fill();
    g.beginPath(); g.arc(17, 17, 4.5, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
    return new THREE.CanvasTexture(cv);
  }

  class WaterFX {
    constructor(scene) {
      this.scene = scene;
      const dot = dotTexture();
      const bub = bubbleTexture();
      this.rng = Math.random;

      // ---- 闪光片(加色 sprite,~70 片) ----
      this.glitter = [];
      const gmat = new THREE.SpriteMaterial({
        map: dot, color: 0xbfe9ff, transparent: true, opacity: 0.75,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      for (let i = 0; i < 70; i++) {
        const s = new THREE.Sprite(gmat.clone());
        s.material.opacity = 0.25 + this.rng() * 0.5;
        const sc = 0.035 + this.rng() * 0.055;
        s.scale.set(sc, sc, 1);
        s.position.set((this.rng() * 2 - 1) * 1.35, (this.rng() * 2 - 1) * 1.8, (this.rng() * 2 - 1) * 0.55);
        s.renderOrder = 25;
        scene.add(s);
        this.glitter.push({
          spr: s,
          phase: this.rng() * Math.PI * 2,
          speed: 0.4 + this.rng() * 0.8,
          amp: 0.12 + this.rng() * 0.2,
        });
      }

      // ---- 气泡池(40 个,循环复用) ----
      this.bubbles = [];
      const bmat = new THREE.SpriteMaterial({
        map: bub, transparent: true, opacity: 0.85, depthWrite: false,
      });
      for (let i = 0; i < 40; i++) {
        const s = new THREE.Sprite(bmat.clone());
        s.visible = false;
        s.renderOrder = 26;
        scene.add(s);
        this.bubbles.push({ spr: s, life: 0, ttl: 0, vel: new THREE.Vector3(), size: 1 });
      }
      this.bubCursor = 0;
    }

    // 喷流激活时从喷口冒泡
    emitBubbles(side, strength) {
      const nz = T.nozzle[side === 'L' ? 0 : 1];
      const n = Math.round(2 + strength * 5);
      for (let i = 0; i < n; i++) {
        const b = this.bubbles[this.bubCursor];
        this.bubCursor = (this.bubCursor + 1) % this.bubbles.length;
        b.life = 0;
        b.ttl = 0.9 + this.rng() * 0.8;
        b.size = 0.05 + this.rng() * 0.09;
        b.spr.visible = true;
        b.spr.position.set(
          nz.x + (this.rng() - 0.5) * 0.12,
          nz.y + this.rng() * 0.1,
          nz.z + (this.rng() - 0.5) * 0.12);
        b.vel.set(
          nz.dir[0] * (1.4 + this.rng() * 1.6) + (this.rng() - 0.5) * 0.7,
          nz.dir[1] * (1.6 + this.rng() * 1.9),
          (this.rng() - 0.5) * 0.5);
        b.spr.scale.set(b.size, b.size, 1);
        b.spr.material.opacity = 0.9;
      }
    }

    update(dt, jetL, jetR) {
      // 闪光片:慢速呼吸漂移;喷流时上下翻腾
      for (const g of this.glitter) {
        g.phase += dt * g.speed;
        const p = g.spr.position;
        const jet = Math.max(jetL, jetR);
        p.y += Math.sin(g.phase * 1.7) * g.amp * dt * (1 + jet * 5) * 0.6;
        p.x += Math.cos(g.phase) * g.amp * dt * (1 + jet * 3) * 0.5;
        p.z += Math.sin(g.phase * 0.6) * g.amp * dt * (1 + jet * 3);
        // 喷流推着往上走
        p.y += jet * dt * 0.9 * (0.5 + this.rng());
        if (p.y > 1.85) p.y = -1.85;
        if (p.y < -1.85) p.y = 1.85;
        if (p.x > 1.38) p.x = -1.38; if (p.x < -1.38) p.x = 1.38;
        if (p.z > 0.58) p.z = -0.58; if (p.z < -0.58) p.z = 0.58;
      }
      // 气泡
      for (const b of this.bubbles) {
        if (!b.spr.visible) continue;
        b.life += dt;
        if (b.life > b.ttl) { b.spr.visible = false; continue; }
        b.vel.y += 1.6 * dt;             // 气泡加速上浮
        b.vel.multiplyScalar(Math.exp(-1.5 * dt));
        const p = b.spr.position;
        p.addScaledVector(b.vel, dt);
        p.x += Math.sin(b.life * 9) * 0.04 * dt * 10; // 蛇形上摆
        if (p.y > 1.8) { b.spr.visible = false; continue; }
        const k = b.life / b.ttl;
        const sc = b.size * (1 + k * 0.8);
        b.spr.scale.set(sc, sc, 1);
        b.spr.material.opacity = 0.9 * (1 - k);
      }
    }
  }

  WT.WaterFX = WaterFX;
})();
