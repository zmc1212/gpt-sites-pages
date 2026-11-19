/* world.js — 程序化海岛世界
 * 岛体(径向高度场 + 值噪声)、沙滩、棕榈、礁石环、木码头、Joe 鱼摊、Marta 船具店、
 * 浮标、漂流木、云、海鸥、浅水环境鱼群,以及深海鲸跃彩蛋。
 * 全部几何用 three.js 基础体拼装,招牌文字用 Canvas 纹理,零外部资源。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;
  const SEED = 20260114;
  const ISLAND_R = 39;          // 岸线名义半径(噪声会造成 ±3 起伏)
  const REEF_R = 70;            // 礁石环中心半径(东 +X 方向弧段)

  const world = {
    obstacles: [],              // {x, z, r} 圆形碰撞体(船与行走共用)
    joeStand: { x: -34, z: 7 },
    martaShop: { x: -27, z: -9 },
    pier: { x0: -64, x1: -40, z: 0, halfW: 1.5, deckY: 1.62 },
    boatMooring: { x: -56, z: 4.5 },
    reefCenter: { x: REEF_R, z: 0 },

    group: null, clouds: [], gulls: [], ambientFish: [],
    whale: null, whaleTimer: 14, whaleAnim: -1,

    // ---------- 地形 ----------
    islandHeight(x, z) {
      const r = Math.sqrt(x * x + z * z);
      // 主丘:高斯衰减 + 方位噪声调制(岸线起伏)
      const az = Math.atan2(z, x);
      const mod = 0.72 + 0.5 * U.fbm2D(Math.cos(az) * 1.6 + 3, Math.sin(az) * 1.6 + 3, SEED);
      let h = 5.0 * Math.exp(-(r * r) / (26 * 26)) * mod - 0.62;
      // 滩肩加宽:岸线附近抬一点,形成可走沙滩
      h += 0.34 * U.smoothstep(ISLAND_R + 4, ISLAND_R - 2, r) * (1 - U.smoothstep(8, 20, r));
      // 细部起伏
      h += (U.fbm2D(x * 0.09 + 40, z * 0.09 + 40, SEED + 3) - 0.5) * 0.7 * U.smoothstep(2, 12, r);
      return h;
    },
    seabedHeight(x, z) {
      const r = Math.sqrt(x * x + z * z);
      if (r < ISLAND_R) return -0.45;
      const f = U.smoothstep(ISLAND_R, 120, r);
      return U.lerp(-0.4, -7.2, f) + (U.fbm2D(x * 0.05 + 80, z * 0.05 + 80, SEED + 9) - 0.5) * 1.4;
    },
    shoreRadius() { return ISLAND_R; },

    // ---------- 区域判定(钓鱼用,按水面点位) ----------
    zoneAt(x, z) {
      const r = Math.sqrt(x * x + z * z);
      const p = this.pier;
      if (x > p.x0 - 6 && x < p.x1 + 6 && Math.abs(z) < p.halfW + 5) return '码头';
      const dReef = Math.sqrt((x - this.reefCenter.x) ** 2 + (z - this.reefCenter.z) ** 2);
      if (dReef < 24) return '礁石';
      // 海湾:西南象限(225°~315°,即 z<0 为主),r<85
      const azd = (Math.atan2(z, x) + Math.PI * 2) % (Math.PI * 2);
      if (azd > Math.PI * 1.25 && azd < Math.PI * 1.75 && r < 85) return '海湾';
      if (r < ISLAND_R + 13) return '浅滩';
      if (r > 112) return '深海';
      return '近海';
    },

    init(scene) {
      this.group = new THREE.Group();
      scene.add(this.group);
      this.buildIsland();
      this.buildPalms();
      this.buildRocks();
      this.buildPier();
      this.buildStands();
      this.buildBuoys();
      this.buildBeachProps();
      this.buildClouds();
      this.buildGulls();
      this.buildAmbientFish();
      this.buildWhale();
    },

    // ---------- 岛体 ----------
    buildIsland() {
      const size = 190, seg = 100;
      const geo = new THREE.PlaneGeometry(size, size, seg, seg);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const sand = new THREE.Color(0xe9d8a6), grass = new THREE.Color(0x69a45c),
        grass2 = new THREE.Color(0x4c8a4a), rock = new THREE.Color(0x8d9089);
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const h = this.islandHeight(x, z);
        pos.setY(i, h);
        // 按高度配色:沙 → 草 → 岩(只在最高处露少量岩)
        if (h < 0.55) tmp.copy(sand);
        else if (h < 4.0) tmp.copy(grass).lerp(grass2, U.smoothstep(1.4, 4.0, h));
        else tmp.copy(grass2).lerp(rock, U.smoothstep(4.0, 5.4, h));
        // 水下部分压暗
        tmp.multiplyScalar(h < 0 ? U.lerp(0.7, 1, U.clamp((h + 1.2) / 1.2, 0, 1)) : 1);
        colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
      mesh.receiveShadow = true;
      this.group.add(mesh);
    },

    // ---------- 棕榈 ----------
    makePalm(rng) {
      const g = new THREE.Group();
      const leanA = rng.range(0, Math.PI * 2), lean = rng.range(0.05, 0.22);
      const segs = 5, segLen = 0.72;
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8a6a48 });
      let px = 0, py = segLen / 2, pz = 0;
      for (let i = 0; i < segs; i++) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.15 - i * 0.012, 0.18 - i * 0.012, segLen, 6), trunkMat);
        c.position.set(px, py, pz);
        c.rotation.x = Math.sin(leanA) * lean;
        c.rotation.z = Math.cos(leanA) * lean;
        px += Math.cos(leanA) * lean * segLen * 0.8;
        pz += Math.sin(leanA) * lean * segLen * 0.8;
        py += segLen;
        c.castShadow = true;
        g.add(c);
      }
      // 树冠:6-8 片下垂叶
      const topY = py + 0.1, topX = px, topZ = pz;
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x3e8f4d, side: THREE.DoubleSide });
      const leafGeo = new THREE.PlaneGeometry(0.85, 3.1, 1, 4);
      { // 把叶片弯成下垂弧
        const p = leafGeo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const y = p.getY(i); // -1.55..1.55
          p.setZ(i, -Math.pow((y + 1.55) / 3.1, 2) * 1.5);
        }
        leafGeo.computeVertexNormals();
      }
      const nLeaf = rng.int(6, 8);
      for (let i = 0; i < nLeaf; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const a = (i / nLeaf) * Math.PI * 2 + rng.range(-0.2, 0.2);
        leaf.position.set(topX, topY, topZ);
        leaf.rotation.y = a;
        leaf.rotation.x = -Math.PI / 2 + 0.55 + rng.range(-0.1, 0.15);
        leaf.castShadow = true;
        g.add(leaf);
      }
      // 椰子
      const cocoMat = new THREE.MeshLambertMaterial({ color: 0x6b4f30 });
      for (let i = 0; i < 2; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 6, 5), cocoMat);
        c.position.set(topX + rng.range(-0.25, 0.25), topY - 0.2, topZ + rng.range(-0.25, 0.25));
        g.add(c);
      }
      return g;
    },
    buildPalms() {
      const rng = U.seeded(SEED + 21);
      const spots = [];
      for (let i = 0; i < 26 && spots.length < 15; i++) {
        const a = rng.range(0, Math.PI * 2), r = rng.range(10, ISLAND_R - 8);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (this.islandHeight(x, z) < 0.8) continue;
        if (Math.hypot(x - this.joeStand.x, z - this.joeStand.z) < 6) continue;
        if (Math.hypot(x - this.martaShop.x, z - this.martaShop.z) < 6) continue;
        if (x < -30 && Math.abs(z) < 6) continue; // 避开码头步道
        spots.push([x, z]);
      }
      for (const [x, z] of spots) {
        const palm = this.makePalm(rng);
        palm.position.set(x, this.islandHeight(x, z) - 0.05, z);
        palm.rotation.y = rng.range(0, Math.PI * 2);
        this.group.add(palm);
      }
    },

    // ---------- 岩石(岛上 + 礁石环) ----------
    makeRock(rng, s) {
      const geo = new THREE.IcosahedronGeometry(s, 0);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        p.setXYZ(i, p.getX(i) * rng.range(0.8, 1.3), p.getY(i) * rng.range(0.6, 1.1), p.getZ(i) * rng.range(0.8, 1.3));
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshLambertMaterial({ color: rng.pick([0x8b9295, 0x7d8487, 0x9aa0a2]) });
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true; m.receiveShadow = true;
      return m;
    },
    buildRocks() {
      const rng = U.seeded(SEED + 33);
      // 礁石环(东向弧,半没入水)
      for (let i = 0; i < 22; i++) {
        const a = rng.range(-0.9, 0.9);
        const r = REEF_R + rng.range(-14, 16);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        const s = rng.range(1.6, 3.6);
        const rock = this.makeRock(rng, s);
        rock.position.set(x, U.lerp(-1.6, 0.7, rng()) , z);
        rock.rotation.y = rng.range(0, Math.PI * 2);
        this.group.add(rock);
        if (rock.position.y > -0.6) this.obstacles.push({ x, z, r: s * 1.1 });
      }
      // 岛上散石
      for (let i = 0; i < 10; i++) {
        const a = rng.range(0, Math.PI * 2), r = rng.range(8, ISLAND_R - 6);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (this.islandHeight(x, z) < 0.7) continue;
        const s = rng.range(0.5, 1.4);
        const rock = this.makeRock(rng, s);
        rock.position.set(x, this.islandHeight(x, z) + s * 0.2, z);
        rock.rotation.y = rng.range(0, Math.PI * 2);
        this.group.add(rock);
      }
    },

    // ---------- 木码头 ----------
    buildPier() {
      const p = this.pier;
      const g = new THREE.Group();
      const plankMat = new THREE.MeshLambertMaterial({ color: 0xa87848 });
      const postMat = new THREE.MeshLambertMaterial({ color: 0x7d5a38 });
      const len = p.x1 - p.x0; // 24
      const nPlank = Math.round(len / 1.1);
      for (let i = 0; i <= nPlank; i++) {
        const x = p.x0 + (i / nPlank) * len;
        const plank = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.12, p.halfW * 2), plankMat);
        plank.position.set(x, p.deckY - 0.06, 0);
        plank.castShadow = true; plank.receiveShadow = true;
        g.add(plank);
      }
      // 立柱
      for (let x = p.x0; x <= p.x1; x += 4.8) {
        for (const side of [-1, 1]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 4.4, 6), postMat);
          post.position.set(x, p.deckY - 2.3, side * (p.halfW - 0.15));
          post.castShadow = true;
          g.add(post);
        }
      }
      // 系船桩
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 6), postMat);
      bollard.position.set(p.x0 + 8, p.deckY + 0.3, p.halfW - 0.4);
      g.add(bollard);
      this.group.add(g);
      this.obstacles.push({ x: p.x0 - 1, z: 0, r: 3 }); // 码头尽头的柱体近似碰撞
    },

    // ---------- Joe 鱼摊 / Marta 船具店 ----------
    makeSign(text, sub, bg, fg) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 128);
      ctx.strokeStyle = fg; ctx.lineWidth = 5; ctx.strokeRect(8, 8, 240, 112);
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.font = 'bold 44px "PingFang SC", sans-serif';
      ctx.fillText(text, 128, sub ? 58 : 76);
      if (sub) {
        ctx.font = '22px sans-serif';
        ctx.fillText(sub, 128, 96);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      tex.encoding = THREE.sRGBEncoding;
      return tex;
    },
    makeHut(opts) {
      const g = new THREE.Group();
      const rng = U.seeded(opts.seed);
      // 平台
      const deck = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 5.4), new THREE.MeshLambertMaterial({ color: 0x9a7148 }));
      deck.position.y = 0.55; deck.castShadow = true; deck.receiveShadow = true;
      g.add(deck);
      // 立柱 + 顶
      const postMat = new THREE.MeshLambertMaterial({ color: 0x7d5a38 });
      for (const [sx, sz] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.8, 6), postMat);
        post.position.set(sx, 2.5, sz);
        post.castShadow = true;
        g.add(post);
      }
      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.0, 4), new THREE.MeshLambertMaterial({ color: opts.roof }));
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 5.2;
      roof.castShadow = true;
      g.add(roof);
      // 招牌
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8),
        new THREE.MeshBasicMaterial({ map: this.makeSign(opts.text, opts.sub, opts.signBg, opts.signFg), side: THREE.DoubleSide }));
      sign.position.set(0, 3.2, 2.75);
      g.add(sign);
      // 柜台
      const counter = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.9, 0.9), new THREE.MeshLambertMaterial({ color: 0xb98a55 }));
      counter.position.set(0, 1.3, 2.2);
      counter.castShadow = true;
      g.add(counter);
      // 零散杂物(木箱/桶)
      const crateMat = new THREE.MeshLambertMaterial({ color: 0x8a6a48 });
      for (let i = 0; i < opts.crates; i++) {
        const s = rng.range(0.5, 0.85);
        const crate = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), crateMat);
        crate.position.set(rng.range(-3.4, 3.4), 0.55 + s / 2, rng.range(-2.4, -0.5));
        crate.rotation.y = rng.range(0, Math.PI);
        crate.castShadow = true;
        g.add(crate);
      }
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.0, 8), new THREE.MeshLambertMaterial({ color: 0x6f7f66 }));
      barrel.position.set(rng.pick([-3.1, 3.1]), 1.05, rng.range(-1.5, 0));
      barrel.castShadow = true;
      g.add(barrel);
      return g;
    },
    buildStands() {
      const joe = this.makeHut({
        seed: 7, roof: 0xd65f4a, text: 'JOE 鱼摊', sub: '新鲜渔获 · 现收现付',
        signBg: '#f6f1e4', signFg: '#b34a35', crates: 3
      });
      joe.position.set(this.joeStand.x, this.islandHeight(this.joeStand.x, this.joeStand.z), this.joeStand.z);
      joe.rotation.y = Math.PI * 0.62; // 柜台面向沙滩
      this.group.add(joe);
      this.obstacles.push({ x: this.joeStand.x, z: this.joeStand.z, r: 3.6 });

      const marta = this.makeHut({
        seed: 11, roof: 0x3f7fa6, text: 'MARTA 船具店', sub: '线 · 轮 · 竿 · 灯',
        signBg: '#103438', signFg: '#7fd4dc', crates: 2
      });
      marta.position.set(this.martaShop.x, this.islandHeight(this.martaShop.x, this.martaShop.z), this.martaShop.z);
      marta.rotation.y = Math.PI * 0.3;
      this.group.add(marta);
      this.obstacles.push({ x: this.martaShop.x, z: this.martaShop.z, r: 3.6 });
    },

    // ---------- 浮标(区域标记) ----------
    buildBuoys() {
      const defs = [
        { x: REEF_R - 24, z: -6, label: '礁石' },
        { x: 118, z: 22, label: '深海' },
        { x: -52, z: -62, label: '海湾' },
        { x: 20, z: 58, label: '浅滩' }
      ];
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd6453a });
      const topMat = new THREE.MeshLambertMaterial({ color: 0xf6f1e4 });
      this.buoys = [];
      for (const d of defs) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), bodyMat);
        body.scale.y = 1.3; body.castShadow = true;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 5), topMat);
        pole.position.y = 1.0;
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ color: 0xf2a53a, side: THREE.DoubleSide }));
        flag.position.set(0.35, 1.6, 0);
        g.add(body, pole, flag);
        g.position.set(d.x, 0, d.z);
        this.group.add(g);
        this.buoys.push({ g, d });
      }
    },

    // ---------- 沙滩小物(漂流木 / 贝壳) ----------
    buildBeachProps() {
      const rng = U.seeded(SEED + 55);
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x9c8262 });
      for (let i = 0; i < 6; i++) {
        const a = rng.range(0, Math.PI * 2), r = rng.range(ISLAND_R - 6, ISLAND_R - 1);
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (this.islandHeight(x, z) < 0.15) continue;
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, rng.range(1.6, 2.8), 6), woodMat);
        log.rotation.z = Math.PI / 2;
        log.rotation.y = rng.range(0, Math.PI);
        log.position.set(x, this.islandHeight(x, z) + 0.15, z);
        log.castShadow = true;
        this.group.add(log);
      }
    },

    // ---------- 云 ----------
    buildClouds() {
      const rng = U.seeded(SEED + 77);
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, flatShading: true });
      this.cloudMat = mat;
      for (let i = 0; i < 7; i++) {
        const g = new THREE.Group();
        const n = rng.int(3, 5);
        for (let j = 0; j < n; j++) {
          const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(rng.range(3.5, 7), 0), mat);
          puff.scale.y = 0.45;
          puff.position.set(rng.range(-8, 8), rng.range(-1, 1.5), rng.range(-4, 4));
          g.add(puff);
        }
        const a = rng.range(0, Math.PI * 2), r = rng.range(90, 240);
        g.position.set(Math.cos(a) * r, rng.range(46, 84), Math.sin(a) * r);
        g.userData.speed = rng.range(0.5, 1.2);
        this.clouds.push(g);
        this.group.add(g);
      }
    },

    // ---------- 海鸥 ----------
    buildGulls() {
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf6f1e4 });
      const wingMat = new THREE.MeshLambertMaterial({ color: 0xe8e2d2, side: THREE.DoubleSide });
      for (let i = 0; i < 4; i++) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), bodyMat);
        body.scale.set(1.6, 1, 1);
        const wingGeo = new THREE.PlaneGeometry(1.3, 0.42);
        const wl = new THREE.Mesh(wingGeo, wingMat), wr = new THREE.Mesh(wingGeo, wingMat);
        wl.position.set(-0.68, 0.05, 0); wr.position.set(0.68, 0.05, 0);
        g.add(body, wl, wr);
        g.userData = { wl, wr, a: Math.random() * Math.PI * 2, r: 30 + i * 14, h: 12 + i * 4, speed: 0.25 + i * 0.05, flap: Math.random() * 10 };
        this.gulls.push(g);
        this.group.add(g);
      }
    },

    // ---------- 浅水环境鱼群(不可钓,只是氛围) ----------
    buildAmbientFish() {
      const rng = U.seeded(SEED + 91);
      const cols = [0xf2a53a, 0x2ea3b8, 0xe86a4a, 0x9fd44a];
      for (let i = 0; i < 9; i++) {
        const g = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: rng.pick(cols) });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), mat);
        body.scale.set(1.8, 0.9, 0.5);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 4), mat);
        tail.rotation.z = Math.PI / 2;
        tail.position.x = -0.3;
        g.add(body, tail);
        const a = rng.range(0, Math.PI * 2), r = rng.range(ISLAND_R + 3, ISLAND_R + 18);
        g.userData = { a, r, speed: rng.range(0.2, 0.5), depth: -rng.range(0.5, 1.2), flip: rng.chance(0.5) ? 1 : -1 };
        this.ambientFish.push(g);
        this.group.add(g);
      }
    },

    // ---------- 鲸跃彩蛋 ----------
    buildWhale() {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: 0x3d5566, flatShading: true });
      const belly = new THREE.MeshLambertMaterial({ color: 0x8ba3ad });
      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat);
      body.scale.set(3.4, 1.25, 1.15);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), belly);
      head.scale.set(1.5, 1.1, 1);
      head.position.x = 2.6;
      const tailGeo = new THREE.ConeGeometry(1.0, 1.6, 3);
      const tail = new THREE.Mesh(tailGeo, mat);
      tail.rotation.z = Math.PI / 2;
      tail.position.x = -3.4;
      tail.scale.set(1, 1, 0.25);
      const finL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.7), mat);
      finL.position.set(1.2, -0.4, 0.8);
      const finR = finL.clone(); finR.position.z = -0.8;
      g.add(body, head, tail, finL, finR);
      g.visible = false;
      g.scale.setScalar(4);
      this.whale = g;
      this.group.add(g);
    },

    triggerWhale() {
      if (this.whaleAnim >= 0) return;
      const rng = U.seeded((Math.random() * 1e9) | 0);
      const a = rng.range(0, Math.PI * 2), r = rng.range(115, 150);
      this.whale.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      this.whale.rotation.y = rng.range(0, Math.PI * 2);
      this.whaleAnim = 0;
      this.whale.visible = true;
      TW.audio.whale();
      if (TW.ui) TW.ui.toast('🐋 远处有鲸鱼跃出水面!');
    },
    updateWhale(dt) {
      if (this.whaleAnim < 0) return;
      this.whaleAnim += dt;
      const t = this.whaleAnim, D = 4.6;
      const k = t / D;
      if (k >= 1) {
        this.whale.visible = false;
        this.whaleAnim = -1;
        this.whaleTimer = U.rand.range(80, 150);
        return;
      }
      // 抛物线跃出:入水 → 升空 → 转体 → 入水
      const arc = Math.sin(k * Math.PI);
      this.whale.position.y = arc * 7 - 1.2;
      this.whale.rotation.z = U.lerp(0.9, -0.9, k);
      if (TW.water && Math.abs(this.whale.position.y) < 0.8 && Math.random() < 0.3) {
        TW.fx && TW.fx.splashAt && TW.fx.splashAt(this.whale.position.x, this.whale.position.z, 1.4);
      }
    },

    update(dt, t) {
      // 云漂移
      for (const c of this.clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 260) c.position.x = -260;
      }
      // 海鸥盘旋
      for (const g of this.gulls) {
        const u = g.userData;
        u.a += u.speed * dt;
        g.position.set(Math.cos(u.a) * u.r, u.h + Math.sin(u.a * 2.3) * 1.5, Math.sin(u.a) * u.r);
        g.rotation.y = -u.a + Math.PI / 2;
        u.flap += dt * 7;
        const f = Math.sin(u.flap) * 0.55;
        u.wl.rotation.z = f; u.wr.rotation.z = -f;
        if (Math.random() < dt * 0.06) TW.audio.gull();
      }
      // 环境鱼
      for (const f of this.ambientFish) {
        const u = f.userData;
        u.a += u.speed * dt * u.flip;
        f.position.set(Math.cos(u.a) * u.r, u.depth + Math.sin(u.a * 3) * 0.15, Math.sin(u.a) * u.r);
        f.rotation.y = -u.a + (u.flip > 0 ? Math.PI / 2 : -Math.PI / 2);
      }
      // 浮标浮动
      if (TW.water) {
        for (const b of this.buoys) {
          const { x, z } = b.d;
          b.g.position.y = TW.water.waveH(x, z) * 0.8 + 0.1;
          b.g.rotation.z = Math.sin(t * 1.4 + x) * 0.06;
        }
      }
      // 鲸跃计时
      this.updateWhale(dt);
      this.whaleTimer -= dt;
      if (this.whaleTimer <= 0) this.triggerWhale();
      // 夜间云变暗
      if (this.cloudMat && TW.daynight) {
        const l = TW.daynight.daylight;
        this.cloudMat.color.setScalar(U.lerp(0.22, 1, l));
      }
    }
  };

  TW.world = world;
})();
