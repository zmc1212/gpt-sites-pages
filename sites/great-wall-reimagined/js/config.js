// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 长城巡礼(金山岭意象):村径 → 敌楼 → 垛口墙顶 → 烽火台 → 望京楼 → 云海航拍

export const CFG = {
  skyRadius: 3200,
  fogPlain: 0.0009,
  camera: { near: 0.5, far: 8000, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

// ---- 山脊折线(墙线):点 [x, z, 峰顶高] ----
export const RIDGE_PTS = [
  [-60, -620, 40],
  [-10, -460, 95],
  [-90, -320, 140],
  [-30, -180, 185],
  [-140, -40, 230],
  [-80, 100, 275],
  [-170, 230, 320],
  [-90, 360, 360],
  [-20, 480, 330],
  [40, 600, 290],
];

// 墙顶标高(山脊顶 + 墙身高)
export const WALL_H = 7.2;

// 敌楼/烽火台落位(沿山脊)
export const STRUCTS = {
  towers: [
    { name: '敌楼·东五眼楼', x: -10, z: -460, crest: 95, w: 16, d: 15, h: 9.5 },
    { name: '敌楼·西五眼楼', x: -80, z: 100, crest: 275, w: 16, d: 15, h: 9.5 },
    { name: '望京楼', x: -90, z: 360, crest: 360, w: 18, d: 16, h: 11 },
  ],
  beacon: { name: '烽火台', x: -140, z: -40, crest: 230 },
  village: { name: '山脚村舍', x: 55, z: -590 },
  // 登城磴道(漫游坡道,升到墙顶)
  stairs: [
    { x0: -4, x1: 6, z0: -520, z1: -470, tower: 0, from: 'south' },
    { x0: -100, x1: -90, z0: 300, z1: 350, tower: 2, from: 'south' },
  ],
};

// ---- 山脊地形函数(最近折线段投影 + 侧向衰减 + 噪声) ----
export function ridgeInfo(x, z) {
  let best = null;
  for (let i = 0; i < RIDGE_PTS.length - 1; i++) {
    const a = RIDGE_PTS[i], b = RIDGE_PTS[i + 1];
    const ax = a[0], az = a[1], bx = b[0], bz = b[1];
    const dx = bx - ax, dz = bz - az;
    const len2 = dx * dx + dz * dz;
    let t = ((x - ax) * dx + (z - az) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = ax + dx * t, pz = az + dz * t;
    const d = Math.hypot(x - px, z - pz);
    if (!best || d < best.d) best = { d, t, h: a[2] + (b[2] - a[2]) * t };
  }
  return best || { d: 1e9, t: 0, h: 0 };
}

function n2(x, z) {
  return (Math.sin(x * 0.013 + 1.7) + Math.cos(z * 0.011 + 4.2)) * 0.5
       + Math.sin(x * 0.004 + z * 0.005 + 2.1) * 1.0;
}

// 山体高度(连续,可漫游;脊线处 = 峰顶高)
export function mountainHeight(x, z) {
  const r = ridgeInfo(x, z);
  const shoulder = Math.exp(-((r.d / 46) ** 2));
  let h = 6 + r.h * shoulder + n2(x, z) * 9 * (0.25 + 0.75 * (1 - shoulder));
  // 墙基带平整
  if (r.d < 7) h = r.h + n2(x, z) * 0.5;
  return h;
}

// 漫游平面高度:墙顶带(脊线 |d|<2.6)→ 墙顶;敌楼内 → 楼面;磴道 → 坡道;其余山体
export function groundHeight(x, z, plainFn) {
  const r = ridgeInfo(x, z);
  // 敌楼内部(楼面 = 墙顶)
  for (const t of STRUCTS.towers) {
    const dd = Math.hypot(x - t.x, z - t.z);
    if (dd < t.w / 2 - 0.5) return t.crest + WALL_H;
  }
  // 磴道(线性坡道,升到所属敌楼楼面)
  for (const s of STRUCTS.stairs) {
    if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1) {
      const k = s.from === 'south' ? (z - s.z0) / (s.z1 - s.z0) : 1;
      const tower = STRUCTS.towers[s.tower];
      const base = mountainHeight(s.x0, s.z0);
      return base + (tower.crest + WALL_H - base) * Math.min(1, Math.max(0, k));
    }
  }
  // 墙顶带
  if (r.d < 2.6) return r.h + WALL_H;
  return mountainHeight(x, z);
}

// 时间状态预设(山地天光;终章为暮色云海)
export const DAY_STATES = {
  night: {
    az: 200, el: 40, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3555, hemiGround: 0x1a1a22, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1420, fogDensity: 0.0022,
    top: 0x060a18, horizon: 0x1a2536, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 235, el: 11, sunColor: 0xffc9a0, sunIntensity: 1.7,
    hemiSky: 0xaab6cc, hemiGround: 0x5c5a48, hemiIntensity: 0.72, amb: 0.26,
    fogColor: 0xe4d4bc, fogDensity: 0.0013,
    top: 0x8698bc, horizon: 0xf4d6ac, sunGlow: 0.7, stars: 0.05, exposure: 1.06,
  },
  morning: {
    az: 200, el: 32, sunColor: 0xfff2dc, sunIntensity: 2.7,
    hemiSky: 0xbcd4e8, hemiGround: 0x7c7c5e, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xeee8d6, fogDensity: 0.0009,
    top: 0x8aa8d4, horizon: 0xf4e6c6, sunGlow: 0.5, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 170, el: 60, sunColor: 0xffffff, sunIntensity: 3.0,
    hemiSky: 0xd2e4f2, hemiGround: 0x8a8c68, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xf0eee4, fogDensity: 0.00065,
    top: 0x7ea8de, horizon: 0xeae6d2, sunGlow: 0.32, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 258, el: 20, sunColor: 0xffd9a0, sunIntensity: 2.9,
    hemiSky: 0xc6d4e4, hemiGround: 0x8e8a5e, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf4e4c4, fogDensity: 0.00085,
    top: 0x92a6ce, horizon: 0xf8dcae, sunGlow: 0.62, stars: 0.0, exposure: 1.06,
  },
  ember: {
    az: 292, el: 10, sunColor: 0xe8a878, sunIntensity: 2.0,
    hemiSky: 0xa898a0, hemiGround: 0x5c5048, hemiIntensity: 0.66, amb: 0.24,
    fogColor: 0xd8b090, fogDensity: 0.0018,
    top: 0x6a6886, horizon: 0xf0a870, sunGlow: 0.85, stars: 0.0, exposure: 1.12,
  },
};
