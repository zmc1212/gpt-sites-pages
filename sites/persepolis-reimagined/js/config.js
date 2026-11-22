// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)

export const CFG = {
  // 整体尺度(参照史实:台地约 450m × 300m,高出平原约 15m)
  terrace: { w: 450, d: 300, h: 15, cx: 0, cz: 0 },
  // 主双阶梯(西缘,自西向东登台)
  grandStair: {
    run: 62, // 水平长度
    cx: -225, // 台缘 x
    zCenter: 0,
    rampGap: 5, // 双坡道间间隔
    rampWidth: 11,
    parapetH: 1.7,
    steps: 60,
  },
  skyRadius: 2600,
  fogPlain: 0.0018,
  camera: { near: 0.5, far: 7000, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

// 建筑布局(供地图与漫游碰撞使用);rect = [cx, cz, w, d]
export const LAYOUT = [
  { id: 'gate', name: '万国门', en: 'Gate of All Nations', rect: [-160, -30, 34, 34], h: 9 },
  { id: 'apadana', name: '阿帕达纳宫', en: 'Apadana', rect: [-30, 45, 85, 85], h: 20 },
  { id: 'tripy', name: '三门厅', en: 'Tripylon', rect: [62, -18, 17, 17], h: 8 },
  { id: 'throne', name: '百柱厅', en: 'Hall of 100 Columns', rect: [140, 55, 75, 75], h: 23 },
  { id: 'treasury', name: '王室国库', en: 'Royal Treasury', rect: [148, 122, 110, 50], h: 10 },
  { id: 'tachara', name: '大流士宫', en: 'Palace of Darius', rect: [-178, -85, 36, 28], h: 11 },
  { id: 'hadish', name: '薛西斯宫', en: 'Palace of Xerxes', rect: [-42, -102, 44, 32], h: 12 },
  { id: 'harem', name: '后宫', en: 'Harem of Xerxes', rect: [-196, 55, 24, 64], h: 9 },
];

// 地图/漫游:主阶梯坡道区域(登台通道,行走时高度插值)
export function stairRamps() {
  const s = CFG.grandStair;
  const zHalf = (s.rampWidth + s.rampGap) / 2;
  return [
    { x0: s.cx - s.run, x1: s.cx, z0: s.zCenter - zHalf, z1: s.zCenter - s.rampGap / 2 },
    { x0: s.cx - s.run, x1: s.cx, z0: s.zCenter + s.rampGap / 2, z1: s.zCenter + zHalf },
  ];
}

export function inTerrace(x, z) {
  const t = CFG.terrace;
  return Math.abs(x - t.cx) <= t.w / 2 && Math.abs(z - t.cz) <= t.d / 2;
}

// 平面高度(自由漫游用):台内 15 / 坡道插值 / 台外平地 0
export function groundHeight(x, z, plainFn) {
  const t = CFG.terrace;
  if (inTerrace(x, z)) return t.h;
  for (const r of stairRamps()) {
    if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) {
      const k = (x - r.x0) / (r.x1 - r.x0);
      return t.h * k * k * (3 - 2 * k); // smoothstep 起步更缓
    }
  }
  return plainFn ? plainFn(x, z) : 0;
}

// 时间状态预设(preloader 夜→日、章节氛围)
export const DAY_STATES = {
  night: {
    az: 210, el: 42, sunColor: 0x8fa7d8, sunIntensity: 0.25,
    hemiSky: 0x2a3555, hemiGround: 0x1a1a22, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1220, fogDensity: 0.0042,
    top: 0x060a18, horizon: 0x1b2436, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 240, el: 12, sunColor: 0xffc48a, sunIntensity: 1.6,
    hemiSky: 0x9fb4d8, hemiGround: 0x6a5a44, hemiIntensity: 0.7, amb: 0.26,
    fogColor: 0xe8d9c0, fogDensity: 0.0030,
    top: 0x7e9bc4, horizon: 0xf2d9b0, sunGlow: 0.7, stars: 0.05, exposure: 1.05,
  },
  golden: {
    az: 262, el: 27, sunColor: 0xffdba8, sunIntensity: 2.9,
    hemiSky: 0xbfd0e8, hemiGround: 0x8a7355, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf3e4c8, fogDensity: 0.00135,
    top: 0x86a8d8, horizon: 0xf6dfb4, sunGlow: 0.55, stars: 0.0, exposure: 1.05,
  },
  afternoon: {
    az: 300, el: 38, sunColor: 0xfff2d4, sunIntensity: 3.1,
    hemiSky: 0xc9dcf2, hemiGround: 0x96805e, hemiIntensity: 0.9, amb: 0.32,
    fogColor: 0xf0e6d2, fogDensity: 0.00105,
    top: 0x6f9ade, horizon: 0xece0c8, sunGlow: 0.4, stars: 0.0, exposure: 1.02,
  },
  sunset: {
    az: 296, el: 8, sunColor: 0xffb36b, sunIntensity: 2.4,
    hemiSky: 0xd8b490, hemiGround: 0x7a5a40, hemiIntensity: 0.75, amb: 0.28,
    fogColor: 0xf0c9a0, fogDensity: 0.00068,
    top: 0x9a7aa8, horizon: 0xffb97a, sunGlow: 0.95, stars: 0.0, exposure: 1.18,
  },
};
