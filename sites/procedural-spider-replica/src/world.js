/* 世界搭建：灯光、天空、地形网格、攀爬障碍与尘埃。
 *
 * 所有障碍物（塔阶/台阶路线/坡道/立柱/卵石）在放进场景的同时登记解析碰撞体，
 * 机身、脚点、相机共用同一套 castAll 查询。视觉与碰撞永远一致。
 */
'use strict';

window.SpiderLib = window.SpiderLib || {};
(function (L) {

  const TOUCH = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

  // 材质颜色统一 sRGB→线性（r149 + sRGB 输出 + ACES：不做会整体发灰发亮）
  function srgb(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

  L.World = class World {
    constructor(scene) {
      this.scene = scene;
      this.envGroup = new THREE.Group();
      scene.add(this.envGroup);
      L.clearColliders();
      this._lights();
      this._sky();
      this._terrain();
      this._environment();
      this._dust();
    }

    _lights() {
      const s = this.scene;
      s.add(new THREE.HemisphereLight(srgb(0x2fb8d8), srgb(0x2a1033), 0.85));
      s.add(new THREE.AmbientLight(srgb(0x20304a), 0.35));
      const sun = new THREE.DirectionalLight(srgb(0xffdfb0), 1.25);
      sun.position.set(46, 64, 32); sun.castShadow = true;
      sun.shadow.mapSize.set(TOUCH ? 1024 : 2048, TOUCH ? 1024 : 2048);
      sun.shadow.camera.near = 10; sun.shadow.camera.far = 240;
      sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
      sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
      s.add(sun); s.add(sun.target); this.sun = sun;
      const f1 = new THREE.DirectionalLight(srgb(0xff3bd4), 0.5); f1.position.set(-38, 22, -42); s.add(f1);
      const f2 = new THREE.DirectionalLight(srgb(0x22d3ee), 0.28); f2.position.set(8, 12, 40); s.add(f2);
    }

    _sky() {
      const c = document.createElement('canvas'); c.width = 16; c.height = 256;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#04050a'); g.addColorStop(0.45, '#0a1224'); g.addColorStop(0.78, '#0f2438'); g.addColorStop(0.93, '#173a4c'); g.addColorStop(1, '#0c1622');
      x.fillStyle = g; x.fillRect(0, 0, 16, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;              // 输出端会再编码，先声明纹理域
      this.scene.background = tex;
      const fog = new THREE.Fog(0x0e2230, 60, 190);
      fog.color.convertSRGBToLinear();                // 雾在着色器线性空间混合
      this.scene.fog = fog;
    }

    _terrain() {
      const seg = TOUCH ? 180 : 240;
      const g = new THREE.PlaneGeometry(L.FIELD, L.FIELD, seg, seg); g.rotateX(-Math.PI / 2);
      const p = g.attributes.position; let mn = 1e9, mx = -1e9;
      for (let i = 0; i < p.count; i++) { const y = L.terrainH(p.getX(i), p.getZ(i)); p.setY(i, y); if (y < mn) mn = y; if (y > mx) mx = y; }
      g.computeVertexNormals();
      const col = [], n = g.attributes.normal, tmp = new THREE.Color();
      const cLow = srgb(0x0c1720), cMid = srgb(0x1a3140), cHi = srgb(0x4c6d7c),
        cPk = srgb(0x8ab7c2), cRk = srgb(0x161c26), cGl = srgb(0x123a42);
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i), t = L.clamp01((y - mn) / (mx - mn + 1e-3)), sl = 1 - L.clamp01(n.getY(i));
        tmp.copy(cLow).lerp(cMid, L.clamp01(t * 1.8)).lerp(cHi, L.clamp01((t - 0.45) * 2.2))
          .lerp(cPk, L.clamp01((t - 0.78) * 3)).lerp(cRk, L.clamp01((sl - 0.35) * 2))
          .lerp(cGl, L.clamp01((0.16 - t) * 1.4) * 0.6);
        col.push(tmp.r, tmp.g, tmp.b);
      }
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      this.terrain = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.04 }));
      this.terrain.receiveShadow = true;
      this.scene.add(this.terrain);
    }

    // ---- 障碍物 + 解析碰撞体 ----
    _edgeLines(mesh, color, op) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: srgb(color), transparent: true, opacity: op || 0.45 }));
      e.position.copy(mesh.position); e.quaternion.copy(mesh.quaternion); e.scale.copy(mesh.scale);
      this.envGroup.add(e);
    }
    _boulder(x, z, r) {
      const y = L.terrainH(x, z);
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), this._matRock);
      m.position.set(x, y + r * 0.5, z); m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      m.castShadow = m.receiveShadow = true; this.envGroup.add(m);
      L.addSphere(L.V3(x, y + r * 0.5, z), r);
    }
    _box(cx, cy, cz, hx, hy, hz, q, color, emis) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2),
        new THREE.MeshStandardMaterial({ color: srgb(color || 0x1a2733), roughness: 0.7, metalness: 0.28, emissive: srgb(emis || 0x08222a), emissiveIntensity: emis ? 0.32 : 0.16, flatShading: true }));
      m.position.set(cx, cy, cz); if (q) m.quaternion.copy(q);
      m.castShadow = m.receiveShadow = true;
      this.envGroup.add(m); this._edgeLines(m, 0x22d3ee, 0.4);
      L.addBox(L.V3(cx, cy, cz), L.V3(hx, hy, hz), q);
    }
    _pillar(x, z, w, h) {
      const y = L.terrainH(x, z);
      const q = L.Q().setFromAxisAngle(L.Y_UP, Math.random() * L.TAU);
      this._box(x, y + h - 0.4, z, w, h, w * 0.8, q, 0x16304a, 0x1d6f86);
    }

    _environment() {
      const S = L.WORLD_SCALE;   // 所有道具位置/尺寸随世界统一缩放
      this._matRock = new THREE.MeshStandardMaterial({ color: srgb(0x1b2330), roughness: 0.92, metalness: 0.08, flatShading: true });
      // 可攀爬：层叠塔阶（四层收分，像一座小型金字形神塔）
      const zx = -15 * S, zz = -13 * S; let yy = L.terrainH(zx, zz) - 0.4 * S;
      for (const t of [[10, 1.0, 10], [7.4, 1.0, 7.4], [5, 1.05, 5], [3, 1.1, 3]]) {
        const h = t[1] * S;
        this._box(zx, yy + h, zz, t[0] * 0.5 * S, h, t[2] * 0.5 * S);
        yy += h * 2;
      }
      // 可攀爬：阶梯路线 + 高台
      const px = 17 * S, pz = 0;
      for (let i = 0; i < 6; i++) {
        const sx = px - (9 - i * 0.2) * S, sz = pz + (-5 + i * 2.0) * S, sy = L.terrainH(sx, sz) + (0.9 + i * 1.15) * S;
        this._box(sx, sy, sz, 1.7 * S, 0.9 * S, 1.3 * S);
      }
      this._box(px, L.terrainH(px, pz) + 7.2 * S, pz, 7 * S, 0.6 * S, 6 * S, null, 0x1a2c3c, 0x12506a);
      // 可攀爬：斜坡
      { const rx = -26 * S, rz = 8 * S, ry = L.terrainH(rx, rz); const q = L.Q().setFromAxisAngle(L.V3(0, 0, 1), 0.42); this._box(rx, ry + 2.1 * S, rz, 5.5 * S, 0.45 * S, 3 * S, q, 0x1d2c3a); }
      // 障碍：高立柱（垂直墙面）
      for (const p of [[20, -6, 2.4, 5.2], [-38, -30, 2.6, 5.5], [40, -8, 2.4, 5.0], [3, 44, 2.6, 6.0], [44, 36, 2.8, 5.5]]) this._pillar(p[0] * S, p[1] * S, p[2] * S, p[3] * S);
      // 挑战：卵石园（泊松式撒点防重叠）
      const gx = -6 * S, gz = 28 * S; const garden = []; let tries = 0;
      while (garden.length < 14 && tries < 500) {
        tries++;
        const a = Math.random() * L.TAU, rad = Math.random() * 12 * S;
        const x = gx + Math.cos(a) * rad, z = gz + Math.sin(a) * rad, r = (1.4 + Math.random() * 1.7) * S;
        let ok = true; for (const q of garden) { if (Math.hypot(q[0] - x, q[1] - z) < q[2] + r + 1.6 * S) { ok = false; break; } }
        if (!ok) continue; garden.push([x, z, r]); this._boulder(x, z, r);
      }
      for (const s of [[30, -30, 2.4], [-44, 12, 2.2], [12, -34, 2.0], [-26, -22, 2.4], [34, 20, 2.1], [-40, 40, 2.6], [22, -18, 1.8]])
        if (Math.hypot(s[0], s[1]) > 10) this._boulder(s[0] * S, s[1] * S, s[2] * S);
    }

    // ---- 落脚尘埃 ----
    _dust() {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(32, 32, 1, 32, 32, 31);
      g.addColorStop(0, 'rgba(180,220,235,.8)'); g.addColorStop(1, 'rgba(180,220,235,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(c);
      this.dust = [];
      for (let i = 0; i < 26; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        s.visible = false; this.scene.add(s);
        this.dust.push({ s, life: 1, max: 0.45, scl: 1 });
      }
      this._dustI = 0;
    }
    puff(pos) {
      const d = this.dust[this._dustI = (this._dustI + 1) % this.dust.length];
      d.s.position.copy(pos); d.life = 0; d.max = 0.4 + Math.random() * 0.2; d.scl = 0.7 + Math.random() * 0.6;
      d.s.visible = true; d.s.material.opacity = 0.5;
    }
    updateDust(dt) {
      for (const d of this.dust) {
        if (!d.s.visible) continue;
        d.life += dt; const t = d.life / d.max;
        if (t >= 1) { d.s.visible = false; continue; }
        d.s.scale.setScalar(L.lerp(0.4, 2.2, t) * d.scl); d.s.material.opacity = 0.5 * (1 - t);
      }
    }
  };

})(window.SpiderLib);
