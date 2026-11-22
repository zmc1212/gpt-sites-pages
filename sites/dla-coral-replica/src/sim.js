/* DLA(扩散限制聚集)模拟引擎 —— 题材复刻自 ekimroyrp/260716_DLACoral(MIT)的
   生长规则:元胞点阵行走者 + 邻域占用粘附 + 稀疏哈希 + 包裹统计。
   实现为原创的 plain-JS 版本:类型化数组 + 开放寻址哈希,决定论种子。 */
(function () {
  'use strict';

  const DC = (window.DC = window.DC || {});
  const { xorshift32, hashInt, nextPowerOfTwo } = DC.rng;

  const COORD_MIN = -512;
  const COORD_MAX = 511;

  /* ---------- 邻域偏移表 ---------- */
  function cubeOffsets() {
    const list = [];
    for (let z = -1; z <= 1; z++) for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
      if (x || y || z) list.push(x, y, z);
    }
    return list;
  }
  const FULL26 = cubeOffsets(); // 26 × 3
  const FACES6 = [];
  const EDGES18 = [];
  for (let i = 0; i < 26; i++) {
    const x = FULL26[i * 3], y = FULL26[i * 3 + 1], z = FULL26[i * 3 + 2];
    const manhattan = Math.abs(x) + Math.abs(y) + Math.abs(z);
    if (manhattan === 1) { FACES6.push(x, y, z); EDGES18.push(x, y, z); }
    else if (manhattan === 2) { EDGES18.push(x, y, z); }
  }
  function sphereOffsets(r) {
    const list = [];
    const r2 = r * r;
    for (let z = -r; z <= r; z++) for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d2 = x * x + y * y + z * z;
      if (d2 > 0 && d2 <= r2) list.push(x, y, z);
    }
    return list;
  }
  const RADIUS2 = sphereOffsets(2);
  const RADIUS3 = sphereOffsets(3);

  const NEIGHBORHOODS = {
    faces6:        { offsets: FACES6,  max: 6,   weighted: false, dynamic: false, extent: 1 },
    facesEdges18:  { offsets: EDGES18, max: 18,  weighted: false, dynamic: false, extent: 1 },
    full26:        { offsets: FULL26,  max: 26,  weighted: false, dynamic: false, extent: 1 },
    weightedFull26:{ offsets: FULL26,  max: 50,  weighted: true,  dynamic: false, extent: 1 },
    radius2:       { offsets: RADIUS2, max: 32,  weighted: false, dynamic: false, extent: 2 },
    radius3:       { offsets: RADIUS3, max: 122, weighted: false, dynamic: false, extent: 3 },
    surfaceHemisphere: { offsets: FULL26, max: 13, weighted: false, dynamic: 'hemisphere', extent: 1 },
    randomized:        { offsets: FULL26, max: 13, weighted: false, dynamic: 'randomized', extent: 1 },
  };

  function offsetWeight(x, y, z) {
    const m = Math.abs(x) + Math.abs(y) + Math.abs(z);
    return m === 1 ? 3 : m === 2 ? 2 : 1;
  }

  /* ---------- 细胞键打包(±512 → 30bit,0 作空槽哨兵) ---------- */
  function packKey(x, y, z) {
    return (((x + 512) | ((y + 512) << 10) | ((z + 512) << 20)) + 1) | 0;
  }

  /* ---------- 模拟器 ---------- */
  class Sim {
    constructor() {
      this.onAdd = null;      // (birth) => void
      this.onEnclose = null;  // (birth) => void
      this.onReset = null;
      this.state = null;
    }

    reset(s) {
      const target = Math.max(64, Math.min(60000, s.target | 0));
      const cap = nextPowerOfTwo(target * 1.5);
      const hashCap = nextPowerOfTwo(cap * 4);
      this.s = s;
      this.cap = cap;
      this.hashCap = hashCap;
      this.hashMask = hashCap - 1;
      this.hk = new Int32Array(hashCap);        // 0 = 空
      this.hv = new Uint32Array(hashCap);       // 出生序
      this.px = new Int32Array(cap);
      this.py = new Int32Array(cap);
      this.pz = new Int32Array(cap);
      this.nb = new Uint8Array(cap);            // full26 邻居数
      this.enclosed = new Uint8Array(cap);
      this.count = 0;
      this.maxR2 = 0;
      this.launchR = 4;
      this.killR = 8;
      this.skipZone2 = Infinity; // 外接球+邻域范围之外免粘附查询
      this.nbExtent = 1;
      this.seedCells = 0;
      this.sticksTotal = 0;
      // 自适应阈值:滚动窗口内见过的最大邻居数
      this.winN = 4096;
      this.win = new Uint8Array(this.winN);
      this.winPtr = 0;
      this.winMax = 0;
      this.winFill = 0;
      // 行走者
      const W = Math.max(64, Math.min(4096, s.walkers | 0));
      this.W = W;
      this.wx = new Int32Array(W);
      this.wy = new Int32Array(W);
      this.wz = new Int32Array(W);
      this.wr = new Uint32Array(W);             // 每行走者独立 rng 状态
      this.rng = (s.seed >>> 0) || 0x260716;
      this._seedAggregate();
      // 发射/击杀半径按种子正确初始化(否则球壳种子会困住行走者导致停滞)
      this.launchR = Math.max(2, this.seedLaunchR + this.launchPadCells());
      this.killR = this.launchR + (2 + Math.round(this.s.killPad | 0));
      this._refreshSkipZone();
      for (let i = 0; i < W; i++) {
        this.wr[i] = xorshift32((s.seed ^ Math.imul(i + 1, 0x9e3779b9)) >>> 0) || 0x1d8764c9;
        this._spawn(i);
      }
      if (this.onReset) this.onReset();
    }

    /* --- 种子聚合体:点 / 球壳 / 平环 --- */
    _seedAggregate() {
      const s = this.s;
      const r = Math.max(1, Math.round(s.seedRadius));
      this.seedLaunchR = r;
      if (s.shape === 'point') {
        this._addSeedCell(0, 0, 0);
        return;
      }
      const inner2 = (r - 0.5) * (r - 0.5);
      const outer2 = (r + 0.5) * (r + 0.5);
      const put = (x, y, z) => this._addSeedCell(x, y, z);
      if (s.shape === 'ring') {
        for (let z = -r; z <= r; z++) {
          const rem = outer2 - z * z;
          if (rem < 0) continue;
          const maxX = Math.floor(Math.sqrt(rem));
          const innerRem = inner2 - z * z;
          const minAbsX = innerRem > 0 ? Math.ceil(Math.sqrt(innerRem)) : 0;
          if (minAbsX === 0) { for (let x = -maxX; x <= maxX; x++) put(x, 0, z); }
          else {
            for (let x = -maxX; x <= -minAbsX; x++) put(x, 0, z);
            for (let x = minAbsX; x <= maxX; x++) put(x, 0, z);
          }
        }
      } else { // sphere
        for (let z = -r; z <= r; z++) for (let y = -r; y <= r; y++) {
          const yz2 = y * y + z * z;
          const rem = outer2 - yz2;
          if (rem < 0) continue;
          const maxX = Math.floor(Math.sqrt(rem));
          const innerRem = inner2 - yz2;
          const minAbsX = innerRem > 0 ? Math.ceil(Math.sqrt(innerRem)) : 0;
          if (minAbsX === 0) { for (let x = -maxX; x <= maxX; x++) put(x, y, z); }
          else {
            for (let x = -maxX; x <= -minAbsX; x++) put(x, y, z);
            for (let x = minAbsX; x <= maxX; x++) put(x, y, z);
          }
        }
      }
      if (this.count === 0) this._addSeedCell(r, 0, 0); // 极小半径兜底
      this._refreshSkipZone();
    }

    _refreshSkipZone() {
      this.nbExtent = (NEIGHBORHOODS[this.s.neighborhood] || NEIGHBORHOODS.full26).extent;
      const rMax = Math.ceil(Math.sqrt(this.maxR2));
      this.skipZone2 = (rMax + this.nbExtent + 1) * (rMax + this.nbExtent + 1);
    }

    _addSeedCell(x, y, z) {
      const i = this.count;
      this._insert(x, y, z, i);
      this.count = i + 1;
      this.px[i] = x; this.py[i] = y; this.pz[i] = z;
      const d2 = x * x + y * y + z * z;
      if (d2 > this.maxR2) this.maxR2 = d2;
    }

    _insert(x, y, z, birth) {
      const key = packKey(x, y, z);
      let slot = hashInt(key) & this.hashMask;
      for (let probe = 0; probe < this.hashCap; probe++) {
        if (this.hk[slot] === 0) { this.hk[slot] = key; this.hv[slot] = birth; return; }
        if (this.hk[slot] === key) { this.hv[slot] = birth; return; }
        slot = (slot + 1) & this.hashMask;
      }
      throw new Error('hash full');
    }

    _has(x, y, z) {
      if (x < COORD_MIN || x > COORD_MAX || y < COORD_MIN || y > COORD_MAX || z < COORD_MIN || z > COORD_MAX) return false;
      const key = packKey(x, y, z);
      let slot = hashInt(key) & this.hashMask;
      for (let probe = 0; probe < this.hashCap; probe++) {
        const k = this.hk[slot];
        if (k === 0) return false;
        if (k === key) return true;
        slot = (slot + 1) & this.hashMask;
      }
      return false;
    }

    /* full26 邻居计数(用于包裹统计) */
    _countFull26(x, y, z) {
      let n = 0;
      for (let i = 0; i < 78; i += 3) {
        if (this._has(x + FULL26[i], y + FULL26[i + 1], z + FULL26[i + 2])) n++;
      }
      return n;
    }

    /* 所选邻域的占用邻居计数;候选 cell 为未占用格 */
    _countNb(x, y, z, nbDef, candSeed) {
      let n = 0;
      if (nbDef.dynamic === 'hemisphere') {
        for (let i = 0; i < 78; i += 3) {
          const ox = FULL26[i], oy = FULL26[i + 1], oz = FULL26[i + 2];
          if (ox * x + oy * y + oz * z > 0 && this._has(x + ox, y + oy, z + oz)) n++;
        }
        return n;
      }
      if (nbDef.dynamic === 'randomized') {
        const seed = hashInt(candSeed);
        for (let j = 0; j < 13; j++) {
          const i = j * 3;
          const flip = (hashInt((seed ^ Math.imul(j + 1, 0x9e3779b9)) >>> 0) & 1) === 0;
          const ox = flip ? -FULL26[i] : FULL26[i];
          const oy = flip ? -FULL26[i + 1] : FULL26[i + 1];
          const oz = flip ? -FULL26[i + 2] : FULL26[i + 2];
          if (this._has(x + ox, y + oy, z + oz)) n++;
        }
        return n;
      }
      const off = nbDef.offsets;
      if (nbDef.weighted) {
        for (let i = 0; i < off.length; i += 3) {
          if (this._has(x + off[i], y + off[i + 1], z + off[i + 2])) n += offsetWeight(off[i], off[i + 1], off[i + 2]);
        }
        return n;
      }
      for (let i = 0; i < off.length; i += 3) {
        if (this._has(x + off[i], y + off[i + 1], z + off[i + 2])) n++;
      }
      return n;
    }

    /* --- 行走者:均匀球面发射(launchR = 最大半径 + 余量) ---
       经典 DLA 形态的关键:行走者必须靠随机扩散抵达聚合体表面,
       才会生成枝杈与峡湾;前沿偏置会让形态退化为致密球。 */
    _spawn(i) {
      const wr = this.wr[i] = xorshift32(this.wr[i]);
      const u1 = wr / 4294967296;
      const wr2 = xorshift32(this.wr[i]); this.wr[i] = wr2;
      const u2 = wr2 / 4294967296;
      const theta = Math.PI * 2 * u1;
      const cosPhi = 1 - 2 * u2;
      const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
      const radius = Math.max(2, this.launchR);
      let x = Math.round(sinPhi * Math.cos(theta) * radius);
      let y = Math.round(cosPhi * radius);
      let z = Math.round(sinPhi * Math.sin(theta) * radius);
      x = Math.max(COORD_MIN, Math.min(COORD_MAX, x));
      y = Math.max(COORD_MIN, Math.min(COORD_MAX, y));
      z = Math.max(COORD_MIN, Math.min(COORD_MAX, z));
      this.wx[i] = x; this.wy[i] = y; this.wz[i] = z;
    }

    launchPadCells() { return 1 + Math.round(this.s.launchPad | 0); }

    /* --- 单次行走者 tick:移动一步 + 粘附判定 --- */
    _walkerTick(i, nbDef, reqThreshold, out) {
      // 随机 26 邻域步进(均匀取样)
      const wr0 = this.wr[i] = xorshift32(this.wr[i]);
      const idx = Math.min(25, Math.floor((wr0 / 4294967296) * 26));
      let x = this.wx[i] + FULL26[idx * 3];
      let y = this.wy[i] + FULL26[idx * 3 + 1];
      let z = this.wz[i] + FULL26[idx * 3 + 2];
      // 越界 / 超出击杀半径 → 重生
      if (x < COORD_MIN || x > COORD_MAX || y < COORD_MIN || y > COORD_MAX || z < COORD_MIN || z > COORD_MAX) {
        this._spawn(i); return;
      }
      const d2 = x * x + y * y + z * z;
      if (d2 > this.killR * this.killR) { this._spawn(i); return; }
      this.wx[i] = x; this.wy[i] = y; this.wz[i] = z;
      if (out.sticks >= out.cap || this.count >= this.s.target) return;
      // 外接球+邻域范围之外不可能粘附,免查询快速路径
      if (d2 > this.skipZone2) return;
      // 粘附判定(仅未占用格)
      const wr1 = this.wr[i] = xorshift32(this.wr[i]);
      if (this._has(x, y, z)) return;
      const n = this._countNb(x, y, z, nbDef, (wr1 ^ (i * 0x85ebca6b)) >>> 0);
      // 记录进自适应窗口
      this.win[this.winPtr] = Math.min(255, n);
      this.winPtr = (this.winPtr + 1) % this.winN;
      if (this.winFill < this.winN) this.winFill++;
      if (n > this.winMax) this.winMax = n;
      else if (this.winFill === this.winN) {
        // 窗口满后周期性重扫避免过期峰值
        if ((this.winPtr & 255) === 0) {
          let mx = 0;
          for (let w = 0; w < this.winN; w++) if (this.win[w] > mx) mx = this.win[w];
          this.winMax = mx;
        }
      }
      let threshold = Math.max(1, Math.min(reqThreshold, this.winMax, nbDef.max));
      if (this.count < this.s.bootstrap) threshold = 1;
      if (n < threshold) return;
      if (this.s.stickChance < 1 && (wr1 / 4294967296) >= this.s.stickChance) return;
      // 粘附成功
      const birth = this.count;
      this._insert(x, y, z, birth);
      this.px[birth] = x; this.py[birth] = y; this.pz[birth] = z;
      this.count = birth + 1;
      this.sticksTotal++;
      const full = this._countFull26(x, y, z);
      this.nb[birth] = full;
      this.enclosed[birth] = full === 26 ? 1 : 0;
      if (d2 > this.maxR2) {
        this.maxR2 = d2;
        this.launchR = Math.max(this.seedLaunchR, Math.round(Math.sqrt(d2)) + this.launchPadCells());
        this.killR = this.launchR + (2 + Math.round(this.s.killPad | 0));
        this._refreshSkipZone();
      }
      // 邻居计数维护 + 包裹回调
      for (let q = 0; q < 78; q += 3) {
        const nx = x + FULL26[q], ny = y + FULL26[q + 1], nz = z + FULL26[q + 2];
        if (nx < COORD_MIN || nx > COORD_MAX || ny < COORD_MIN || ny > COORD_MAX || nz < COORD_MIN || nz > COORD_MAX) continue;
        const key = packKey(nx, ny, nz);
        let slot = hashInt(key) & this.hashMask;
        for (let probe = 0; probe < this.hashCap; probe++) {
          const hk = this.hk[slot];
          if (hk === 0) break;
          if (hk === key) {
            const j = this.hv[slot];
            this.nb[j]++;
            if (this.nb[j] === 26 && !this.enclosed[j]) {
              this.enclosed[j] = 1;
              if (this.onEnclose) this.onEnclose(j);
            }
            break;
          }
          slot = (slot + 1) & this.hashMask;
        }
      }
      out.sticks++;
      // 粘附后立即重生于发射球:每个行走者一次远场扩散至多贡献一颗粒子,
      // 否则行走者沿表面爬行连粘,形态退化为致密球而非分形珊瑚
      this._spawn(i);
      if (this.onAdd) this.onAdd(birth);
    }

    /* 主入口:每帧调用。ticks = 行走步数,stickCap = 本帧粘附上限(时间节奏由外层按 dt 累计) */
    step(ticks, stickCap) {
      const s = this.s;
      const nbDef = NEIGHBORHOODS[s.neighborhood] || NEIGHBORHOODS.full26;
      const out = { sticks: 0, cap: Number.isFinite(stickCap) ? Math.max(0, stickCap | 0) : Infinity };
      if (this.count >= s.target || out.cap === 0) return out;
      for (let t = 0; t < ticks; t++) {
        for (let i = 0; i < this.W; i++) {
          this._walkerTick(i, nbDef, Math.max(1, s.threshold | 0), out);
        }
        if (this.count >= s.target || out.sticks >= out.cap) break;
      }
      return out;
    }

    /* 快进:同步生长到指定粒子数(决定论,加载/自检用) */
    fastForward(targetCount) {
      const saveTarget = this.s.target;
      this.s.target = Math.min(this.cap, targetCount | 0);
      let guard = 0;
      while (this.count < this.s.target && guard++ < 20000) {
        this.step(4);
      }
      this.s.target = saveTarget;
    }
  }

  DC.NEIGHBORHOODS = NEIGHBORHOODS;
  DC.Sim = Sim;
})();
